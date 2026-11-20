import express from "express";
import { chatWithAssistant } from "../controllers/assistantController";
import { optionalAuth } from "../middleware/auth";

const router = express.Router();

/**
 * @route   POST /api/assistant/chat
 * @desc    Hỏi đáp với Trợ lý Chatbot thông minh (Gemini AI + Dữ liệu thực tế hệ thống) cho Khách hàng và Shipper
 * @access  Public (dữ liệu cá nhân chỉ trả khi đã đăng nhập JWT)
 */
router.post("/chat", optionalAuth as any, chatWithAssistant);

export default router;
