import { errorResponse, successResponse } from "../../responses/handler.js";
import prisma from "./../../dbClient.js";

export async function getDashboard(req, res) {
  try {
    const settings = await prisma.orgSettings.findUnique({
      where: { organizationId: req.orgId },
    });
    const defaultThreshold = settings?.defaultLowStockThreshold ?? 5;

    const products = await prisma.product.findMany({
      where: { organizationId: req.orgId, deletedAt: null },
    });

    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

    const lowStockItems = products
      .filter((p) => p.quantity <= (p.lowStockThreshold ?? defaultThreshold))
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity: p.quantity,
        lowStockThreshold: p.lowStockThreshold ?? defaultThreshold,
      }));

    return successResponse(
      res,
      {
        totalProducts,
        totalQuantity,
        lowStockItems,
        lowStockCount: lowStockItems.length,
      },
      "Dashboard details fetched",
    );
  } catch (error) {
    console.log(error);
    return errorResponse(res, new Error("Internal server error"));
  }
}
