import { db } from "../db.js";

export const adminDashboardService = {
  async getDashboardData() {
    try {
      // 1. Total Faculty - Ensure role matches 'FACULTY'
      const facultyCountRes = await db.query(
        "SELECT COUNT(*) FROM users WHERE UPPER(role) = 'FACULTY'"
      );
      const totalFaculty = parseInt(facultyCountRes.rows[0].count || 0);

      // 2. Active Now (Status = ACTIVE)
      const activeRes = await db.query(
        "SELECT COUNT(*) FROM users WHERE status = 'ACTIVE' AND UPPER(role) = 'FACULTY'"
      );
      const activeNow = parseInt(activeRes.rows[0].count || 0);

      // 3. Inactive
      const inactiveRes = await db.query(
        "SELECT COUNT(*) FROM users WHERE status = 'INACTIVE' AND UPPER(role) = 'FACULTY'"
      );
      const inactive = parseInt(inactiveRes.rows[0].count || 0);

      // 4. Total Papers
      const papersCountRes = await db.query("SELECT COUNT(*) FROM papers");
      const totalPapers = parseInt(papersCountRes.rows[0].count || 0);

      if (process.env.NODE_ENV === "development") {
        console.log(`[Dashboard Stats] Faculty: ${totalFaculty}, Active: ${activeNow}, Papers: ${totalPapers}`);
      }

      // 5. Recent Activity
      const recentUsers = await db.query(`
        SELECT 'Faculty account created' as event, name as description, created_at as time 
        FROM users 
        WHERE UPPER(role) = 'FACULTY' 
        ORDER BY created_at DESC 
        LIMIT 3
      `);
      
      const recentPapers = await db.query(`
        SELECT 'New paper generated' as event, title as description, created_at as time 
        FROM papers 
        ORDER BY created_at DESC 
        LIMIT 3
      `);
      
      const combined = [...recentUsers.rows, ...recentPapers.rows]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5)
        .map(act => ({
          event: act.event,
          description: act.description,
          time: this.calculateTimeAgo(act.time)
        }));

      return {
        totalFaculty,
        activeNow,
        inactive,
        totalPapers,
        recentActivity: combined,
        systemHealth: {
          serverUptime: 99.9,
          storageUsage: 42
        }
      };
    } catch (error) {
      console.error("[Admin Dashboard Service] Error:", error);
      throw error;
    }
  },

  calculateTimeAgo(date) {
    if (!date) return "Long ago";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
  }
};
