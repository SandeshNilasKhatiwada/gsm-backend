import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import shopRoutes from "./shop.routes.js";
import productRoutes from "./product.routes.js";
import postRoutes from "./post.routes.js";
import orderRoutes from "./order.routes.js";
import roleRoutes from "./role.routes.js";
import permissionRoutes from "./permission.routes.js";
import serviceRoutes from "./service.routes.js";
import commentRoutes from "./comment.routes.js";
import adminRoutes from "./admin.routes.js";

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/shops", shopRoutes);
router.use("/products", productRoutes);
router.use("/posts", postRoutes);
router.use("/orders", orderRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/services", serviceRoutes);
router.use("/comments", commentRoutes);
router.use("/admin", adminRoutes);

export default router;
