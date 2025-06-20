"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/Product.routes.ts
const express_1 = require("express");
const Product_controller_1 = require("../controllers/Product.controller");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = (0, express_1.Router)();
const controller = new Product_controller_1.ProductController();
router.post('/create', admin_middleware_1.adminOnly, (req, res) => controller.createProduct(req, res));
// ⬇ New: Upload image(s)
router.post('/upload-image', admin_middleware_1.adminOnly, (req, res) => controller.uploadProductImages(req, res));
//  Edit Product
router.put('/edit', admin_middleware_1.adminOnly, (req, res) => controller.editProduct(req, res));
// Delete Product 
router.delete('/delete/:productId', admin_middleware_1.adminOnly, (req, res) => controller.deleteProduct(req, res));
// Filter product by category , subcategory and tags
router.get('/filter', (req, res) => controller.getProductsByFilters(req, res));
router.get('/search', (req, res) => controller.searchProducts(req, res));
router.get('/:productId', (req, res) => controller.getProductById(req, res));
exports.default = router;
