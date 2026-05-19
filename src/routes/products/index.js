import tokenMiddleware from "../../middleware/auth.js";
import express from "express";
import { addProduct, updateProduct, getProducts } from "./controller.js";

const router = express.Router();

router.use(tokenMiddleware);

router.post("/add", addProduct);
router.post("/update", updateProduct);
router.get("/get-all", getProducts);

export default router;
