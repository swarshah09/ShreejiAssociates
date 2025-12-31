import express from 'express';
import multer from 'multer';
import { detectPlotsForProject } from '../controllers/plotDetectionController.js';

const router = express.Router();

// Store uploaded image in memory; we forward bytes to Python service
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/plot-detection/:projectId
// Body: multipart/form-data with field "file" containing the layout image
router.post('/:projectId', upload.single('file'), detectPlotsForProject);

export default router;


