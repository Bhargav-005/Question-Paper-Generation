import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";

export const adminRouter = Router();

// Helper for audit logging
async function createAuditLog({ action_type, admin_user, target_entity, status }) {
  try {
    await db.query(
      "INSERT INTO audit_logs (action_type, admin_user, target_entity, status) VALUES ($1, $2, $3, $4)",
      [action_type, admin_user, target_entity, status]
    );
  } catch (error) {
    console.error("[AUDIT LOG] Error creating log:", error);
  }
}

// Get Audit Logs
adminRouter.get(
  "/audit-logs",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const { search, start_date, end_date } = req.query;
      let query = "SELECT * FROM audit_logs WHERE 1=1";
      const values = [];
      let index = 1;

      if (search) {
        query += ` AND (action_type ILIKE $${index} OR admin_user ILIKE $${index} OR target_entity ILIKE $${index})`;
        values.push(`%${search}%`);
        index++;
      }

      if (start_date) {
        query += ` AND timestamp >= $${index}`;
        values.push(start_date);
        index++;
      }

      if (end_date) {
        query += ` AND timestamp <= $${index}`;
        values.push(end_date);
        index++;
      }

      query += " ORDER BY timestamp DESC";

      const result = await db.query(query, values);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error("[ADMIN] Fetch audit logs error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// Export Audit Logs CSV
adminRouter.get(
  "/audit-logs/export",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const result = await db.query("SELECT action_type, admin_user, target_entity, status, timestamp FROM audit_logs ORDER BY timestamp DESC");
      
      let csv = "Action Type,Admin User,Target Entity,Status,Timestamp\n";
      result.rows.forEach(row => {
        csv += `"${row.action_type}","${row.admin_user}","${row.target_entity || ''}","${row.status}","${row.timestamp.toISOString()}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs_export.csv');
      res.send(csv);
    } catch (error) {
      console.error("[ADMIN] Export audit logs error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// Get Dashboard Statistics
adminRouter.get(
  "/dashboard",
  requireAuth,
  requireRole(["ADMIN"]),
  getAdminDashboard
);

console.log("[DEBUG] Admin router file loaded");

// Create User (Faculty)
adminRouter.post(
  "/users",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    console.log("[DEBUG] Admin create user endpoint hit");
    try {
      const { name, email, password, role, department_id } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email and password required"
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid email address"
        });
      }

      // Institutional email restriction (@gmrit.edu.in)
      const institutionalEmail = email.trim().toLowerCase();
      if (!institutionalEmail.endsWith("@gmrit.edu.in")) {
        return res.status(400).json({
          success: false,
          message: "Only institutional email (@gmrit.edu.in) is allowed"
        });
      }

      // Password complexity validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must meet complexity requirements"
        });
      }

      const existing = await db.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User already exists"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Handle optional department_id (if not provided, insert NULL)
      const deptId = department_id || null;

      await db.query(
        `INSERT INTO users (name, email, password, role, department_id, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')`,
        [name, email, hashedPassword, role || 'FACULTY', deptId]
      );

      await createAuditLog({
        action_type: "Faculty Created",
        admin_user: req.user.name || req.user.email,
        target_entity: name,
        status: "Success"
      });

      return res.status(201).json({
        success: true,
        message: "Faculty created successfully"
      });

    } catch (error) {
      console.error("Admin create faculty error:", error);
      await createAuditLog({
        action_type: "Faculty Creation Failed",
        admin_user: req.user?.email || "Unknown",
        target_entity: req.body?.name || "Unknown",
        status: "Failure"
      });
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);

// Get Users (Faculty)
adminRouter.get(
  "/users",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const { role, department_id } = req.query;

      let query = `
      SELECT 
        u.id,
        u.name AS full_name,
        u.email,
        u.role,
        u.status,
        d.name AS department,
        u.department_id
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;

      const values = [];
      let index = 1;

      // Filter by role
      if (role) {
        query += ` AND u.role = $${index}`;
        values.push(role);
        index++;
      }

      // Filter by department_id
      if (department_id) {
        query += ` AND u.department_id = $${index}`;
        values.push(department_id);
        index++;
      }

      query += ` ORDER BY u.created_at DESC`;

      console.log("FINAL QUERY:", query);
      console.log("VALUES:", values);

      const result = await db.query(query, values);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users"
      });
    }
  }
);

// Get Departments with Faculty Count
adminRouter.get(
  "/departments",
  requireAuth,
  async (req, res) => {
    try {
      const result = await db.query(`
        SELECT d.id, d.name, COUNT(u.id) as count 
        FROM departments d 
        LEFT JOIN users u ON d.id = u.department_id 
        GROUP BY d.id, d.name 
        ORDER BY d.name ASC
      `);
      res.json({
        success: true,
        data: result.rows.map(row => ({
          ...row,
          count: parseInt(row.count)
        }))
      });
    } catch (error) {
      console.error("[ADMIN] Fetch departments error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);

// Create Department
adminRouter.post(
  "/departments",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: "Department name is required" });
      }

      const result = await db.query(
        "INSERT INTO departments (name) VALUES ($1) RETURNING *",
        [name]
      );

      await createAuditLog({
        action_type: "Dept Created",
        admin_user: req.user.name || req.user.email,
        target_entity: name,
        status: "Success"
      });

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: "Department created successfully"
      });
    } catch (error) {
      console.error("[ADMIN] Create department error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);


// Get Single User
adminRouter.get(
  "/users/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        `SELECT u.id, u.name as full_name, u.email, u.role, u.status, d.name as department, u.department_id 
                 FROM users u 
                 LEFT JOIN departments d ON u.department_id = d.id 
                 WHERE u.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Update User (PUT)
adminRouter.put(
  "/users/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, department, role, status } = req.body;

      // department comes as the ID from the frontend
      const deptId = department ? parseInt(department) : null;

      await db.query(
        `UPDATE users SET name = $1, role = $2, status = $3, department_id = $4 WHERE id = $5`,
        [fullName, role, status, deptId, id]
      );

      await createAuditLog({
        action_type: "User Updated",
        admin_user: req.user.name || req.user.email,
        target_entity: fullName,
        status: "Success"
      });

      res.json({ success: true, message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Password Reset
adminRouter.post(
  "/users/:id/reset-password",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const userRes = await db.query("SELECT name FROM users WHERE id = $1", [id]);
      const targetName = userRes.rows[0]?.name || id;

      await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, id]);

      await createAuditLog({
        action_type: "Password Reset",
        admin_user: req.user.name || req.user.email,
        target_entity: targetName,
        status: "Success"
      });

      res.json({ success: true, tempPassword });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Toggle Status / Update Status (PATCH)
adminRouter.patch(
  "/users/:id/status",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'ACTIVE' or 'INACTIVE'

      const userRes = await db.query("SELECT name FROM users WHERE id = $1", [id]);
      const targetName = userRes.rows[0]?.name || id;

      await db.query("UPDATE users SET status = $1 WHERE id = $2", [status, id]);

      await createAuditLog({
        action_type: "Status Updated",
        admin_user: req.user.name || req.user.email,
        target_entity: `${targetName} (${status})`,
        status: "Success"
      });

      res.json({ success: true, message: "Status updated" });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);