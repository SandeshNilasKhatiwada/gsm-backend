import express from "express";
import {
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  addServiceReview,
} from "../controllers/service.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);

// Protected routes
router.put("/:id", auth, updateService);
router.delete("/:id", auth, deleteService);
router.post("/:id/reviews", auth, addServiceReview);

export default router;
