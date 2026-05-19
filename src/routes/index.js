import express from "express";
import authRouter from "./auth/index.js";
import productRouter from "./products/index.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/products", productRouter);

export default router;
