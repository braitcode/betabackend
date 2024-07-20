import express from 'express';
import { createProduct, getOneProduct } from '../controllers/product.js';
import { getProductBySlug } from '../controllers/product.js';
import { deleteProduct } from '../controllers/product.js';
import { getAllProducts } from '../controllers/product.js';
import { relatedProducts } from '../controllers/product.js';
import { searchProduct } from '../controllers/product.js';
import { upload } from '../helpers/multer.js';
import { updateProduct } from '../controllers/product.js';

const router = express.Router();

router.post('/create', upload.array('images', 5),  createProduct); // working
router.get("/all", getAllProducts) // working
router.get("/product/:productId", getOneProduct) // working
router.get("/slug/:slug", getProductBySlug) // working
router.delete("/delete/:productId", deleteProduct ) // working
router.put("/update/:productId", upload.array('images', 5), updateProduct) // working
router.post("/search", searchProduct) // working
router.get("/related/:productId", relatedProducts) // working

export default router;