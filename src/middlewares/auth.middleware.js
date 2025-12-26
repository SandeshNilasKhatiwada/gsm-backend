import { verifyToken } from "../utils/jwt.util.js";
import { prisma } from "../config/database.js";

// Authentication middleware
export const auth = async (req, res, next) => {
  try {
    // Try to get token from Authorization header or cookie
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user || user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: `Account is blocked: ${user.blockedReason}`,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

// Check if user has specific role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles.map((ur) => ur.role.name);
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Check if user has specific permission
export const requirePermission = (...permissions) => {
  return (req, res, next) => {
    const userPermissions = req.user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.name),
    );

    const hasPermission = permissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
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

        if (user && !user.deletedAt && user.isActive && !user.isBlocked) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};
