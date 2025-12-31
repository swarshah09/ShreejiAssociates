import express from 'express';
import multer from 'multer';
import { uploadImageToCloudinary } from '../controllers/imageUploadController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload image to Cloudinary
// Note: In production, add requireAdmin middleware for security
router.post('/upload', upload.single('image'), uploadImageToCloudinary);

export default router;

