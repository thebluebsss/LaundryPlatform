// @ts-nocheck
import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import Review from "../models/Review";
import Store from "../models/Store";
import User from "../models/User";

export const DEFAULT_REVIEWS = [
  {
    id: "REV-1001",
    orderId: "ORD-8820",
    userId: "user-default-id",
    customerName: "Phạm Khánh Linh",
    customerPhone: "0911111111",
    storeId: "store-hcm-q1",
    storeName: "Tiệm Giặt Sấy Vô Trùng Q1 - Nguyễn Trãi",
    shipperId: "drv-1",
    shipperName: "Nguyễn Văn Hùng",
    storeRating: 5,
    storeComment:
      "Áo vest giặt hấp giữ phom chuẩn như mới, đồ công sở ủi hơi rất thơm và phẳng phiu!",
    shipperRating: 5,
    shipperComment:
      "Anh Hùng giao nhận đúng giờ, thái độ lịch sự, che chắn túi đồ cẩn thận khi trời mưa.",
    storeReply:
      "Cảm ơn chị Khánh Linh đã tin tưởng Tiệm Giặt Sấy Vô Trùng Q1! Hẹn phục vụ chị ở các đơn giặt tiếp theo ạ.",
    repliedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    isHidden: false,
    createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
  },
  {
    id: "REV-1002",
    orderId: "ORD-8818",
    userId: "user-demo-2",
    customerName: "Trần Bảo Ngọc",
    customerPhone: "0912345678",
    storeId: "store-hcm-q1",
    storeName: "Tiệm Giặt Sấy Vô Trùng Q1 - Nguyễn Trãi",
    shipperId: "drv-2",
    shipperName: "Trần Quốc Tuấn",
    storeRating: 5,
    storeComment:
      "Cân thực tế chuẩn xác từng lạng, có thông báo xác nhận khối lượng trên App nên rất minh bạch và yên tâm.",
    shipperRating: 5,
    shipperComment:
      "Shipper Tuấn lấy đồ tận sảnh chung cư nhanh gọn chỉ sau 15 phút đặt đơn.",
    storeReply: "",
    repliedAt: null,
    isHidden: false,
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
  {
    id: "REV-1003",
    orderId: "ORD-8815",
    userId: "user-demo-3",
    customerName: "Lê Hoàng Phúc",
    customerPhone: "0988776655",
    storeId: "store-hcm-bt",
    storeName: "Tiệm Giặt Nhanh 24/7 Bình Thạnh - Đinh Bộ Lĩnh",
    shipperId: "drv-3",
    shipperName: "Phạm Hoàng Nam",
    storeRating: 4,
    storeComment:
      "Chăn bông sấy khô sạch mùi ẩm mốc, tuy nhiên giờ cao điểm buổi tối tiệm hơi đông đơn.",
    shipperRating: 5,
    shipperComment:
      "Bạn shipper Nam hỗ trợ mang chăn nặng lên tận tầng 4 rất nhiệt tình!",
    storeReply:
      "Tiệm Bình Thạnh xin ghi nhận góp ý của anh Phúc và đã bổ sung thêm 2 máy sấy công nghiệp ca tối ạ!",
    repliedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    isHidden: false,
    createdAt: new Date(Date.now() - 42 * 3600 * 1000).toISOString(),
  },
  {
    id: "REV-1004",
    orderId: "ORD-8812",
    userId: "user-demo-4",
    customerName: "Ngô Mỹ Duyên",
    customerPhone: "0934556677",
    storeId: "store-hn-cg",
    storeName: "Tiệm Giặt Hấp Cầu Giấy - Xuân Thủy",
    shipperId: "drv-5",
    shipperName: "Vũ Hải Đăng",
    storeRating: 5,
    storeComment:
      "Đồ gấp gọn gàng phân loại màu sáng tối riêng biệt, hương nước xả Lavender rất dễ chịu.",
    shipperRating: 5,
    shipperComment: "Giao trả đúng khung giờ hẹn buổi chiều, gọi điện trước 10 phút.",
    storeReply: "Cảm ơn bạn Duyên đã ủng hộ chi nhánh Cầu Giấy - Xuân Thủy!",
    repliedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    isHidden: false,
    createdAt: new Date(Date.now() - 68 * 3600 * 1000).toISOString(),
  },
];

async function ensureDefaultReviewsSeeded() {
  try {
    const existing = await (Review as any).find({});
    const existingOrderIds = new Set((existing || []).map((r: any) => r.orderId));
    for (const sample of DEFAULT_REVIEWS) {
      if (!existingOrderIds.has(sample.orderId)) {
        try {
          await (Review as any).create(sample);
        } catch (e) {}
      }
    }
  } catch (e) {}
}

async function recalculateStoreAndShipperStats(storeId?: string, shipperId?: string) {
  try {
    if (storeId) {
      const storeReviews = await (Review as any).find({ storeId, isHidden: false });
      if (storeReviews && storeReviews.length > 0) {
        const avg =
          storeReviews.reduce((s: number, r: any) => s + Number(r.storeRating || 5), 0) /
          storeReviews.length;
        const roundedRating = Math.round(avg * 10) / 10;
        const store = await (Store as any).findOne({ id: storeId }) || await (Store as any).findById(storeId);
        if (store) {
          const baseCount = Math.max(store.reviewCount || 100, storeReviews.length);
          await (Store as any).findByIdAndUpdate(store._id || store.id, {
            rating: roundedRating,
            reviewCount: baseCount + 1,
          });
        }
      }
    }
    if (shipperId) {
      const driverReviews = await (Review as any).find({ shipperId, isHidden: false });
      if (driverReviews && driverReviews.length > 0) {
        const avg =
          driverReviews.reduce((s: number, r: any) => s + Number(r.shipperRating || 5), 0) /
          driverReviews.length;
        const roundedRating = Math.round(avg * 10) / 10;
        const driver = await (User as any).findById(shipperId);
        if (driver) {
          await (User as any).findByIdAndUpdate(driver._id || driver.id, {
            rating: roundedRating,
            reviewCount: driverReviews.length,
          });
        }
      }
    }
  } catch (e) {}
}

/**
 * @desc    Lấy danh sách đánh giá (lọc theo storeId, shipperId, orderId, userId, includeHidden)
 * @route   GET /api/reviews
 * @access  Public
 */
export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultReviewsSeeded();

  const { storeId, shipperId, orderId, userId, includeHidden } = req.query;
  const query: any = {};

  if (storeId && storeId !== "all") query.storeId = storeId;
  if (shipperId && shipperId !== "all") query.shipperId = shipperId;
  if (orderId) query.orderId = orderId;
  if (userId) query.userId = userId;
  if (includeHidden !== "true") {
    query.isHidden = false;
  }

  let reviews = await (Review as any).find(query).sort({ createdAt: -1 });
  if (!reviews) reviews = [];

  const visibleReviews = reviews.filter((r: any) => !r.isHidden);
  const avgStoreRating =
    visibleReviews.length > 0
      ? Number(
          (
            visibleReviews.reduce((s: number, r: any) => s + Number(r.storeRating || 5), 0) /
            visibleReviews.length
          ).toFixed(1)
        )
      : 5.0;

  const avgShipperRating =
    visibleReviews.length > 0
      ? Number(
          (
            visibleReviews.reduce((s: number, r: any) => s + Number(r.shipperRating || 5), 0) /
            visibleReviews.length
          ).toFixed(1)
        )
      : 5.0;

  res.json({
    success: true,
    data: {
      reviews,
      stats: {
        totalReviews: reviews.length,
        visibleCount: visibleReviews.length,
        avgStoreRating,
        avgShipperRating,
      },
    },
  });
});

