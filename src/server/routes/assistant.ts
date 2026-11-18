import express from "express";
import { chatWithAssistant } from "../controllers/assistantController";

const router = express.Router();

/**
 * @route   POST /api/assistant/chat
 * @desc    Hỏi đáp với Trợ lý Chatbot thông minh (Gemini AI + Dữ liệu thực tế hệ thống) cho Khách hàng và Shipper
 * @access  Public
 */
router.post("/chat", chatWithAssistant);

export default router;
