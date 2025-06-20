import { Request, Response } from "express";
import { File, IncomingForm } from "formidable";
import { cloudinaryImageUploadMethod } from "../utils/Fileupload.utils";
import Product from "../models/Product.Model";
import jwt from "jsonwebtoken";
import User from "../models/User.model";
import { Op } from "sequelize";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_SUBCATEGORIES,
  PRODUCT_TAGS,
} from "../constants/Product.constants";

const SECRET_KEY = process.env.JWT_SECRET_KEY as string;

const formatGBP = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

  
export class ProductController {
  async createProduct(req: Request, res: Response) {
    const form = new IncomingForm({ multiples: true, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          console.error("❌ Error parsing form:", err);
          return res.status(400).json({ error: "Form parsing failed" });
        }

        // 🔐 JWT Verification
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ message: "Missing or invalid token" });
        }

        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        const user = await User.findOne({ where: { userId } });
        if (!user) { 
          return res.status(404).json({ message: "User not found" });
        }

        // ✅ Validate Category
        const category = fields.category?.[0];
        if (category && !PRODUCT_CATEGORIES.includes(category)) {
          return res.status(400).json({ message: "Invalid category selected" });
        }

        // ✅ Validate Subcategory
        const subCategory = fields.subCategory?.[0];
        if (subCategory && !PRODUCT_SUBCATEGORIES.includes(subCategory)) {
          return res
            .status(400)
            .json({ message: "Invalid subcategory selected" });
        }

        // ✅ Validate Tags
        const rawTags = fields.tags?.[0]?.split(",").map(tag => tag.trim()) || [];
        const invalidTags = rawTags.filter(
          (tag) => !PRODUCT_TAGS.includes(tag)
        );
        if (invalidTags.length > 0) {
          return res
            .status(400)
            .json({ message: "Invalid tags provided", invalidTags });
        }

        //  Image Handling
        const images: string[] = [];
        const rawImages = files.productImages;
        const imageFiles: File[] = Array.isArray(rawImages)
          ? rawImages
          : rawImages
          ? [rawImages]
          : [];

        for (const file of imageFiles) {
          if (file && file.filepath) {
            const uploadedImageUrl = await cloudinaryImageUploadMethod(file.filepath);
            images.push(uploadedImageUrl);
          } else {
            console.warn("⚠ Skipped invalid file:", file);
          }
        }
          
const stock = parseInt(fields.stock?.[0] || "0");
  
        //  Create Product
        const product = await Product.create({
          productCode: fields.productCode?.[0],
          productName: fields.productName?.[0],
          productImages: images,
          description: fields.description?.[0],
          actualPrice: parseFloat(fields.actualPrice?.[0] || "0"),
          discount: parseFloat(fields.discount?.[0] || "0"),
          finalPrice: parseFloat(fields.finalPrice?.[0] || "0"),
          category,
          subCategory,
          rating: parseFloat(fields.rating?.[0] || "0"),
          isFeatured: fields.isFeatured?.[0] === "true",
          isTrending: fields.isTrending?.[0] === "true",
          isNew: fields.isNew?.[0] === "true",
          expiryDate: fields.expiryDate?.[0] ? new Date(fields.expiryDate[0]) : null,
          harvestDate: fields.harvestDate?.[0] ? new Date(fields.harvestDate[0]) : null,
          shelfLife: parseInt(fields.shelfLife?.[0] || "0"),
          returnable: fields.returnable?.[0] === "true",
          storageInstructions: fields.storageInstructions?.[0],
          maxPurchaseLimit: parseInt(fields.maxPurchaseLimit?.[0] || "0"),
          deliveryType: fields.deliveryType?.[0],
          tags: rawTags,
          stock
        });

        return res.status(201).json({
          message: "✅ Product created successfully",
          // product,
            product: {
    ...product.toJSON(),
    formattedPrice: formatGBP(product.finalPrice),
    formattedActualPrice: formatGBP(product.actualPrice),
    formattedDiscount: `${product.discount}%`,
  }

        });
      } catch (error: any) {
        console.error("❌ Error creating product:", error.message);
        return res.status(500).json({
          message: "Internal Server Error",
          error: error.message,
        });
      }
    });
  }



