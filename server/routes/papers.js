import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validatePaperId } from "../middleware/validate.js";

export const papersRouter = Router();

// Apply validation to both :id and :paperId params
papersRouter.use("/:id", validatePaperId);

// POST /api/papers - Creates a new draft paper (Faculty only)
papersRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { title, subject_code, subject_name, department_id, semester, academic_year, exam_type, regulation } = req.body;
    const created_by = req.user?.id;

    if (!created_by) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Check if user is FACULTY
    if (req.user?.role !== 'FACULTY') {
      return res.status(403).json({ success: false, message: "Only faculty can create papers" });
    }

    // 1. Check if paper exists for this faculty and subject_code
    const existing = await db.query(
      "SELECT id FROM papers WHERE subject_code = $1 AND created_by = $2",
      [subject_code, created_by]
    );

    let paperId;
    if (existing.rows.length > 0) {
      // 2. UPDATE existing paper
      paperId = existing.rows[0].id;
      await db.query(
        `UPDATE papers 
                 SET subject_name = $1, 
                     semester = $2, 
                     academic_year = $3, 
                     exam_type = $4, 
                     regulation = $5,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6`,
        [
        subject_name,
        semester,
        academic_year,
        exam_type,
        regulation,
        paperId]

      );
    } else {
      // 3. INSERT new paper
      const result = await db.query(
        `INSERT INTO papers (
                    created_by, title, subject_code, subject_name, department_id, 
                    semester, academic_year, exam_type, regulation, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'DRAFT') RETURNING id`,
        [
        created_by,
        title || `${subject_code} - ${subject_name}`,
        subject_code,
        subject_name,
        department_id,
        semester,
        academic_year,
        exam_type,
        regulation]

      );
      paperId = result.rows[0].id;
    }

    return res.status(existing.rows.length > 0 ? 200 : 201).json({
      success: true,
      id: paperId,
      message: existing.rows.length > 0 ? "Paper updated successfully" : "Paper created successfully"
    });
  } catch (error) {
    console.error("[Papers API] Create error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/papers - Lists all papers belonging to logged-in faculty
papersRouter.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let query = "SELECT * FROM papers";
    let params = [];

    // Faculty can only access their own papers. Admin can access all.
    if (req.user?.role !== 'ADMIN') {
      query += " WHERE created_by = $1";
      params.push(userId);
    }

    query += " ORDER BY created_at DESC";

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("[Papers API] Fetch error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/papers/:id - Fetch single paper
papersRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await db.query("SELECT * FROM papers WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    const paper = result.rows[0];

    // Access Control: Must belong to user unless ADMIN
    if (req.user?.role !== 'ADMIN' && paper.created_by !== userId) {
      await db.query(
        "INSERT INTO audit_logs (action_type, admin_user, target_entity, status) VALUES ($1, $2, $3, $4)",
        ["Export Restricted", req.user?.name || req.user?.email || "Unknown", `Paper ID: ${id}`, "Blocked"]
      );
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({
      success: true,
      data: paper
    });
  } catch (error) {
    console.error("[Papers API] Fetch single paper error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});