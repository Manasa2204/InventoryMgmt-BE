import { z } from "zod";
import prisma from "../../dbClient.js";
import { errorResponse, successResponse } from "../../responses/handler.js";

const settingsSchema = z.object({
  defaultLowStockThreshold: z.number().int().min(0),
});

export async function getSettings(req, res) {
  try {
    const settings = await prisma.orgSettings.findUnique({
      where: { organizationId: req.orgId },
    });

    return successResponse(
      res,
      settings ?? { defaultLowStockThreshold: 5 },
      "Settings found",
    );
  } catch (error) {
    console.log(error);
    return errorResponse(res, new Error("Internal server error"), 500);
  }
}

export async function updateSettings(req, res) {
  try {
    const body = await req.body;

    const settings = await prisma.orgSettings.update({
      data: { defaultLowStockThreshold: body.defaultLowStockThreshold },
      where: { organizationId: req.orgId },
    });

    return successResponse(res, settings, "setting found");
  } catch (error) {
    console.log(error);
    return errorResponse(res, new Error("Internal server error"), 500);
  }
}