async editProduct(req: Request, res: Response) {
  try {
    const {
      productId,
      productCode,
      productName,
      description,
      actualPrice,
      discount,
      finalPrice,
        stock,
      category,
      subCategory,
      tags,
      rating,
      isFeatured,
      isTrending,
      isNew,
      expiryDate,
      harvestDate,
      shelfLife,
      returnable,
      storageInstructions,
      maxPurchaseLimit,
      deliveryType,
      productImages, // Array of image URLs
    } = req.body;

    // 🔒 JWT Validation
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;

    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if new productCode already exists (unique)
    if (productCode && productCode !== product.productCode) {
      const exists = await Product.findOne({ where: { productCode } });
      if (exists) {
        return res.status(409).json({ message: "Product code already in use" });
      }
    }

    // Validate category and subcategory
    if (category && !PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (subCategory && !PRODUCT_SUBCATEGORIES.includes(subCategory)) {
      return res.status(400).json({ message: "Invalid subcategory" });
    }

    // Validate tags
    const cleanedTags = tags || [];
    const invalidTags = cleanedTags.filter((tag: string) => !PRODUCT_TAGS.includes(tag));
    if (invalidTags.length > 0) {
      return res.status(400).json({ message: "Invalid tags", invalidTags });
    }

    // Validate delivery type
    const validDeliveryTypes = ["Instant", "Scheduled", "Next Morning"];
    if (deliveryType && !validDeliveryTypes.includes(deliveryType)) {
      return res.status(400).json({ message: "Invalid delivery type" });
    }

    // 🛠️ Update product
    await product.update({
      productCode: productCode || product.productCode,
      productName: productName || product.productName,
      description: description || product.description,
      actualPrice: actualPrice ?? product.actualPrice,
      discount: discount ?? product.discount,
      finalPrice: finalPrice ?? product.finalPrice,
      category: category || product.category,
      subCategory: subCategory || product.subCategory,
      tags: cleanedTags.length ? cleanedTags : product.tags,
      rating: rating ?? product.rating,
      isFeatured: isFeatured ?? product.isFeatured,
      isTrending: isTrending ?? product.isTrending,
      isNew: isNew ?? product.isNew,
      expiryDate: expiryDate ? new Date(expiryDate) : product.expiryDate,
      harvestDate: harvestDate ? new Date(harvestDate) : product.harvestDate,
      shelfLife: shelfLife ?? product.shelfLife,
      returnable: returnable ?? product.returnable,
      storageInstructions: storageInstructions || product.storageInstructions,
      maxPurchaseLimit: maxPurchaseLimit ?? product.maxPurchaseLimit,
      deliveryType: deliveryType || product.deliveryType,
      productImages: productImages || product.productImages,
        stock: stock ?? product.stock,
    });

    return res.status(200).json({
      message: "✅ Product updated successfully",
      // product,
        product: {
    ...product.toJSON(),
    formattedPrice: formatGBP(product.finalPrice),
    formattedActualPrice: formatGBP(product.actualPrice),
    formattedDiscount: `${product.discount}%`,
        }
    });

  } catch (error: any) {
    console.error("❌ Error updating product:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      details: error.errors || error,
    });
  }
}


  async uploadProductImages(req: Request, res: Response) {
  const form = new IncomingForm({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) return res.status(400).json({ message: 'Form parsing failed' });

      const rawImages = files.productImages;
      const imageFiles = Array.isArray(rawImages) ? rawImages : [rawImages];

      const uploadedUrls: string[] = [];

      for (const file of imageFiles) {
        if (file && file.filepath) {
          const url = await cloudinaryImageUploadMethod(file.filepath);
          uploadedUrls.push(url);
        }
      }

      return res.status(200).json({ message: 'Images uploaded', urls: uploadedUrls });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  });
}


