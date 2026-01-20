import express from 'express';
import { chatWithGemini } from '../controller/chatController.js';

const router = express.Router();

// POST /api/chat - Send message to Gemini chatbot
router.post('/', chatWithGemini);

export default router;
