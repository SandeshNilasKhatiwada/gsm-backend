import prisma from "../config/database.js";
import { AppError } from "../utils/error.util.js";

class CommentService {
  async createComment(data, userId) {
    const comment = await prisma.comment.create({
      data: {
        commentableType: data.commentableType,
        commentableId: data.commentableId,
        userId,
        content: data.content,
        parentId: data.parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return comment;
  }

  async getCommentById(commentId) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
        replies: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePictureUrl: true,
              },
            },
            replies: {
              where: { deletedAt: null },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    profilePictureUrl: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!comment || comment.deletedAt) {
      throw new AppError("Comment not found", 404);
    }

    return comment;
  }

  async getCommentsByEntity(commentableType, commentableId, filters = {}) {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      commentableType,
      commentableId,
      parentId: null, // Only root comments
      deletedAt: null,
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
            },
          },
          replies: {
            where: { deletedAt: null },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  profilePictureUrl: true,
                },
              },
              replies: {
                where: { deletedAt: null },
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      firstName: true,
                      lastName: true,
                      profilePictureUrl: true,
                    },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateComment(commentId, userId, data) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt) {
      throw new AppError("Comment not found", 404);
    }

    if (comment.userId !== userId) {
      throw new AppError("You don't have permission to update this comment", 403);
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return updatedComment;
  }

  async deleteComment(commentId, userId) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt) {
      throw new AppError("Comment not found", 404);
    }

    if (comment.userId !== userId) {
      throw new AppError("You don't have permission to delete this comment", 403);
    }

    // Soft delete
    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { message: "Comment deleted successfully" };
  }

  async adminDeleteComment(commentId) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt) {
      throw new AppError("Comment not found", 404);
    }

    // Soft delete
    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { message: "Comment deleted by admin successfully" };
  }

  async replyToComment(commentId, userId, content) {
    const parentComment = await this.getCommentById(commentId);

    // Prevent replies to replies (max 2 levels)
    if (parentComment.parentId) {
      throw new AppError("Cannot reply to a reply. Please reply to the main comment.", 400);
    }

    const reply = await this.createComment({
      commentableType: parentComment.commentableType,
      commentableId: parentComment.commentableId,
      parentId: commentId,
      content,
    }, userId);

    return reply;
  }
}

export default new CommentService();
