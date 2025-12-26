import commentService from "../services/comment.service.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
export const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createComment(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
});

// @desc    Get comment with replies
// @route   GET /api/comments/:id
// @access  Public
export const getCommentById = asyncHandler(async (req, res) => {
  const comment = await commentService.getCommentById(req.params.id);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await commentService.updateComment(
    req.params.id,
    req.user.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    data: comment,
  });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = asyncHandler(async (req, res) => {
  const result = await commentService.deleteComment(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// @desc    Admin delete comment
// @route   DELETE /api/comments/:id/admin
// @access  Private/Admin
export const adminDeleteComment = asyncHandler(async (req, res) => {
  const result = await commentService.adminDeleteComment(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// @desc    Reply to comment
// @route   POST /api/comments/:id/reply
// @access  Private
export const replyToComment = asyncHandler(async (req, res) => {
  const reply = await commentService.replyToComment(
    req.params.id,
    req.user.id,
    req.body.content
  );

  res.status(201).json({
    success: true,
    message: "Reply created successfully",
    data: reply,
  });
});
