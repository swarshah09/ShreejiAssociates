import express from 'express';
import { submitEnquiry } from '../controllers/enquiryController.js';

const router = express.Router();

// Submit enquiry form
router.post('/', submitEnquiry);

export default router;

