import bcrypt from "bcryptjs";
import { prisma } from "../config/database.js";
import { generateToken, generateRefreshToken } from "../utils/jwt.util.js";
import { AppError } from "../utils/error.util.js";

class AuthService {
  // Register new user
  async register(userData) {
    const { email, username, password, firstName, lastName, phoneNumber } =
      userData;

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new AppError("Email or username already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get customer role
    const customerRole = await prisma.role.findFirst({
      where: { name: "customer" },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        roles: {
          create: {
            roleId: customerRole.id,
            status: "approved",
          },
        },
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Remove password from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    // Format user response with primary role
    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0].role : null;
    const formattedUser = {
      ...userWithoutPassword,
      role: primaryRole,
      roles: user.roles?.map(ur => ur.role) || [],
    };

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return { user: formattedUser, token, refreshToken };
  }

  // Login user
  async login(email, password) {
    // Find user
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        roles: {
          where: { status: "approved" },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError("Account is inactive", 403);
    }

    if (user.isBlocked) {
      throw new AppError(`Account is blocked: ${user.blockedReason}`, 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Remove password from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    // Format user response with primary role
    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0].role : null;
    const formattedUser = {
      ...userWithoutPassword,
      role: primaryRole,
      roles: user.roles?.map(ur => ur.role) || [],
    };

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return { user: formattedUser, token, refreshToken };
  }

  // Get profile
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          where: { status: "approved" },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        ownedShops: {
          where: { deletedAt: null },
          include: {
            _count: {
              select: {
                products: true,
                services: true,
                followers: true,
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
            reviews: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Remove password
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update profile
  async updateProfile(userId, updateData) {
    const { firstName, lastName, phoneNumber, profilePictureUrl } = updateData;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
        profilePictureUrl,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profilePictureUrl: true,
        isVerified: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { message: "Password changed successfully" };
  }
}

export default new AuthService();
