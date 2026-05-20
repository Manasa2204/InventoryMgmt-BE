import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../../dbClient.js";
import { errorResponse, successResponse } from "../../responses/handler.js";
import config from "../../config.js";

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: config.env === "production",
      sameSite: config.env === "production" ? "none" : "lax",
    });
    return successResponse(res, {}, "Logged out");
  } catch (error) {
    return errorResponse(res, new Error("Internal server error"), 500);
  }
};

export async function register(req, res) {
  try {
    const { email, password, name, organizationName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return errorResponse(res, new Error("Email already registered"), 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: organizationName },
      });

      await tx.orgSettings.create({
        data: { organizationId: org.id, defaultLowStockThreshold: 5 },
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          organizationId: org.id,
        },
      });

      return { user, org };
    });

    const response = successResponse(
      res,
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        organization: { id: result.org.id, name: result.org.name },
      },
      "logged in successfully",
      201,
    );

    response.cookie.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return errorResponse(res, new Error("Internal server error"), 500);
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email: email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return errorResponse(res, new Error("Please register before login"), 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return errorResponse(res, new Error("Invalid credentials"), 401);
    }

    const token = jwt.sign(
      { userId: user.id, orgId: user.organizationId },
      config.SECRET_KEY,
    );

    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: config.env === "production",
      sameSite: config.env === "production" ? "none" : "lax",
    });

    const response = successResponse(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        organization: {
          id: user.organizationId,
          name: user.organization.name,
        },
      },
      "logged in successfully",
      201,
    );

    return response;
  } catch (error) {
    console.log(error);
    return errorResponse(res, new Error("Internal server error"), 500);
  }
};

export const auth = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.userId },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return errorResponse(res, new Error("No user found"), 404);
    }

    const response = successResponse(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        organization: {
          id: user.organizationId,
          name: user.organization.name,
        },
      },
      "Fetched details successfully",
      201,
    );

    return response;
  } catch (error) {
    console.log(error);
    return errorResponse(res, new Error("Internal server error"), 500);
  }
};
