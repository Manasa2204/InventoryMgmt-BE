import express from "express";
import cors from "cors";
import config from "./config.js";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";

export const createServer = () => {
  const app = express();
  app
    .use(cookieParser())
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(
      cors({
        origin: "https://inventory-mgmt-fe.vercel.app/",
        credentials: true,
      }),
    );

  app.get("/health", (req, res) => {
    return res.json({ ok: true, environment: config.env });
  });

  app.use("/api/v1", router);

  return app;
};
