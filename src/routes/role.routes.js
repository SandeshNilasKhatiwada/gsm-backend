import express from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  addPermissionsToRole,
  removePermissionFromRole,
} from "../controllers/role.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and admin access
router.use(authenticate);

router.route("/").post(createRole).get(getRoles);

router.route("/:id").get(getRoleById).put(updateRole).delete(deleteRole);

router.post("/:id/permissions", addPermissionsToRole);

router.delete("/:id/permissions/:permissionId", removePermissionFromRole);

export default router;