/**
 * @desc    Khách hàng gửi hoặc cập nhật đánh giá chất lượng cửa hàng và tài xế cho đơn hàng đã hoàn thành
 * @route   POST /api/reviews
 * @access  Public / Customer
 */
export const createOrUpdateReview = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultReviewsSeeded();

  const {
    orderId,
    userId,
    customerName,
    customerPhone,
    storeId,
    storeName,
    shipperId,
    shipperName,
    storeRating,
    storeComment,
    shipperRating,
    shipperComment,
  } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã đơn hàng (orderId) để lưu đánh giá",
    });
  }

  const existing = await (Review as any).findOne({ orderId });

  if (existing) {
    const updated = await (Review as any).findByIdAndUpdate(
      existing._id || existing.id,
      {
        storeRating: Number(storeRating || 5),
        storeComment: storeComment ?? existing.storeComment,
        shipperRating: Number(shipperRating || 5),
        shipperComment: shipperComment ?? existing.shipperComment,
        customerName: customerName || existing.customerName,
        shipperId: shipperId || existing.shipperId,
        shipperName: shipperName || existing.shipperName,
      },
      { new: true }
    );
    await recalculateStoreAndShipperStats(
      updated?.storeId || storeId,
      updated?.shipperId || shipperId
    );
    return successResponse(res, updated, "Đã cập nhật đánh giá của bạn thành công");
  }

  const newReview = await (Review as any).create({
    id: "REV-" + Math.floor(1005 + Math.random() * 8990),
    orderId,
    userId: userId || "user-default-id",
    customerName: customerName || "Khách hàng",
    customerPhone: customerPhone || "",
    storeId: storeId || "store-hcm-q1",
    storeName: storeName || "Tiệm Giặt Sấy Vô Trùng Q1",
    shipperId: shipperId || "drv-1",
    shipperName: shipperName || "Nguyễn Văn Hùng",
    storeRating: Math.min(5, Math.max(1, Number(storeRating || 5))),
    storeComment: storeComment || "",
    shipperRating: Math.min(5, Math.max(1, Number(shipperRating || 5))),
    shipperComment: shipperComment || "",
    storeReply: "",
    repliedAt: null,
    isHidden: false,
  });

  await recalculateStoreAndShipperStats(newReview.storeId, newReview.shipperId);

  successResponse(
    res,
    newReview,
    "Cảm ơn bạn đã đánh giá chất lượng cửa hàng và tài xế!",
    201
  );
});

