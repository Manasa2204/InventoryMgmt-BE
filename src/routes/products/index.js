import tokenMiddleware from "../../middleware/auth.js";

import express from "express";
import {
  addProduct,
  adjustProduct,
  getAllProducts,
  getProduct,
} from "./controller.js";

const router = express.Router();

router.use(tokenMiddleware);

router.post("/add", addProduct);
router.get("/getAll", getAllProducts);

router.post("/:id/adjust", adjustProduct);

router.get("/:id", getProduct);

export default router;
