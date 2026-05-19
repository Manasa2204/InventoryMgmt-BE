import express from "express";
import authRouter from "./auth/index.js";
import productRouter from "./products/index.js";
import dashboardRouter from "./dashboard/index.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/products", productRouter);
router.use("/dashboard", dashboardRouter);

export default router;
