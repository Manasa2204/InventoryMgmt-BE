import prisma from "../../dbClient.js";
import { z } from "zod";
import { errorResponse, successResponse } from "../../responses/handler.js";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  quantityOnHand: z.number().int().min(0).default(0),
  costPrice: z.number().min(0).optional().nullable(),
  sellingPrice: z.number().min(0).optional().nullable(),
  lowStockThreshold: z.number().int().min(0).optional().nullable(),
});

const adjustSchema = z.object({
  adjustment: z.number().int(),
  note: z.string().optional(),
});

export async function getAllProducts(req, res) {
  try {
    const { search } = req.query;

    const products = await prisma.product.findMany({
      where: {
        organizationId: req.orgId,
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });

    const settings = await prisma.orgSettings.findUnique({
      where: { organizationId: req.orgId },
    });
    const defaultThreshold = settings?.defaultLowStockThreshold ?? 5;

    const productsWithStatus = products.map((p) => ({
      ...p,
      effectiveThreshold: p.lowStockThreshold ?? defaultThreshold,
      isLowStock: p.quantity <= (p.lowStockThreshold ?? defaultThreshold),
    }));

    return successResponse(res, productsWithStatus, "Products found");
  } catch (error) {
    console.log(error);
    return errorResponse(res, new Error("Internal server error"), 500);
  }
}

export async function getProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        organizationId: req.orgId,
        deletedAt: null,
        id: id,
      },
    });

    if (!product) {
      return errorResponse(res, new Error("Product not found"), 404);
    }

    return successResponse(res, product, "Products found");
  } catch (error) {
    console.log(error);
    return errorResponse(res, new Error("Internal server error"), 500);
  }
}

export async function addProduct(req, res) {
  try {
    const body = req.body;

    const mode = body.id ? "edit" : "create";

    let product = null;

    const existing = await prisma.product.findFirst({
      where: {
        organizationId: req.orgId,
        sku: body.sku,
        deletedAt: null,
      },
    });

    if (mode == "create") {
      if (existing)
        return errorResponse(
          res,
          new Error("SKU already exists in your organization"),
          409,
        );

      product = await prisma.product.create({
        data: {
          ...body,
          organizationId: req.orgId,
          lastUpdatedBy: req.userId,
        },
      });
    } else {
      if (body.sku && body.sku !== existing.sku) {
        const skuExists = await prisma.product.findFirst({
          where: {
            organizationId: req.orgId,
            sku: body.sku,
            deletedAt: null,
            NOT: { id: body.id },
          },
        });

        if (skuExists)
          return errorResponse(
            res,
            new Error("SKU already exists in your organization"),
            409,
          );
      }

      product = await prisma.product.update({
        data: {
          ...body,
          organizationId: req.orgId,
          lastUpdatedBy: req.userId,
        },
        where: {
          id: body.id,
        },
      });
    }

    return successResponse(res, product, "Product added");
  } catch (error) {
    console.log(error);
    return errorResponse(res, new Error("Internal server error"), 500);
  }
}

export async function adjustProduct(req, res) {
  const productId = req.params.id;

  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId: req.orgId, deletedAt: null },
  });
  if (!product) return errorResponse(res, new Error("Product not found"), 404);

  const body = req.body;

  const newQty = product.quantity + body.adjustment;

  console.log(product.quantity);
  if (newQty < 0)
    return errorResponse(res, new Error("Quantity cannot go below 0"));

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { quantity: newQty, lastUpdatedBy: req.userId },
  });

  return successResponse(res, updated, "Stock updated successflly");
}

export async function deleteProduct(req, res) {
  const productId = req.params.id;
  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId: req.orgId, deletedAt: null },
  });
  if (!product) return errorResponse(res, "Product not found", 404);

  // Soft delete
  await prisma.product.update({
    where: { id: productId },
    data: { deletedAt: new Date() },
  });

  return successResponse(res, {}, "Product deleted");
}
