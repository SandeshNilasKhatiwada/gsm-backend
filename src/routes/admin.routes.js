import express from "express";
import {
  getDashboardStats,
  getUsers,
  verifyUser,
  blockUser,
  getShops,
  getPendingShops,
  getActivityLogs,
  moderateContent,
  getReports,
} from "../controllers/admin.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and admin access
router.use(auth);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/block", blockUser);
router.get("/shops", getShops);
router.get("/shops/pending", getPendingShops);
router.get("/activity-logs", getActivityLogs);
router.post("/moderate", moderateContent);
router.get("/reports", getReports);

export default router;
