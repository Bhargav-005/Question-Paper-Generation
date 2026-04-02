import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db.js";
import { mapTopicsToCOs } from "../services/mlService.js";

export const paperMLRouter = Router();

/**
 * POST /api/papers/:paperId/ml/map
 * Generate and store CO-Topic mappings for a specific paper
 */
paperMLRouter.post("/:paperId/ml/map", requireAuth, async (req, res) => {
  try {
    const { paperId } = req.params;
    const user = req.user;

    // 1. Fetch paper and validate ownership
    const paperResult = await db.query(
      "SELECT id, created_by, status FROM papers WHERE id = $1",
      [paperId]
    );

    if (paperResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }

    const paper = paperResult.rows[0];

    // 2. Strict ownership enforcement
    if (paper.created_by !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // 3. Prevent ML execution if paper status = 'FINALIZED'
    if (paper.status === "FINALIZED") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify finalized paper"
      });
    }

    // 4. Fetch Outcomes and Topics from DB
    const outcomesRes = await db.query(
      "SELECT id, outcome_text FROM paper_outcomes WHERE paper_id = $1",
      [paperId]
    );
    const topicsRes = await db.query(
      `SELECT t.id, t.topic_text 
             FROM syllabus_topics t
             JOIN syllabus_units u ON t.unit_id = u.id
             WHERE u.paper_id = $1`,
      [paperId]
    );

    if (outcomesRes.rows.length === 0 || topicsRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient data: Syllabus and Outcomes must be defined first"
      });
    }

    const outcomes = outcomesRes.rows;
    const topics = topicsRes.rows;

    // 5. Call ML microservice with text only
    const mappings = await mapTopicsToCOs(
      outcomes.map((o) => o.outcome_text),
      topics.map((t) => t.topic_text)
    );

    // 6. Transactional update: Delete previous and insert new
    await db.query("BEGIN");
    try {
      await db.query(
        "DELETE FROM co_topic_mappings WHERE paper_id = $1",
        [paperId]
      );

      for (const m of mappings) {
        // Find IDs back from text
        const coId = outcomes.find((o) => o.outcome_text === m.mapped_co)?.id;
        const topicId = topics.find((t) => t.topic_text === m.topic)?.id;

        if (coId && topicId) {
          await db.query(
            `INSERT INTO co_topic_mappings 
                         (paper_id, topic, mapped_co, confidence)
                         VALUES ($1, $2, $3, $4)`,
            [paperId, topicId, coId, m.confidence]
          );
        }
      }
      await db.query("COMMIT");
    } catch (err) {
      await db.query("ROLLBACK");
      throw err;
    }

    // 7. Return stored mappings grouped by CO (as expected by UI)
    const stored = await db.query(
      "SELECT * FROM co_topic_mappings WHERE paper_id = $1",
      [paperId]
    );

    const grouped = {};
    stored.rows.forEach((row) => {
      const coId = row.mapped_co;
      if (!grouped[coId]) grouped[coId] = [];
      grouped[coId].push({
        topicId: row.topic,
        similarity: row.confidence,
        status: row.approved ? 'approved' : 'pending'
      });
    });

    res.json({
      success: true,
      data: {
        coMappings: grouped
      }
    });

  } catch (error) {
    console.error("Paper ML mapping error:", error);
    res.status(500).json({
      success: false,
      message: "Paper ML processing error"
    });
  }
});