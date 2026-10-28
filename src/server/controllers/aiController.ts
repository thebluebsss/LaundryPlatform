import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import { inspectGarmentImage } from "../services/aiVisionService";

/**
 * @desc    Giám định ảnh đồ giặt & nhãn mác qua AI Computer Vision
 * @route   POST /api/ai/inspect-garment
 * @access  Public
 */
export const inspectGarment = asyncHandler(async (req: Request, res: Response) => {
  const { image, declaredService, itemName } = req.body;

  if (!image) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp dữ liệu hình ảnh sản phẩm (base64 hoặc URL)",
    });
  }

  const result = await inspectGarmentImage(image, declaredService || "wash_fold", itemName);

  successResponse(
    res,
    result,
    result.isDiscrepancy
      ? "Phát hiện sai lệch loại dịch vụ so với chất liệu vải thực tế"
      : "Kiểm tra chất liệu vải thành công, gói dịch vụ hoàn toàn phù hợp",
    200
  );
});

/**
 * @desc    Xác minh nhanh loại vải từ nhãn mác (care tag)
 * @route   POST /api/ai/verify-cloth
 * @access  Public
 */
export const verifyCloth = asyncHandler(async (req: Request, res: Response) => {
  const { image, serviceCategory } = req.body;

  if (!image) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng chụp ảnh mác áo hoặc bề mặt vải",
    });
  }

  const result = await inspectGarmentImage(image, serviceCategory || "wash_fold");
  successResponse(res, result, "Nhận diện mác vải thành công");
});
