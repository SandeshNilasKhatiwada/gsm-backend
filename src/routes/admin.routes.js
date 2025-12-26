import express from "express";
import {
  getDashboardStats,
  getUsers,
  getPendingShops,
  getActivityLogs,
  moderateContent,
  getReports,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and admin access
router.use(authenticate);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/shops/pending", getPendingShops);
router.get("/activity-logs", getActivityLogs);
router.post("/moderate", moderateContent);
router.get("/reports", getReports);

export default router;
