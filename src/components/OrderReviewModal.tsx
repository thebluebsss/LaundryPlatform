import React, { useState, useEffect } from "react";
import { Star, Store, Bike, X, MessageSquare, CheckCircle2 } from "lucide-react";
import { LaundryOrder, OrderReview } from "../types";
import { reviewsAPI } from "../services/api";
import { useToast } from "./Toast";

interface OrderReviewModalProps {
  order: LaundryOrder | null;
  existingReview?: OrderReview | null;
  onClose: () => void;
  onSaved: (review: OrderReview) => void;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  order,
  existingReview,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToast();
  const [storeRating, setStoreRating] = useState<number>(5);
  const [storeComment, setStoreComment] = useState<string>("");
  const [shipperRating, setShipperRating] = useState<number>(5);
  const [shipperComment, setShipperComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (existingReview) {
      setStoreRating(existingReview.storeRating || 5);
      setStoreComment(existingReview.storeComment || "");
      setShipperRating(existingReview.shipperRating || 5);
      setShipperComment(existingReview.shipperComment || "");
    } else {
      setStoreRating(5);
      setStoreComment("");
      setShipperRating(5);
      setShipperComment("");
    }
  }, [existingReview, order]);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await reviewsAPI.createOrUpdate({
        orderId: order.id,
        userId: order.userId || "user-default-id",
        customerName: order.customerName || "Khách hàng",
        customerPhone: order.phoneNumber || "",
        storeId: order.storeId || "store-hcm-q1",
        storeName: order.storeName || "Tiệm Giặt Sấy Vô Trùng Q1",
        shipperId: order.shipperId || "drv-1",
        shipperName: order.shipperName || "Nguyễn Văn Hùng",
        storeRating,
        storeComment,
        shipperRating,
        shipperComment,
      });
      const saved = res.data?.data;
      showToast(
        "Đã lưu đánh giá chất lượng cửa hàng & tài xế vào bảng reviews!",
        "success"
      );
      if (saved) {
        onSaved(saved);
      }
      onClose();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Không thể gửi đánh giá lúc này",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Bảng reviews · Đơn #{order.id}
            </span>
            <h3 className="text-base font-black mt-1">
              Đánh Giá Chất Lượng Cửa Hàng & Tài Xế
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* 1. Store Rating Section */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-blue-600">
                    1. Đánh giá Cửa hàng giặt sấy
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    {order.storeName || "Tiệm Giặt Sấy Vô Trùng Q1"}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                {storeRating}/5 Sao
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStoreRating(star)}
                  className="p-1.5 rounded-xl hover:bg-white transition-transform active:scale-90 cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= storeRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={storeComment}
              onChange={(e) => setStoreComment(e.target.value)}
              placeholder="Nhận xét về độ sạch thơm, gấp phẳng, cân đo minh bạch tại cửa hàng..."
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 2. Shipper Rating Section */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-emerald-700">
                    2. Đánh giá Tài xế giao nhận (Shipper)
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    {order.shipperName || "Nguyễn Văn Hùng"}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-lg">
                {shipperRating}/5 Sao
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setShipperRating(star)}
                  className="p-1.5 rounded-xl hover:bg-white transition-transform active:scale-90 cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= shipperRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={shipperComment}
              onChange={(e) => setShipperComment(e.target.value)}
              placeholder="Nhận xét về thời gian lấy/trả đồ, thái độ phục vụ của tài xế..."
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submitting
                  ? "Đang lưu..."
                  : existingReview
                  ? "Cập Nhật Đánh Giá"
                  : "Gửi Đánh Giá Ngay"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
