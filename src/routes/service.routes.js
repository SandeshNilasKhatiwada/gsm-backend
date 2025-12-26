import express from "express";
import {
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  addServiceReview,
} from "../controllers/service.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);

// Protected routes
router.put("/:id", authenticate, updateService);
router.delete("/:id", authenticate, deleteService);
router.post("/:id/reviews", authenticate, addServiceReview);

export default router;