/**
 * @desc    Chủ cửa hàng (Store Manager) phản hồi đánh giá của khách hàng
 * @route   PATCH /api/reviews/:id/reply
 * @access  Store Manager / Admin
 */
export const replyToReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeReply } = req.body;

  let review = await (Review as any).findOne({ id });
  if (!review) {
    review = await (Review as any).findById(id);
  }
  if (!review) {
    review = await (Review as any).findOne({ orderId: id });
  }

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy đánh giá để phản hồi",
    });
  }

  const updated = await (Review as any).findByIdAndUpdate(
    review._id || review.id,
    {
      storeReply: storeReply || "",
      repliedAt: storeReply ? new Date().toISOString() : null,
    },
    { new: true }
  );

  successResponse(res, updated, "Đã gửi phản hồi của cửa hàng tới khách hàng");
});

/**
 * @desc    Quản trị viên (System Admin) ẩn/hiện đánh giá vi phạm hoặc spam
 * @route   PATCH /api/reviews/:id/visibility
 * @access  Admin
 */
export const toggleReviewVisibility = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isHidden } = req.body;

  let review = await (Review as any).findOne({ id });
  if (!review) {
    review = await (Review as any).findById(id);
  }

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy đánh giá",
    });
  }

  const nextHidden =
    typeof isHidden === "boolean" ? isHidden : !Boolean(review.isHidden);

  const updated = await (Review as any).findByIdAndUpdate(
    review._id || review.id,
    { isHidden: nextHidden },
    { new: true }
  );

  await recalculateStoreAndShipperStats(review.storeId, review.shipperId);

  successResponse(
    res,
    updated,
    nextHidden
      ? "Đã ẩn đánh giá khỏi trang hiển thị công khai"
      : "Đã khôi phục hiển thị đánh giá"
  );
});
