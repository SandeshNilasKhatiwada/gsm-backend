import asyncHandler from "express-async-handler";
import postService from "../services/post.service.js";

// @desc    Create post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: post,
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.json({
    success: true,
    message: "Post updated successfully",
    data: post,
  });
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getAllPosts = asyncHandler(async (req, res) => {
  const result = await postService.getAllPosts(req.query);

  res.json({
    success: true,
    ...result,
  });
});

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);

  res.json({
    success: true,
    data: post,
  });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Post deleted successfully",
  });
});

// @desc    Disable post
// @route   PUT /api/posts/:id/disable
// @access  Private/Admin
export const disablePost = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const post = await postService.disablePost(
    req.params.id,
    reason,
    req.user.id,
  );

  res.json({
    success: true,
    message: "Post disabled successfully",
    data: post,
  });
});

// @desc    Enable post
// @route   PUT /api/posts/:id/enable
// @access  Private/Admin
export const enablePost = asyncHandler(async (req, res) => {
  const post = await postService.enablePost(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Post enabled successfully",
    data: post,
  });
});

// @desc    Like post
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = asyncHandler(async (req, res) => {
  const post = await postService.likePost(req.params.id);

  res.json({
    success: true,
    message: "Post liked successfully",
    data: post,
  });
});

// @desc    Add comment
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const comment = await postService.addComment(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: comment,
  });
});
