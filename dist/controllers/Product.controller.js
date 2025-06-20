"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const formidable_1 = require("formidable");
const Fileupload_utils_1 = require("../utils/Fileupload.utils");
const Product_Model_1 = __importDefault(require("../models/Product.Model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const sequelize_1 = require("sequelize");
const Product_constants_1 = require("../constants/Product.constants");
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const formatGBP = (amount) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
class ProductController {
    createProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const form = new formidable_1.IncomingForm({ multiples: true, keepExtensions: true });
            form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
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
                    const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                    const userId = decoded.userId;
                    const user = yield User_model_1.default.findOne({ where: { userId } });
                    if (!user) {
                        return res.status(404).json({ message: "User not found" });
                    }
                    // ✅ Validate Category
                    const category = (_a = fields.category) === null || _a === void 0 ? void 0 : _a[0];
                    if (category && !Product_constants_1.PRODUCT_CATEGORIES.includes(category)) {
                        return res.status(400).json({ message: "Invalid category selected" });
                    }
                    // ✅ Validate Subcategory
                    const subCategory = (_b = fields.subCategory) === null || _b === void 0 ? void 0 : _b[0];
                    if (subCategory && !Product_constants_1.PRODUCT_SUBCATEGORIES.includes(subCategory)) {
                        return res
                            .status(400)
                            .json({ message: "Invalid subcategory selected" });
                    }
                    // ✅ Validate Tags
                    const rawTags = ((_d = (_c = fields.tags) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.split(",").map(tag => tag.trim())) || [];
                    const invalidTags = rawTags.filter((tag) => !Product_constants_1.PRODUCT_TAGS.includes(tag));
                    if (invalidTags.length > 0) {
                        return res
                            .status(400)
                            .json({ message: "Invalid tags provided", invalidTags });
                    }
                    //  Image Handling
                    const images = [];
                    const rawImages = files.productImages;
                    const imageFiles = Array.isArray(rawImages)
                        ? rawImages
                        : rawImages
                            ? [rawImages]
                            : [];
                    for (const file of imageFiles) {
                        if (file && file.filepath) {
                            const uploadedImageUrl = yield (0, Fileupload_utils_1.cloudinaryImageUploadMethod)(file.filepath);
                            images.push(uploadedImageUrl);
                        }
                        else {
                            console.warn("⚠ Skipped invalid file:", file);
                        }
                    }
                    const stock = parseInt(((_e = fields.stock) === null || _e === void 0 ? void 0 : _e[0]) || "0");
                    //  Create Product
                    const product = yield Product_Model_1.default.create({
                        productCode: (_f = fields.productCode) === null || _f === void 0 ? void 0 : _f[0],
                        productName: (_g = fields.productName) === null || _g === void 0 ? void 0 : _g[0],
                        productImages: images,
                        description: (_h = fields.description) === null || _h === void 0 ? void 0 : _h[0],
                        actualPrice: parseFloat(((_j = fields.actualPrice) === null || _j === void 0 ? void 0 : _j[0]) || "0"),
                        discount: parseFloat(((_k = fields.discount) === null || _k === void 0 ? void 0 : _k[0]) || "0"),
                        finalPrice: parseFloat(((_l = fields.finalPrice) === null || _l === void 0 ? void 0 : _l[0]) || "0"),
                        category,
                        subCategory,
                        rating: parseFloat(((_m = fields.rating) === null || _m === void 0 ? void 0 : _m[0]) || "0"),
                        isFeatured: ((_o = fields.isFeatured) === null || _o === void 0 ? void 0 : _o[0]) === "true",
                        isTrending: ((_p = fields.isTrending) === null || _p === void 0 ? void 0 : _p[0]) === "true",
                        isNew: ((_q = fields.isNew) === null || _q === void 0 ? void 0 : _q[0]) === "true",
                        expiryDate: ((_r = fields.expiryDate) === null || _r === void 0 ? void 0 : _r[0]) ? new Date(fields.expiryDate[0]) : null,
                        harvestDate: ((_s = fields.harvestDate) === null || _s === void 0 ? void 0 : _s[0]) ? new Date(fields.harvestDate[0]) : null,
                        shelfLife: parseInt(((_t = fields.shelfLife) === null || _t === void 0 ? void 0 : _t[0]) || "0"),
                        returnable: ((_u = fields.returnable) === null || _u === void 0 ? void 0 : _u[0]) === "true",
                        storageInstructions: (_v = fields.storageInstructions) === null || _v === void 0 ? void 0 : _v[0],
                        maxPurchaseLimit: parseInt(((_w = fields.maxPurchaseLimit) === null || _w === void 0 ? void 0 : _w[0]) || "0"),
                        deliveryType: (_x = fields.deliveryType) === null || _x === void 0 ? void 0 : _x[0],
                        tags: rawTags,
                        stock
                    });
                    return res.status(201).json({
                        message: "✅ Product created successfully",
                        // product,
                        product: Object.assign(Object.assign({}, product.toJSON()), { formattedPrice: formatGBP(product.finalPrice), formattedActualPrice: formatGBP(product.actualPrice), formattedDiscount: `${product.discount}%` })
                    });
                }
                catch (error) {
                    console.error("❌ Error creating product:", error.message);
                    return res.status(500).json({
                        message: "Internal Server Error",
                        error: error.message,
                    });
                }
            }));
        });
    }
    editProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId, productCode, productName, description, actualPrice, discount, finalPrice, stock, category, subCategory, tags, rating, isFeatured, isTrending, isNew, expiryDate, harvestDate, shelfLife, returnable, storageInstructions, maxPurchaseLimit, deliveryType, productImages, // Array of image URLs
                 } = req.body;
                // 🔒 JWT Validation
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    return res.status(401).json({ message: "Missing or invalid token" });
                }
                const token = authHeader.split(" ")[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const user = yield User_model_1.default.findOne({ where: { userId } });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                if (!productId) {
                    return res.status(400).json({ message: "Product ID is required" });
                }
                const product = yield Product_Model_1.default.findByPk(productId);
                if (!product) {
                    return res.status(404).json({ message: "Product not found" });
                }
                // Check if new productCode already exists (unique)
                if (productCode && productCode !== product.productCode) {
                    const exists = yield Product_Model_1.default.findOne({ where: { productCode } });
                    if (exists) {
                        return res.status(409).json({ message: "Product code already in use" });
                    }
                }
                // Validate category and subcategory
                if (category && !Product_constants_1.PRODUCT_CATEGORIES.includes(category)) {
                    return res.status(400).json({ message: "Invalid category" });
                }
                if (subCategory && !Product_constants_1.PRODUCT_SUBCATEGORIES.includes(subCategory)) {
                    return res.status(400).json({ message: "Invalid subcategory" });
                }
                // Validate tags
                const cleanedTags = tags || [];
                const invalidTags = cleanedTags.filter((tag) => !Product_constants_1.PRODUCT_TAGS.includes(tag));
                if (invalidTags.length > 0) {
                    return res.status(400).json({ message: "Invalid tags", invalidTags });
                }
                // Validate delivery type
                const validDeliveryTypes = ["Instant", "Scheduled", "Next Morning"];
                if (deliveryType && !validDeliveryTypes.includes(deliveryType)) {
                    return res.status(400).json({ message: "Invalid delivery type" });
                }
                // 🛠️ Update product
                yield product.update({
                    productCode: productCode || product.productCode,
                    productName: productName || product.productName,
                    description: description || product.description,
                    actualPrice: actualPrice !== null && actualPrice !== void 0 ? actualPrice : product.actualPrice,
                    discount: discount !== null && discount !== void 0 ? discount : product.discount,
                    finalPrice: finalPrice !== null && finalPrice !== void 0 ? finalPrice : product.finalPrice,
                    category: category || product.category,
                    subCategory: subCategory || product.subCategory,
                    tags: cleanedTags.length ? cleanedTags : product.tags,
                    rating: rating !== null && rating !== void 0 ? rating : product.rating,
                    isFeatured: isFeatured !== null && isFeatured !== void 0 ? isFeatured : product.isFeatured,
                    isTrending: isTrending !== null && isTrending !== void 0 ? isTrending : product.isTrending,
                    isNew: isNew !== null && isNew !== void 0 ? isNew : product.isNew,
                    expiryDate: expiryDate ? new Date(expiryDate) : product.expiryDate,
                    harvestDate: harvestDate ? new Date(harvestDate) : product.harvestDate,
                    shelfLife: shelfLife !== null && shelfLife !== void 0 ? shelfLife : product.shelfLife,
                    returnable: returnable !== null && returnable !== void 0 ? returnable : product.returnable,
                    storageInstructions: storageInstructions || product.storageInstructions,
                    maxPurchaseLimit: maxPurchaseLimit !== null && maxPurchaseLimit !== void 0 ? maxPurchaseLimit : product.maxPurchaseLimit,
                    deliveryType: deliveryType || product.deliveryType,
                    productImages: productImages || product.productImages,
                    stock: stock !== null && stock !== void 0 ? stock : product.stock,
                });
                return res.status(200).json({
                    message: "✅ Product updated successfully",
                    // product,
                    product: Object.assign(Object.assign({}, product.toJSON()), { formattedPrice: formatGBP(product.finalPrice), formattedActualPrice: formatGBP(product.actualPrice), formattedDiscount: `${product.discount}%` })
                });
            }
            catch (error) {
                console.error("❌ Error updating product:", error.message);
                return res.status(500).json({
                    message: "Internal Server Error",
                    error: error.message,
                    details: error.errors || error,
                });
            }
        });
    }
    uploadProductImages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const form = new formidable_1.IncomingForm({ multiples: true, keepExtensions: true });
            form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (err)
                        return res.status(400).json({ message: 'Form parsing failed' });
                    const rawImages = files.productImages;
                    const imageFiles = Array.isArray(rawImages) ? rawImages : [rawImages];
                    const uploadedUrls = [];
                    for (const file of imageFiles) {
                        if (file && file.filepath) {
                            const url = yield (0, Fileupload_utils_1.cloudinaryImageUploadMethod)(file.filepath);
                            uploadedUrls.push(url);
                        }
                    }
                    return res.status(200).json({ message: 'Images uploaded', urls: uploadedUrls });
                }
                catch (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Upload failed', error: error.message });
                }
            }));
        });
    }
    deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    return res.status(401).json({ message: "Missing or invalid token" });
                }
                const token = authHeader.split(" ")[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const user = yield User_model_1.default.findOne({ where: { userId } });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                const { productId } = req.params;
                if (!productId) {
                    return res.status(400).json({ message: "Product ID is required" });
                }
                const product = yield Product_Model_1.default.findByPk(productId);
                if (!product) {
                    return res.status(404).json({ message: "Product not found" });
                }
                yield product.destroy();
                return res.status(200).json({ message: "✅ Product deleted successfully" });
            }
            catch (error) {
                console.error("❌ Error deleting product:", error.message);
                return res.status(500).json({
                    message: "Internal Server Error",
                    error: error.message,
                });
            }
        });
    }
    //included price sort 
    getProductsByFilters(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, subCategory, tags, page = 1, limit = 10, sort } = req.query;
                const pageNum = parseInt(page) || 1;
                const limitNum = parseInt(limit) || 10;
                const offset = (pageNum - 1) * limitNum;
                const whereClause = {};
                // ✅ Filter: Category
                if (category && typeof category === 'string') {
                    if (!Product_constants_1.PRODUCT_CATEGORIES.includes(category)) {
                        return res.status(400).json({ message: 'Invalid category' });
                    }
                    whereClause.category = category;
                }
                // ✅ Filter: Subcategory
                if (subCategory && typeof subCategory === 'string') {
                    if (!Product_constants_1.PRODUCT_SUBCATEGORIES.includes(subCategory)) {
                        return res.status(400).json({ message: 'Invalid subcategory' });
                    }
                    whereClause.subCategory = subCategory;
                }
                // ✅ Filter: Tags
                if (tags && typeof tags === 'string') {
                    const tagArray = tags.split(',').map(tag => tag.trim());
                    const invalidTags = tagArray.filter(tag => !Product_constants_1.PRODUCT_TAGS.includes(tag));
                    if (invalidTags.length > 0) {
                        return res.status(400).json({ message: "Invalid tag(s)", invalidTags });
                    }
                    whereClause.tags = {
                        [sequelize_1.Op.overlap]: tagArray,
                    };
                }
                // ✅ Sorting logic
                let order = [['createdAt', 'DESC']]; // default
                if (sort && typeof sort === 'string') {
                    const [field, direction] = sort.split('_');
                    const validFields = ['createdAt', 'finalPrice', 'rating'];
                    const validDirections = ['asc', 'desc'];
                    if (validFields.includes(field) && validDirections.includes(direction)) {
                        order = [[field, direction.toUpperCase()]];
                    }
                    else {
                        return res.status(400).json({ message: "Invalid sort parameter" });
                    }
                }
                // 🔎 Fetch
                const { count, rows: products } = yield Product_Model_1.default.findAndCountAll({
                    where: whereClause,
                    limit: limitNum,
                    offset,
                    order,
                });
                const totalPages = Math.ceil(count / limitNum);
                return res.status(200).json({
                    message: "✅ Products fetched successfully",
                    // products,
                    products: products.map(p => (Object.assign(Object.assign({}, p.toJSON()), { formattedPrice: formatGBP(p.finalPrice), formattedActualPrice: formatGBP(p.actualPrice), formattedDiscount: `${p.discount}%` }))),
                    pagination: {
                        totalItems: count,
                        currentPage: pageNum,
                        totalPages,
                        limit: limitNum,
                    },
                });
            }
            catch (error) {
                console.error("❌ Error filtering products:", error.message);
                return res.status(500).json({
                    message: "Internal Server Error",
                    error: error.message,
                });
            }
        });
    }
    searchProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, subCategory, tags, searchTerm, page = 1, limit = 10, sort, } = req.query;
                const pageNum = parseInt(page) || 1;
                const limitNum = parseInt(limit) || 10;
                const offset = (pageNum - 1) * limitNum;
                const whereClause = {};
                // ✅ Category Filter
                if (category && typeof category === "string") {
                    if (!Product_constants_1.PRODUCT_CATEGORIES.includes(category)) {
                        return res.status(400).json({ message: "Invalid category" });
                    }
                    whereClause.category = category;
                }
                // ✅ Subcategory Filter
                if (subCategory && typeof subCategory === "string") {
                    if (!Product_constants_1.PRODUCT_SUBCATEGORIES.includes(subCategory)) {
                        return res.status(400).json({ message: "Invalid subcategory" });
                    }
                    whereClause.subCategory = subCategory;
                }
                // ✅ Tags Filter
                if (tags && typeof tags === "string") {
                    const tagArray = tags.split(",").map(tag => tag.trim());
                    const invalidTags = tagArray.filter(tag => !Product_constants_1.PRODUCT_TAGS.includes(tag));
                    if (invalidTags.length > 0) {
                        return res.status(400).json({ message: "Invalid tag(s)", invalidTags });
                    }
                    whereClause.tags = {
                        [sequelize_1.Op.overlap]: tagArray,
                    };
                }
                // ✅ Full-text search on productName or description
                if (searchTerm && typeof searchTerm === "string") {
                    whereClause[sequelize_1.Op.or] = [
                        { productName: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { description: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                    ];
                }
                // ✅ Sorting (default = newest first)
                let order = [["createdAt", "DESC"]];
                if (sort && typeof sort === "string") {
                    const [field, direction] = sort.split("_");
                    const validFields = ["finalPrice", "rating", "createdAt"];
                    const validDirections = ["asc", "desc"];
                    if (validFields.includes(field) && validDirections.includes(direction)) {
                        order = [[field, direction.toUpperCase()]];
                    }
                    else {
                        return res.status(400).json({ message: "Invalid sort parameter" });
                    }
                }
                // 🔍 Fetch matching products
                const { count, rows: products } = yield Product_Model_1.default.findAndCountAll({
                    where: whereClause,
                    limit: limitNum,
                    offset,
                    order,
                });
                const totalPages = Math.ceil(count / limitNum);
                return res.status(200).json({
                    message: "✅ Products fetched successfully",
                    // products,
                    products: products.map(p => (Object.assign(Object.assign({}, p.toJSON()), { formattedPrice: formatGBP(p.finalPrice), formattedActualPrice: formatGBP(p.actualPrice), formattedDiscount: `${p.discount}%` }))),
                    pagination: {
                        totalItems: count,
                        currentPage: pageNum,
                        totalPages,
                        limit: limitNum,
                    },
                });
            }
            catch (error) {
                console.error("❌ Error searching products:", error.message);
                return res.status(500).json({
                    message: "Internal Server Error",
                    error: error.message,
                });
            }
        });
    }
    getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                if (!productId) {
                    return res.status(400).json({ message: "Product ID is required" });
                }
                const product = yield Product_Model_1.default.findByPk(productId);
                if (!product) {
                    return res.status(404).json({ message: "Product not found" });
                }
                return res.status(200).json({
                    message: "✅ Product fetched successfully",
                    // product,
                    product: Object.assign(Object.assign({}, product.toJSON()), { formattedPrice: formatGBP(product.finalPrice), formattedActualPrice: formatGBP(product.actualPrice), formattedDiscount: `${product.discount}%` }),
                });
            }
            catch (error) {
                console.error("❌ Error fetching product:", error.message);
                return res.status(500).json({
                    message: "Internal Server Error",
                    error: error.message,
                });
            }
        });
    }
}
exports.ProductController = ProductController;
