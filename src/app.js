import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config/config.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to GSM API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      shops: "/api/shops",
      products: "/api/products",
      posts: "/api/posts",
      orders: "/api/orders",
      roles: "/api/roles",
      permissions: "/api/permissions",
      services: "/api/services",
      comments: "/api/comments",
      admin: "/api/admin",
      health: "/api/health",
    },
  });
});

app.use("/api", routes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
