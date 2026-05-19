import prisma from "../../dbClient.js";

export const addProduct = async (req, res) => {
  try {
    const { productData } = req.body;
    const data = JSON.parse(productData);
    const { shopId, categoryId } = req.params;

    const existingProduct = await prisma.product.findFirst({
      where: { name: toTitleCase(data.productName), shopId: +shopId },
    });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product already exists", success: false });
    }

    const publicId = `product-${Date.now()}`;

    const url = await UploadCompressedImageBuffer(
      shopId,
      req.files.productImage.data,
      "static",
      publicId,
    );
    const newProduct = await prisma.product.create({
      data: {
        name: toTitleCase(data.productName),
        description: data.description,
        imageUrl: url,
        publicId: `static/${publicId}`,
        weight: +data.weight,
        price: +data.price,

        category: {
          connect: { id: +categoryId },
        },
        shop: {
          connect: { id: +shopId },
        },
      },
    });
    return res.json({
      message: "Product created successfully",
      product: newProduct,
      success: true,
    });
  } catch (error) {
    console.log(error, "error creating product");
    return res
      .status(500)
      .json({ message: "Error creating product", error, success: false });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productData, publicId: productPublicId } = req.body;
    const data = JSON.parse(productData);
    const { shopId, productId } = req.params;
    let publicId, url;
    if (req.files && req.files.productImage) {
      publicId = `product-${Date.now()}`;

      url = await UploadCompressedImageBuffer(
        shopId,
        req.files.productImage.data,
        "static",
        publicId,
      );
      if (productPublicId && productPublicId != "null") {
        deleteImage(shopId, productPublicId);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: +productId },
      data: {
        name: toTitleCase(data.productName),
        description: data.description,
        ...(req.files &&
          req.files.productImage && {
            imageUrl: url,
            publicId: `static/${publicId}`,
          }),
        weight: +data.weight,
        price: +data.price,
      },
    });
    return res.json({
      message: "Product updated successfully",
      product: updatedProduct,
      success: true,
    });
  } catch (error) {
    console.log(error, "error updating product");
    return res
      .status(500)
      .json({ message: "Error updating product", error, success: false });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { shopId, categoryId } = req.params;

    const products = await prisma.product.findMany({
      where: { shopId: +shopId, categoryId: +categoryId },
    });

    return res.json({
      message: "Products retreived successfully",
      products: products,
      success: true,
    });
  } catch (error) {
    console.log(error, "error retreiving products");
    return res
      .status(500)
      .json({ message: "Error retrieving products", error, success: false });
  }
};
export const getAllProducts = async (req, res) => {
  try {
    const { shopId } = req.params;

    const products = await prisma.product.findMany({
      where: { shopId: +shopId },
    });
    return res.json({
      message: "Products retreived successfully",
      products: products,
      success: true,
    });
  } catch (error) {
    console.log(error, "error retreiving products");
    return res
      .status(500)
      .json({ message: "Error retrieving products", error, success: false });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res
        .status(400)
        .json({ message: "Please provide productId", success: false });
    }

    const product = await prisma.product.findFirst({
      where: { id: +productId },
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    await prisma.product.delete({
      where: { id: +productId },
    });

    if (product.publicId) {
      await deleteImage(req.user.shopId, product.publicId);
    }

    return res.json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log(error, "error deleting product");
    return res
      .status(500)
      .json({ message: "Error deleting product", error, success: false });
  }
};
