import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const paperStartRouter = Router();

console.log("[DEBUG] PaperStart router file loaded");

/**
 * POST /api/papers/start
 * Start a new paper or return existing draft for the same context
 */
paperStartRouter.post("/start", requireAuth, async (req, res) => {
  console.log("[DEBUG] POST /api/papers/start hit");
  const client = await db.pool.connect();

  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const { subject_code, subject_name, semester, exam_type, academic_year, department, regulation } = req.body;

    if (!subject_code || !semester || !exam_type) {
      return res.status(400).json({
        success: false,
        message: "subject_code, semester, and exam_type are required"
      });
    }

    // Check for existing DRAFT paper with same context
    const existingCheck = await client.query(
      `SELECT p.id AS paper_id, p.title, p.status, p.created_at,
                    cc.subject_code, cc.subject_name, cc.department,
                    cc.semester, cc.exam_type, cc.academic_year
             FROM papers p
             JOIN course_context cc ON cc.paper_id = p.id
             WHERE p.created_by = $1
               AND p.status = 'DRAFT'
               AND cc.subject_code = $2
               AND cc.semester = $3
               AND cc.exam_type = $4
            `,
      [ownerId, subject_code, semester, exam_type]
    );

    if (existingCheck.rows.length > 0) {
      const existing = existingCheck.rows[0];
      return res.status(200).json({
        success: true,
        message: "Existing draft found",
        data: {
          paper_id: existing.paper_id,
          title: existing.title,
          status: existing.status,
          context: {
            subject_code: existing.subject_code,
            subject_name: existing.subject_name,
            department: existing.department,
            semester: existing.semester,
            exam_type: existing.exam_type,
            academic_year: existing.academic_year
          },
          created_at: existing.created_at
        }
      });
    }

    // No existing draft — create new paper + context in a transaction
    await client.query("BEGIN");

    const paperTitle = `${subject_code} - ${exam_type} - ${semester}`;

    // Ensure we include context fields in papers table if they are NOT NULL there
    const paperResult = await client.query(
      `INSERT INTO papers
                (created_by, title, subject_code, subject_name, semester, exam_type, academic_year, regulation, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT')
             RETURNING *`,
      [
      ownerId,
      paperTitle,
      subject_code,
      subject_name || "",
      semester,
      exam_type,
      academic_year || "",
      regulation || ""]

    );

    const paperId = paperResult.rows[0].id;

    // Sync with course_context table - Ensure NO NULLS for NOT NULL columns
    await client.query(
      `INSERT INTO course_context
                (paper_id, subject_code, subject_name, department, semester, regulation, academic_year, exam_type, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
      paperId,
      subject_code,
      subject_name || "",
      department || "",
      semester,
      regulation || "",
      academic_year || "",
      exam_type,
      ownerId]

    );


    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "New paper created",
      data: {
        paper_id: paperId,
        title: paperTitle,
        status: "DRAFT",
        context: {
          subject_code,
          subject_name: subject_name || "",
          department: department || "",
          semester,
          exam_type,
          academic_year: academic_year || ""
        },
        created_at: paperResult.rows[0].created_at
      }
    });

  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {

      // Ignore rollback errors (e.g. if connection failed before BEGIN)
    }console.error("[PaperStart API] Detailed Error:", {
      message: error.message,
      detail: error.detail,
      hint: error.hint,
      code: error.code
    });
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + (error.detail || error.message)
    });
  } finally {
    client.release();
  }
});