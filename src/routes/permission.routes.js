import express from "express";
import {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
  getPermissionsByResource,
} from "../controllers/permission.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and admin access
router.use(auth);

router.get("/by-resource", getPermissionsByResource);

router.route("/").post(createPermission).get(getPermissions);

router
  .route("/:id")
  .get(getPermissionById)
  .put(updatePermission)
  .delete(deletePermission);

export default router;
