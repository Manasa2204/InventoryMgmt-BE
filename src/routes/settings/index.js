import express from "express";
import { getSettings, updateSettings } from "./controller.js";

import tokenMiddleware from "../../middleware/auth.js";

const router = express.Router();

router.use(tokenMiddleware);

router.get("/", getSettings);
router.post("/", updateSettings);

export default router;
