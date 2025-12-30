import express from "express";
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateStock,
  submitAppeal,
  getMyBlockedProducts,
} from "../controllers/product.controller.js";
import { auth, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  deleteProductSchema,
  getAllProductsSchema,
} from "../validations/product.validation.js";

const router = express.Router();

// Public routes
router.get(
  "/",
  optionalAuth,
  validate(getAllProductsSchema, "query"),
  getAllProducts,
);

// Private routes (must be before /:id to avoid conflicts)
router.get("/blocked/my-products", auth, getMyBlockedProducts);
router.post("/:id/appeal", auth, submitAppeal);

// Public route with dynamic ID (must be after specific routes)
router.get(
  "/:id",
  optionalAuth,
  validate(getProductByIdSchema, "params"),
  getProductById,
);

// Other private routes
router.use(auth);
router.post("/", validate(createProductSchema), createProduct);
router.put("/:id", validate(updateProductSchema), updateProduct);
router.delete("/:id", validate(deleteProductSchema, "params"), deleteProduct);
router.put("/:id/stock", updateStock);

export default router;
