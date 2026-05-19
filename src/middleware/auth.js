import jwt from "jsonwebtoken";
import prisma from "../dbClient.js";

const authenticate = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const { userId, orgId } = decoded;

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.userId = userId;
    req.orgId = orgId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authenticate;
