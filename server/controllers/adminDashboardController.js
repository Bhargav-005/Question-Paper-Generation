import { adminDashboardService } from "../services/adminDashboardService.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const data = await adminDashboardService.getDashboardData();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("[Admin Dashboard Controller] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data"
    });
  }
};
