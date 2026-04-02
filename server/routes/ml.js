import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db.js";
import { mapTopicsToCOs, clusterTopics, validateBloom } from "../services/mlService.js";
import { validatePaperId } from "../middleware/validate.js";
import { heavyServiceLimiter } from "../middleware/rateLimiter.js";

export const mlRouter = Router();

// Apply heavy limiter to all ML routes
mlRouter.use(heavyServiceLimiter);

mlRouter.use("/:paperId", validatePaperId);

/**
 * POST /api/ml/:paperId/ml/map
 *
 * Automatically generates CO-Syllabus mappings by fetching data from DB
 * and calling the ML microservice.
 */
mlRouter.post("/:paperId/ml/map", requireAuth, async (req, res) => {
  try {
    const { paperId } = req.params;
    const { threshold = 0.35 } = req.body;

    // 1. Verify paper ownership
    const paperCheck = await db.query(
      "SELECT id FROM papers WHERE id = $1 AND created_by = $2",
      [paperId, req.user?.id]
    );
    if (paperCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied or paper not found" });
    }

    // 2. Fetch Course Outcomes from DB
    const outcomesResult = await db.query(
      `SELECT id, outcome_code, outcome_text, bloom_level
             FROM paper_outcomes
             WHERE paper_id = $1
             ORDER BY outcome_code ASC`,
      [paperId]
    );
    if (outcomesResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No course outcomes found. Please define COs first."
      });
    }

    // 3. Fetch Syllabus Units & Topics from DB
    const unitsResult = await db.query(
      `SELECT id, unit_number, unit_title
             FROM syllabus_units
             WHERE paper_id = $1
             ORDER BY unit_number ASC`,
      [paperId]
    );

    if (unitsResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No syllabus units found. Please add syllabus first."
      });
    }

    const allTopics = [];
    for (const unit of unitsResult.rows) {
      const topicsResult = await db.query(
        `SELECT id, topic_text FROM syllabus_topics WHERE unit_id = $1 ORDER BY created_at ASC`,
        [unit.id]
      );
      for (const t of topicsResult.rows) {
        allTopics.push({
          id: t.id,
          unit: `Unit ${unit.unit_number}`,
          topic: t.topic_text
        });
      }
    }

    if (allTopics.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No topics found in syllabus units."
      });
    }

    // 4. Prepare data for ML service
    const coTexts = outcomesResult.rows.map((r) => r.outcome_text);
    const topicTexts = allTopics.map((t) => `${t.unit}: ${t.topic}`);

    // 5. Call ML Service
    const mlResult = await mapTopicsToCOs(coTexts, topicTexts, threshold);

    // 6. Format response for UI
    const coMappings = {};

    // Initialize mapping keys for all outcomes
    outcomesResult.rows.forEach((r) => {
      coMappings[r.id] = [];
    });

    if (mlResult?.per_co) {
      mlResult.per_co.forEach((coResult, coIdx) => {
        const coId = outcomesResult.rows[coIdx]?.id;
        if (!coId) return;

        coMappings[coId] = coResult.mapped_topics.map((mt) => {
          const topicObj = allTopics[mt.topic_index];
          return {
            topicId: topicObj?.id,
            topicText: topicObj?.topic,
            unit: topicObj?.unit,
            similarity: mt.confidence,
            status: "pending"
          };
        }).filter((m) => m.topicId);
      });
    }

    return res.json({
      success: true,
      data: {
        coMappings,
        totalCOs: outcomesResult.rows.length,
        totalTopics: allTopics.length,
        threshold
      }
    });

  } catch (error) {
    console.error("[ML Map Error]:", error);
    return res.status(500).json({
      success: false,
      message: "ML mapping failed: " + (error.message || "Unknown error")
    });
  }
});

/**
 * POST /api/ml/map (Generic)
 */
mlRouter.post("/map", requireAuth, async (req, res) => {
  try {
    const { courseOutcomes, syllabusTopics } = req.body;
    if (!courseOutcomes || !syllabusTopics) {
      return res.status(400).json({
        success: false,
        message: "courseOutcomes and syllabusTopics are required"
      });
    }
    const result = await mapTopicsToCOs(courseOutcomes, syllabusTopics);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("ML mapping error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ml/cluster
 */
mlRouter.post("/cluster", requireAuth, async (req, res) => {
  try {
    const { topics } = req.body;
    if (!topics) {
      return res.status(400).json({ success: false, message: "topics are required" });
    }
    const result = await clusterTopics(topics);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("ML clustering error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ml/validate-bloom
 */
mlRouter.post("/validate-bloom", requireAuth, async (req, res) => {
  try {
    const { question, targetLevel } = req.body;
    if (!question || !targetLevel) {
      return res.status(400).json({ success: false, message: "question and targetLevel are required" });
    }
    const result = await validateBloom(question, targetLevel);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("ML bloom validation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});