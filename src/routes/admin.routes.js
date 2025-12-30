import express from "express";
import {
  getDashboardStats,
  getUsers,
  getUserById,
  verifyUser,
  blockUser,
  unblockUser,
  issueWarning,
  deleteUser,
  restoreUser,
  getDeletedUsers,
  getShops,
  getShopById,
  getPendingShops,
  getDeletedShops,
  restoreShop,
  issueShopStrike,
  blockShop,
  unblockShop,
  deleteShopByAdmin,
  getActivityLogs,
  moderateContent,
  getReports,
  getProducts,
  blockProduct,
  unblockProduct,
  deleteProductByAdmin,
  getProductAppeals,
  reviewProductAppeal,
} from "../controllers/admin.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and admin access
router.use(auth);

router.get("/dashboard", getDashboardStats);
router.get("/users/deleted", getDeletedUsers);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);
router.post("/users/:id/warning", issueWarning);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/restore", restoreUser);
router.get("/shops/deleted", getDeletedShops);
router.get("/shops/pending", getPendingShops);
router.get("/shops", getShops);
router.get("/shops/:id", getShopById);
router.post("/shops/:id/strike", issueShopStrike);
router.put("/shops/:id/block", blockShop);
router.put("/shops/:id/unblock", unblockShop);
router.delete("/shops/:id", deleteShopByAdmin);
router.put("/shops/:id/restore", restoreShop);
router.get("/products/appeals", getProductAppeals);
router.get("/products", getProducts);
router.put("/products/:id/block", blockProduct);
router.put("/products/:id/unblock", unblockProduct);
router.put("/products/:id/appeal/review", reviewProductAppeal);
router.delete("/products/:id", deleteProductByAdmin);
router.get("/activity-logs", getActivityLogs);
router.post("/moderate", moderateContent);
router.get("/reports", getReports);

export default router;
