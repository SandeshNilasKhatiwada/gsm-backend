import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validations/auth.validation.js";

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Private routes
router.use(auth);
router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.put("/change-password", validate(changePasswordSchema), changePassword);
router.post("/logout", logout);

export default router;
