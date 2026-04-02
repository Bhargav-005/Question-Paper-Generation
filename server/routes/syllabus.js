import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validatePaperId } from "../middleware/validate.js";

export const syllabusRouter = Router();

syllabusRouter.use("/:paperId", validatePaperId);

console.log("[DEBUG] Syllabus router file loaded");

syllabusRouter.get("/:paperId", requireAuth, async (req, res) => {
  try {
    const { paperId } = req.params;

    const unitsResult = await db.query(
      "SELECT * FROM syllabus_units WHERE paper_id = $1 ORDER BY unit_number ASC",
      [paperId]
    );

    const data = [];
    for (const unit of unitsResult.rows) {
      const topicsResult = await db.query(
        "SELECT topic_text FROM syllabus_topics WHERE unit_id = $1 ORDER BY created_at ASC",
        [unit.id]
      );
      data.push({
        unit_number: unit.unit_number,
        unit_title: unit.unit_title,
        topics: topicsResult.rows.map((t) => t.topic_text)
      });
    }

    res.json({ success: true, data });
  } catch (e) {
    console.error("[Syllabus GET Error]:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

syllabusRouter.post("/:paperId", requireAuth, async (req, res) => {
  const { paperId } = req.params;
  const { units } = req.body;
  const userId = req.user?.id;

  // 1. Validate units
  if (!units || !Array.isArray(units) || units.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid syllabus data. 'units' must be a non-empty array."
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

    // Clear old units (cascade should handle topics, but we'll be safe if needed)
    // Note: syllabus_topics should be linked to syllabus_units by unit_id with ON DELETE CASCADE
    await client.query(
      "DELETE FROM syllabus_units WHERE paper_id = $1",
      [paperId]
    );

    for (const unit of units) {
      const unitRes = await client.query(
        `
                INSERT INTO syllabus_units (paper_id, unit_number, unit_title)
                VALUES ($1, $2, $3)
                RETURNING id
                `,
        [paperId, unit.unit_number, unit.unit_title]
      );

      const unitId = unitRes.rows[0].id;

      if (unit.topics && Array.isArray(unit.topics)) {
        for (const topic of unit.topics) {
          await client.query(
            `
                        INSERT INTO syllabus_topics (unit_id, topic_text)
                        VALUES ($1, $2)
                        `,
            [unitId, topic]
          );
        }
      }
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Syllabus saved successfully" });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("[Syllabus Save Error]:", e);
    res.status(500).json({ success: false, message: "Internal server error: Failed to save syllabus", error: e.message });
  } finally {
    client.release();
  }
});

/**
 * Helper: Convert Roman numeral to integer
 */
function romanToInt(roman) {
  const map = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000
  };
  let result = 0;
  const upper = roman.toUpperCase().trim();
  for (let i = 0; i < upper.length; i++) {
    const current = map[upper[i]] || 0;
    const next = map[upper[i + 1]] || 0;
    if (current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  return result;
}

/**
 * Helper: Parse unit number from string (supports Arabic and Roman)
 */
function parseUnitNumber(raw) {
  const trimmed = raw.trim();
  // Try Arabic number first
  const arabic = parseInt(trimmed, 10);
  if (!isNaN(arabic)) return arabic;
  // Try Roman numeral
  if (/^[IVXLCDM]+$/i.test(trimmed)) {
    return romanToInt(trimmed);
  }
  return 0;
}

/**
 * Helper: Parse raw syllabus text into structured units and topics
 *
 * Expected patterns:
 *   UNIT I - Title
 *   UNIT 1: Title
 *   Unit II Title
 *   Followed by topics separated by dashes, periods, semicolons, or newlines
 */
function parseRawSyllabus(rawText)



{

  const lines = rawText.split(/\r?\n/);

  const units =



  [];

  const unitHeaderRegex = /^UNIT\s+([IVXLCDM]+|\d+)\s*[-:–]?\s*(.*)/i;

  let currentUnit =



  null;

  let expectingTitle = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(unitHeaderRegex);

    // UNIT HEADER DETECTED
    if (match) {

      if (currentUnit) {
        units.push(currentUnit);
      }

      const unitNum = parseUnitNumber(match[1]);

      currentUnit = {
        unit_number: unitNum,
        unit_title: "", // don't default here
        topics: []
      };

      expectingTitle = true;
      continue;
    }

    // CAPTURE UNIT TITLE (first non-empty line after UNIT header)
    if (currentUnit && expectingTitle) {
      currentUnit.unit_title = trimmed;
      expectingTitle = false;
      continue;
    }

    // CAPTURE TOPICS
    if (currentUnit) {

      // Split on: space-dash-space, semicolons, or period-before-uppercase
      // but NOT on hyphens inside words like "K-means" or "Back-propagation"
      const topicFragments = trimmed.
      split(/\s+-\s+|;\s*|\.(?=\s+[A-Z])/).
      map((t) => t.trim()).
      filter((t) => t.length > 0);

      for (const fragment of topicFragments) {

        const cleaned = fragment.
        replace(/^[\d.\-–•*]+\s*/, '') // remove leading bullets/numbers
        .replace(/,\s*$/, '') // remove trailing commas
        .replace(/\s+/g, ' ') // normalize whitespace
        .trim();

        // Must have at least 4 chars AND contain real alphabetic words
        // This kills fragments like "off," "K" ";" etc.
        const isMeaningful = cleaned.length >= 4 && /[a-zA-Z]{2,}/.test(cleaned);

        if (!isMeaningful) continue;

        // Merge single-word orphan fragments with previous topic
        // e.g. "K" from "K-Means" being split incorrectly
        const wordCount = cleaned.split(/\s+/).length;
        const isOrphan = wordCount === 1 && cleaned.length <= 5;

        if (isOrphan && currentUnit.topics.length > 0) {
          currentUnit.topics[currentUnit.topics.length - 1] += ", " + cleaned;
        } else {
          currentUnit.topics.push(cleaned);
        }
      }
    }
  }

  if (currentUnit) {
    units.push(currentUnit);
  }

  return units;
}

/**
 * POST /api/papers/:paperId/syllabus/raw
 * Parse raw syllabus text and store structured units + topics
 */
syllabusRouter.post("/:paperId/syllabus/raw", requireAuth, async (req, res) => {
  console.log("[DEBUG] POST /:paperId/syllabus/raw hit");
  const client = await db.pool.connect();

  try {
    const { paperId } = req.params;
    const ownerId = req.user?.id;
    const { raw_text } = req.body;

    if (!raw_text || typeof raw_text !== "string") {
      return res.status(400).json({
        success: false,
        message: "raw_text is required and must be a string"
      });
    }

    // Verify paper ownership
    const paperCheck = await client.query(
      "SELECT id FROM papers WHERE id = $1 AND created_by = $2",
      [paperId, ownerId]
    );

    if (paperCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Parse the raw text
    const parsedUnits = parseRawSyllabus(raw_text);

    if (parsedUnits.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Could not parse any units from the provided text. Ensure format includes 'UNIT I - Title' headers."
      });
    }

    // BEGIN transaction
    await client.query("BEGIN");

    // Delete existing units (cascade deletes topics)
    await client.query(
      "DELETE FROM syllabus_units WHERE paper_id = $1",
      [paperId]
    );

    const resultUnits =



    [];

    for (const unit of parsedUnits) {
      // Insert unit
      const unitResult = await client.query(
        "INSERT INTO syllabus_units (paper_id, unit_number, unit_title) VALUES ($1, $2, $3) RETURNING *",
        [paperId, unit.unit_number, unit.unit_title]
      );

      const unitId = unitResult.rows[0].id;
      const insertedTopics = [];

      // Insert topics
      for (const topicText of unit.topics) {
        await client.query(
          "INSERT INTO syllabus_topics (unit_id, topic_text) VALUES ($1, $2)",
          [unitId, topicText]
        );
        insertedTopics.push(topicText);
      }

      resultUnits.push({
        unit_number: unit.unit_number,
        unit_title: unit.unit_title,
        topics: insertedTopics
      });
    }

    // COMMIT
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: `Parsed ${resultUnits.length} units successfully`,
      data: {
        paper_id: paperId,
        units: resultUnits
      }
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[Syllabus API] Parse/save error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/papers/:paperId/syllabus
 * Return structured syllabus with units and topics
 */
syllabusRouter.get("/:paperId/syllabus", requireAuth, async (req, res) => {
  console.log("[DEBUG] GET /:paperId/syllabus hit");

  try {
    const { paperId } = req.params;
    const ownerId = req.user?.id;

    // Verify ownership
    const paperCheck = await db.query(
      "SELECT id FROM papers WHERE id = $1 AND created_by = $2",
      [paperId, ownerId]
    );

    if (paperCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Fetch units
    const unitsResult = await db.query(
      "SELECT * FROM syllabus_units WHERE paper_id = $1 ORDER BY unit_number ASC",
      [paperId]
    );

    if (unitsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found for this paper"
      });
    }

    // Fetch topics for each unit
    const units = [];
    for (const unit of unitsResult.rows) {
      const topicsResult = await db.query(
        "SELECT * FROM syllabus_topics WHERE unit_id = $1 ORDER BY created_at ASC",
        [unit.id]
      );

      units.push({
        id: unit.id,
        unit_number: unit.unit_number,
        unit_title: unit.unit_title,
        topics: topicsResult.rows.map((t) => ({
          id: t.id,
          topic_text: t.topic_text
        }))
      });
    }

    return res.json({
      success: true,
      data: {
        paper_id: paperId,
        units
      }
    });

  } catch (error) {
    console.error("[Syllabus API] Get error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});