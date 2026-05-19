import dotenv from "dotenv";
dotenv.config();
const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8000"),
  SECRET_KEY: process.env.SECRET_KEY || "tempsecret",
};

export default config;
