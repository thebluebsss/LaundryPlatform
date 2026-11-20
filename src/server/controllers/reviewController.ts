// @ts-nocheck
import { Request, Response } from "express";
import { asyncHandler } from "../utils/errorHandler";
import { successResponse } from "../utils/response";
import Review from "../models/Review";
import Store from "../models/Store";
import User from "../models/User";

async function recalculateStoreAndShipperStats(storeId?: string, shipperId?: string) {
  try {
    if (storeId) {
      const storeReviews = (await (Review as any).find({ storeId, isHidden: false })) || [];
      const store =
        (await (Store as any).findOne({ customId: storeId })) ||
        (await (Store as any).findOne({ id: storeId })) ||
        (await (Store as any).findById(storeId).catch(() => null));
      if (store) {
        const avg =
          storeReviews.length > 0
            ? storeReviews.reduce((s: number, r: any) => s + Number(r.storeRating || 5), 0) /
              storeReviews.length
            : 5.0;
        const roundedRating = Math.round(avg * 10) / 10;
        await (Store as any).findByIdAndUpdate(store._id || store.id, {
          rating: roundedRating,
          reviewCount: storeReviews.length,
        });
      }
    }
    if (shipperId) {
      const driverReviews = (await (Review as any).find({ shipperId, isHidden: false })) || [];
      const driver = await (User as any).findById(shipperId).catch(() => null);
      if (driver) {
        const avg =
          driverReviews.length > 0
            ? driverReviews.reduce((s: number, r: any) => s + Number(r.shipperRating || 5), 0) /
              driverReviews.length
            : 5.0;
        const roundedRating = Math.round(avg * 10) / 10;
        await (User as any).findByIdAndUpdate(driver._id || driver.id, {
          rating: roundedRating,
          reviewCount: driverReviews.length,
        });
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
 * @access  Private (Customer)
 */
export const createOrUpdateReview = asyncHandler(async (req: Request, res: Response) => {
  const {
    orderId,
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

  const authUserId = String(req.user?._id || req.user?.id || "");
  const isAdmin = req.user?.role === "admin";
  const existing = await (Review as any).findOne({ orderId });

  if (existing) {
    if (!isAdmin && existing.userId && String(existing.userId) !== authUserId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa đánh giá của khách hàng khác",
      });
    }
    const updated = await (Review as any).findByIdAndUpdate(
      existing._id || existing.id,
      {
        storeRating: Math.min(5, Math.max(1, Number(storeRating || 5))),
        storeComment: storeComment ?? existing.storeComment,
        shipperRating: Math.min(5, Math.max(1, Number(shipperRating || 5))),
        shipperComment: shipperComment ?? existing.shipperComment,
        customerName: customerName || req.user?.fullName || existing.customerName,
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
    userId: authUserId || "user-default-id",
    customerName: customerName || req.user?.fullName || "Khách hàng",
    customerPhone: customerPhone || req.user?.phone || "",
    storeId: storeId || "store-hn-hoankiem",
    storeName: storeName || "Tiệm Giặt Sạch Sẽ",
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
 * @access  Private (Store Owner / Admin)
 */
export const replyToReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeReply } = req.body;

  let review = await (Review as any).findOne({ id });
  if (!review) {
    review = await (Review as any).findById(id).catch(() => null);
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

  if (
    req.user?.role !== "admin" &&
    req.user?.assignedStoreId &&
    review.storeId &&
    String(req.user.assignedStoreId) !== String(review.storeId)
  ) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền phản hồi đánh giá của cửa hàng khác",
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
