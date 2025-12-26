import express from "express";
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateStock,
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
router.get(
  "/:id",
  optionalAuth,
  validate(getProductByIdSchema, "params"),
  getProductById,
);

// Private routes
router.use(auth);
router.post("/", validate(createProductSchema), createProduct);
router.put("/:id", validate(updateProductSchema), updateProduct);
router.delete("/:id", validate(deleteProductSchema, "params"), deleteProduct);
router.put("/:id/stock", updateStock);

export default router;
