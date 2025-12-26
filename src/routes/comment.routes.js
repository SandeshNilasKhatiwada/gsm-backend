import express from "express";
import {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  adminDeleteComment,
  replyToComment,
} from "../controllers/comment.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:id", getCommentById);

// Protected routes
router.use(auth);

router.post("/", createComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);
router.delete("/:id/admin", adminDeleteComment);
router.post("/:id/reply", replyToComment);

export default router;
