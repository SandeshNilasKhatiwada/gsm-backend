import express from "express";
import {
  createShop,
  updateShop,
  getAllShops,
  getMyShops,
  getShopById,
  verifyShop,
  rejectShop,
  blockShop,
  unblockShop,
  issueStrike,
  addStaff,
  removeStaff,
  followShop,
  unfollowShop,
  deleteShop,
  restoreShop,
} from "../controllers/shop.controller.js";
import {
  createService,
  getShopServices,
} from "../controllers/service.controller.js";
import { getAllProducts } from "../controllers/product.controller.js";
import {
  auth,
  requireRole,
  optionalAuth,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createShopSchema,
  updateShopSchema,
  verifyShopSchema,
  rejectShopSchema,
  blockShopSchema,
  issueStrikeSchema,
  addStaffSchema,
  getAllShopsSchema,
} from "../validations/shop.validation.js";

const router = express.Router();

// Public routes
router.get(
  "/",
  optionalAuth,
  validate(getAllShopsSchema, "query"),
  getAllShops,
);
router.get("/my-shops", auth, getMyShops);
router.get("/:id", optionalAuth, getShopById);

// Private routes
router.use(auth);
router.post("/", validate(createShopSchema), createShop);
router.put("/:id", validate(updateShopSchema), updateShop);
router.delete("/:id", deleteShop);

// Admin routes
router.put(
  "/:id/verify",
  requireRole("admin"),
  validate(verifyShopSchema),
  verifyShop,
);
router.put(
  "/:id/reject",
  requireRole("admin"),
  validate(rejectShopSchema),
  rejectShop,
);
router.put(
  "/:id/block",
  requireRole("admin"),
  validate(blockShopSchema),
  blockShop,
);
router.put("/:id/unblock", requireRole("admin"), unblockShop);
router.put("/:id/restore", requireRole("admin"), restoreShop);
router.post(
  "/:id/strike",
  requireRole("admin"),
  validate(issueStrikeSchema),
  issueStrike,
);

// Staff management
router.post("/:id/staff", validate(addStaffSchema), addStaff);
router.delete("/:shopId/staff/:staffId", removeStaff);

// Follow/Unfollow
router.post("/:id/follow", followShop);
router.delete("/:id/follow", unfollowShop);

// Services
router.post("/:shopId/services", auth, createService);
router.get("/:shopId/services", getShopServices);

// Products
router.get(
  "/:shopId/products",
  (req, res, next) => {
    req.query.shopId = req.params.shopId;
    next();
  },
  getAllProducts,
);

export default router;
