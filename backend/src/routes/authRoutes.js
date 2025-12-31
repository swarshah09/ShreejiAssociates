import express from 'express';
import { loginAdmin, verifyAdmin } from '../controllers/authController.js';

const router = express.Router();

// Admin login endpoint
router.post('/login', loginAdmin);

// Verify admin token endpoint
router.get('/verify', verifyAdmin);

export default router;

