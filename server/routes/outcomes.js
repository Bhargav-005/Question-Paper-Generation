import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validatePaperId } from "../middleware/validate.js";

export const outcomesRouter = Router();

outcomesRouter.use("/:paperId", validatePaperId);

// server/routes/outcomes.ts

// server/routes/outcomes.ts

outcomesRouter.get("/:paperId", requireAuth, async (req, res) => {
  try {
    const { paperId } = req.params;

    if (!paperId) {
      return res.status(400).json({ success: false, message: "Paper ID is required" });
    }

    const result = await db.query(
      "SELECT * FROM paper_outcomes WHERE paper_id = $1 ORDER BY outcome_code ASC",
      [paperId]
    );

    // Map storage columns (outcome_code, outcome_text) to frontend requested format (co_number, description)
    const data = result.rows.map((row) => ({
      co_number: row.outcome_code,
      description: row.outcome_text,
      bloom_level: row.bloom_level
    }));

    res.json({ success: true, data });
  } catch (e) {
    console.error("[Outcomes GET Error]:", e);
    res.status(500).json({ success: false, message: "Failed to fetch outcomes", error: e.message });
  }
});

outcomesRouter.post("/:paperId", requireAuth, async (req, res) => {
  const { paperId } = req.params;
  const { outcomes } = req.body;
  const userId = req.user?.id;

  console.log(`[Outcomes Post] Received request for Paper: ${paperId}`);

  // 1. Validate outcomes array
  if (!outcomes || !Array.isArray(outcomes) || outcomes.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Request must include a non-empty 'outcomes' array."
    });
  }

  const client = await db.pool.connect();
  try {
    // 2. Validate paper ownership
    const paperCheck = await client.query(
      "SELECT id FROM papers WHERE id = $1 AND created_by = $2",
      [paperId, userId]
    );

    if (paperCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied or paper not found."
      });
    }

    // 3. Strict transaction
    await client.query("BEGIN");
    console.log(`[Outcomes Post] Transaction Started for paper ${paperId}`);

    // 4. DELETE old outcomes for paper_id
    await client.query(
      "DELETE FROM paper_outcomes WHERE paper_id = $1",
      [paperId]
    );

    // 5. INSERT each outcome with defensive mapping
    for (let i = 0; i < outcomes.length; i++) {
      const co = outcomes[i];

      // Map strictly according to requirements:
      // Normalize frontend keys (co_number OR outcome_code, description OR outcome_text, bloomLevel OR bloom_level)
      let outcome_code = (co.co_number || co.outcome_code)?.toString();
      const outcome_text = co.description || co.outcome_text;
      const bloom_level = co.bloom_level || co.bloomLevel || 'L1';

      // Auto-generate if missing
      if (!outcome_code) {
        outcome_code = `CO${i + 1}`;
      }

      if (!outcome_text) {
        throw new Error(`Outcome at index ${i} is missing a description.`);
      }

      console.log(`[Outcomes Post] Inserting ${outcome_code} for paper ${paperId}`);

      await client.query(
        `
                INSERT INTO paper_outcomes
                (paper_id, outcome_code, outcome_text, bloom_level)
                VALUES ($1, $2, $3, $4)
                `,
        [paperId, outcome_code, outcome_text, bloom_level]
      );
    }

    // 6. COMMIT only if all inserts succeed
    await client.query("COMMIT");
    console.log(`[Outcomes Post] Transaction Committed for paper ${paperId}`);

    res.json({
      success: true,
      message: "Course Outcomes saved successfully."
    });

  } catch (e) {
    // 7. ROLLBACK on error
    await client.query("ROLLBACK").catch((err) => console.error("[Outcomes ROLLBACK Error]", err));

    console.error(`[Outcomes Save Error] Paper ${paperId}:`, e);

    res.status(500).json({
      success: false,
      message: "Failed to persist Course Outcomes to database.",
      error: e.message
    });
  } finally {
    client.release();
  }
});