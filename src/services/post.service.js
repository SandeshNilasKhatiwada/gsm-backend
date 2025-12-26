import { prisma } from "../config/database.js";
import { generateSlug } from "../utils/slug.util.js";
import { getPagination, paginationResponse } from "../utils/pagination.util.js";
import { AppError } from "../utils/error.util.js";

class PostService {
  // Create post
  async createPost(postData, userId) {
    const {
      title,
      content,
      excerpt,
      featuredImage,
      postType,
      shopId,
      tags,
      status,
    } = postData;

    // Generate slug
    const slug = generateSlug(title);

    // If post is for a shop, verify ownership
    if (shopId) {
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
      });

      if (!shop) {
        throw new AppError("Shop not found", 404);
      }

      if (shop.ownerId !== userId) {
        throw new AppError("Not authorized to create posts for this shop", 403);
      }
    }

    const post = await prisma.post.create({
      data: {
        authorId: userId,
        shopId,
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        postType,
        tags,
        status: status || "draft",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            isVerified: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    return post;
  }

  // Update post
  async updatePost(postId, updateData, userId) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.authorId !== userId) {
      throw new AppError("Not authorized to update this post", 403);
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            isVerified: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    return updatedPost;
  }

  // Get all posts with pagination and filters
  async getAllPosts(query) {
    const { page, limit, search, postType, shopId, authorId, status, sortBy } =
      query;
    const { skip, take } = getPagination(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (postType) {
      where.postType = postType;
    }

    if (shopId) {
      where.shopId = shopId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = "published"; // Default to published posts
      where.isDisabled = false;
    }

    const orderBy = {};
    if (sortBy === "views") {
      orderBy.viewsCount = "desc";
    } else if (sortBy === "likes") {
      orderBy.likesCount = "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
            lastName: true,
              profilePictureUrl: true,
              isVerified: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy,
      }),
      prisma.post.count({ where }),
    ]);

    return paginationResponse(posts, total, page, limit);
  }

  // Get post by ID
  async getPostById(postId) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            isVerified: true,
            bio: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            isVerified: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    // Increment views
    await prisma.post.update({
      where: { id: postId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });

    return post;
  }

  // Delete post
  async deletePost(postId, userId) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.authorId !== userId) {
      throw new AppError("Not authorized to delete this post", 403);
    }

    await prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });

    return { message: "Post deleted successfully" };
  }

  // Disable post (admin)
  async disablePost(postId, reason, disabledBy) {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        isDisabled: true,
        disabledReason: reason,
        disabledAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: disabledBy,
        action: "DISABLE_POST",
        targetType: "Post",
        targetId: postId,
        details: { reason },
      },
    });

    return post;
  }

  // Enable post (admin)
  async enablePost(postId, enabledBy) {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        isDisabled: false,
        disabledReason: null,
        disabledAt: null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: enabledBy,
        action: "ENABLE_POST",
        targetType: "Post",
        targetId: postId,
      },
    });

    return post;
  }

  // Like post
  async likePost(postId) {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    return post;
  }

  // Add comment
  async addComment(postId, commentData, userId) {
    const { content, parentId } = commentData;

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId,
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
}

export default new PostService();
