import express from "express";
import * as aiController from "../controllers/aiController";

const router = express.Router();

/**
 * @swagger
 * /api/ai/inspect-garment:
 *   post:
 *     summary: AI Computer Vision nhận diện chất liệu vải & phát hiện gian lận giá
 *     tags: [AI Vision]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 data URI hoặc URL của ảnh trang phục / mác áo
 *               declaredService:
 *                 type: string
 *                 description: Gói giặt khách tự chọn (wash_fold, dry_clean, special_care, heavy_items)
 *               itemName:
 *                 type: string
 *                 description: Tên đồ giặt (tùy chọn)
 *     responses:
 *       200:
 *         description: Kết quả phân tích chất liệu vải, khuyến nghị và cảnh báo sai lệch giá
 */
router.post("/inspect-garment", aiController.inspectGarment);
router.post("/verify-cloth", aiController.verifyCloth);

export default router;
