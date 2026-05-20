import express from "express";
import authRouter from "./auth/index.js";
import productRouter from "./products/index.js";
import dashboardRouter from "./dashboard/index.js";
import settingsRouter from "./settings/index.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/products", productRouter);
router.use("/dashboard", dashboardRouter);
router.use("/settings", settingsRouter);

export default router;
