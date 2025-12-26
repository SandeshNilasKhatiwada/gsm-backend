import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
  warnUser,
  verifyUser,
  getUserStats,
} from "../controllers/user.controller.js";
import { auth, requireRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  getAllUsersSchema,
  getUserByIdSchema,
  updateUserSchema,
  blockUserSchema,
  deleteUserSchema,
  warnUserSchema,
} from "../validations/user.validation.js";

const router = express.Router();

router.use(auth);

// User management routes (Admin only)
router.get(
  "/",
  requireRole("admin"),
  validate(getAllUsersSchema, "query"),
  getAllUsers,
);
router.get("/:id", validate(getUserByIdSchema, "params"), getUserById);
router.put(
  "/:id",
  validate(updateUserSchema),
  updateUser,
);
router.post(
  "/:id/block",
  requireRole("admin"),
  validate(blockUserSchema),
  blockUser,
);
router.post("/:id/unblock", requireRole("admin"), unblockUser);
router.delete(
  "/:id",
  requireRole("admin"),
  validate(deleteUserSchema, "params"),
  deleteUser,
);
router.post(
  "/:id/warn",
  requireRole("admin"),
  validate(warnUserSchema),
  warnUser,
);
router.post("/:id/verify", requireRole("admin"), verifyUser);
router.get("/:id/stats", getUserStats);

export default router;
