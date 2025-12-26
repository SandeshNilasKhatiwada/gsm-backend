import express from "express";
import {
  createShop,
  updateShop,
  getAllShops,
  getShopById,
  verifyShop,
  blockShop,
  unblockShop,
  issueStrike,
  addStaff,
  removeStaff,
  followShop,
  unfollowShop,
  deleteShop,
} from "../controllers/shop.controller.js";
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
  validate(verifyShopSchema, "params"),
  verifyShop,
);
router.put(
  "/:id/block",
  requireRole("admin"),
  validate(blockShopSchema),
  blockShop,
);
router.put("/:id/unblock", requireRole("admin"), unblockShop);
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

export default router;
