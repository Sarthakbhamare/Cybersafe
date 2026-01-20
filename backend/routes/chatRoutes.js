import express from 'express';
import { chatWithGemini, getChatHistory, clearChatHistory } from '../controller/chatController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /api/chat - Send message to Gemini chatbot (requires auth)
router.post('/', auth, chatWithGemini);

// GET /api/chat/history - Get chat history for logged in user
router.get('/history', auth, getChatHistory);

// DELETE /api/chat/history - Clear chat history for logged in user
router.delete('/history', auth, clearChatHistory);

export default router;
