import express from "express";
import tokenMiddleware from "../../middleware/auth.js";
import { login, register, logout, auth } from "./controller.js";

const router = express.Router();

router.post("/signin", login);
router.post("/signup", register);

router.get("/auth/me", tokenMiddleware, auth);

router.delete("/logout", logout);

export default router;
