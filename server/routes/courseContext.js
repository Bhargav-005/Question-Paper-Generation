import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validatePaperId } from "../middleware/validate.js";

export const courseContextRouter = Router();

// Apply UUID validation to all routes that use :paperId
courseContextRouter.use("/:paperId", validatePaperId);

// GET /api/course-context/:paperId
courseContextRouter.get("/:paperId", requireAuth, async (req, res) => {
  try {
    const { paperId } = req.params;

    const result = await db.query(
      "SELECT * FROM course_context WHERE paper_id = $1",
      [paperId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course context not found",
        data: null
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("[CourseContext GET] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// POST /api/course-context/:paperId (UPSERT)
courseContextRouter.post("/:paperId", requireAuth, async (req, res) => {
  const { paperId } = req.params;
  const {
    subject_code,
    subject_name,
    semester,
    academic_year,
    exam_type,
    department,
    regulation
  } = req.body;

  try {
    const ownerId = req.user?.id;

    // 1. Verify paper existence and ownership
    const paperCheck = await db.query(
      "SELECT id FROM papers WHERE id = $1 AND created_by = $2",
      [paperId, ownerId]
    );

    if (paperCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Paper not found or access denied"
      });
    }

    // Use fallback empty strings for columns marked NOT NULL in DB
    await db.query(
      `
            INSERT INTO course_context 
                (paper_id, subject_code, subject_name, semester, academic_year, exam_type, department, regulation, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (paper_id) 
            DO UPDATE SET 
                subject_code = EXCLUDED.subject_code,
                subject_name = EXCLUDED.subject_name,
                semester = EXCLUDED.semester,
                academic_year = EXCLUDED.academic_year,
                exam_type = EXCLUDED.exam_type,
                department = EXCLUDED.department,
                regulation = EXCLUDED.regulation,
                updated_at = CURRENT_TIMESTAMP
            `,
      [
      paperId,
      subject_code,
      subject_name || "",
      semester,
      academic_year || "",
      exam_type,
      department || "",
      regulation || "",
      ownerId]

    );

    // Also sync basic paper details
    const paperTitle = `${subject_code} - ${exam_type} - ${semester}`;
    await db.query(
      `UPDATE papers 
             SET title = $1, subject_code = $2, subject_name = $3, semester = $4, exam_type = $5 
             WHERE id = $6`,
      [paperTitle, subject_code, subject_name || "", semester, exam_type, paperId]
    );

    res.json({
      success: true,
      message: "Course context updated successfully"
    });
  } catch (e) {
    console.error("[CourseContext UPSERT] Detailed Error:", {
      message: e.message,
      detail: e.detail,
      hint: e.hint,
      code: e.code
    });
    res.status(500).json({
      success: false,
      message: "Failed to save course context: " + (e.detail || e.message)
    });
  }
});


// GET /api/papers/:paperId/context - Legacy/Alternative endpoint matching some service calls
courseContextRouter.get("/:paperId/context", requireAuth, async (req, res) => {
  try {
    const { paperId } = req.params;
    const ownerId = req.user?.id;

    // Verify ownership (optional but good for security)
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

    const result = await db.query(
      "SELECT * FROM course_context WHERE paper_id = $1",
      [paperId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course context not found"
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("[CourseContext API] Get error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});