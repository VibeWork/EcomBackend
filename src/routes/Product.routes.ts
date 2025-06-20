// src/routes/Product.routes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/Product.controller';
import {authenticateJWT} from "../middlewares/auth.middleware";
import {adminOnly} from "../middlewares/admin.middleware";


const router = Router();
const controller = new ProductController();

router.post('/create', adminOnly ,  (req, res) => controller.createProduct(req, res));

// ⬇ New: Upload image(s)
router.post('/upload-image', adminOnly, (req, res) => controller.uploadProductImages(req, res));

//  Edit Product
router.put('/edit', adminOnly, (req, res) => controller.editProduct(req, res));

// Delete Product 
router.delete('/delete/:productId', adminOnly, (req, res) => controller.deleteProduct(req, res));

// Filter product by category , subcategory and tags
router.get('/filter', (req, res) => controller.getProductsByFilters(req, res));

router.get('/search', (req, res) => controller.searchProducts(req, res));

router.get('/:productId', (req, res) => controller.getProductById(req, res));






export default router;