async deleteProduct(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;

    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    return res.status(200).json({ message: "✅ Product deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting product:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}





//included price sort 
async getProductsByFilters(req: Request, res: Response) {
  try {
    const { category, subCategory, tags, page = 1, limit = 10, sort } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    // ✅ Filter: Category
    if (category && typeof category === 'string') {
      if (!PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: 'Invalid category' });
      }
      whereClause.category = category;
    }

    // ✅ Filter: Subcategory
    if (subCategory && typeof subCategory === 'string') {
      if (!PRODUCT_SUBCATEGORIES.includes(subCategory)) {
        return res.status(400).json({ message: 'Invalid subcategory' });
      }
      whereClause.subCategory = subCategory;
    }

    // ✅ Filter: Tags
    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',').map(tag => tag.trim());
      const invalidTags = tagArray.filter(tag => !PRODUCT_TAGS.includes(tag));
      if (invalidTags.length > 0) {
        return res.status(400).json({ message: "Invalid tag(s)", invalidTags });
      }
      whereClause.tags = {
        [Op.overlap]: tagArray,
      };
    }

    // ✅ Sorting logic
    let order: any = [['createdAt', 'DESC']]; // default
    if (sort && typeof sort === 'string') {
      const [field, direction] = sort.split('_');
      const validFields = ['createdAt', 'finalPrice', 'rating'];
      const validDirections = ['asc', 'desc'];

      if (validFields.includes(field) && validDirections.includes(direction)) {
        order = [[field, direction.toUpperCase()]];
      } else {
        return res.status(400).json({ message: "Invalid sort parameter" });
      }
    }

    // 🔎 Fetch
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order,
    });

    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      message: "✅ Products fetched successfully",
      // products,
      products: products.map(p => ({
  ...p.toJSON(),
  formattedPrice: formatGBP(p.finalPrice),
  formattedActualPrice: formatGBP(p.actualPrice),
  formattedDiscount: `${p.discount}%`,
})),

      pagination: {
        totalItems: count,
        currentPage: pageNum,
        totalPages,
        limit: limitNum,
      },
    });

  } catch (error: any) {
    console.error("❌ Error filtering products:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async searchProducts(req: Request, res: Response) {
  try {
    const {
      category,
      subCategory,
      tags,
      searchTerm,
      page = 1,
      limit = 10,
      sort,
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    // ✅ Category Filter
    if (category && typeof category === "string") {
      if (!PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      whereClause.category = category;
    }

    // ✅ Subcategory Filter
    if (subCategory && typeof subCategory === "string") {
      if (!PRODUCT_SUBCATEGORIES.includes(subCategory)) {
        return res.status(400).json({ message: "Invalid subcategory" });
      }
      whereClause.subCategory = subCategory;
    }

    // ✅ Tags Filter
    if (tags && typeof tags === "string") {
      const tagArray = tags.split(",").map(tag => tag.trim());
      const invalidTags = tagArray.filter(tag => !PRODUCT_TAGS.includes(tag));
      if (invalidTags.length > 0) {
        return res.status(400).json({ message: "Invalid tag(s)", invalidTags });
      }
      whereClause.tags = {
        [Op.overlap]: tagArray,
      };
    }

    // ✅ Full-text search on productName or description
    if (searchTerm && typeof searchTerm === "string") {
      whereClause[Op.or] = [
        { productName: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    // ✅ Sorting (default = newest first)
    let order: any = [["createdAt", "DESC"]];
    if (sort && typeof sort === "string") {
      const [field, direction] = sort.split("_");
      const validFields = ["finalPrice", "rating", "createdAt"];
      const validDirections = ["asc", "desc"];
      if (validFields.includes(field) && validDirections.includes(direction)) {
        order = [[field, direction.toUpperCase()]];
      } else {
        return res.status(400).json({ message: "Invalid sort parameter" });
      }
    }

    // 🔍 Fetch matching products
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order,
    });

    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      message: "✅ Products fetched successfully",
      // products,
      products: products.map(p => ({
  ...p.toJSON(),
  formattedPrice: formatGBP(p.finalPrice),
  formattedActualPrice: formatGBP(p.actualPrice),
  formattedDiscount: `${p.discount}%`,
})),

      pagination: {
        totalItems: count,
        currentPage: pageNum,
        totalPages,
        limit: limitNum,
      },
    });

  } catch (error: any) {
    console.error("❌ Error searching products:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async getProductById(req: Request, res: Response) {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "✅ Product fetched successfully",
      // product,
      product: {
        ...product.toJSON(),
        formattedPrice: formatGBP(product.finalPrice),
        formattedActualPrice: formatGBP(product.actualPrice),
        formattedDiscount: `${product.discount}%`,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching product:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}


}
