import express from "express";
import { getDashboard } from "./controller.js";

import tokenMiddleware from "../../middleware/auth.js";

const router = express.Router();

router.use(tokenMiddleware);

router.get("/", getDashboard);

export default router;
