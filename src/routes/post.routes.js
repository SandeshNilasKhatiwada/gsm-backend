import express from "express";
import {
  createPost,
  updatePost,
  getAllPosts,
  getPostById,
  deletePost,
  disablePost,
  enablePost,
  likePost,
  addComment,
} from "../controllers/post.controller.js";
import {
  auth,
  requireRole,
  optionalAuth,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPostSchema,
  updatePostSchema,
  getPostByIdSchema,
  deletePostSchema,
  getAllPostsSchema,
  disablePostSchema,
} from "../validations/post.validation.js";

const router = express.Router();

// Public routes
router.get(
  "/",
  optionalAuth,
  validate(getAllPostsSchema, "query"),
  getAllPosts,
);
router.get(
  "/:id",
  optionalAuth,
  validate(getPostByIdSchema, "params"),
  getPostById,
);

// Private routes
router.use(auth);
router.post("/", validate(createPostSchema), createPost);
router.put("/:id", validate(updatePostSchema), updatePost);
router.delete("/:id", validate(deletePostSchema, "params"), deletePost);
router.post("/:id/like", likePost);
router.post("/:id/comments", addComment);

// Admin routes
router.put(
  "/:id/disable",
  requireRole("admin"),
  validate(disablePostSchema),
  disablePost,
);
router.put("/:id/enable", requireRole("admin"), enablePost);

export default router;
