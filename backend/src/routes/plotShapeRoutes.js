import express from 'express';
import {
  getPlotShapes,
  savePlotShapes,
  deletePlotShapes
} from '../controllers/plotShapeController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET: Public access - Anyone can view plot shapes
router.get('/:projectId', getPlotShapes);

// POST/PUT/DELETE: Admin only
router.post('/:projectId', requireAdmin, savePlotShapes);
router.put('/:projectId', requireAdmin, savePlotShapes);
router.delete('/:projectId', requireAdmin, deletePlotShapes);

export default router;

