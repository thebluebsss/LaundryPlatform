import React, { useEffect, useState } from "react";
import { Star, Store, Bike, X, MessageSquareReply, CheckCircle2 } from "lucide-react";
import { LaundryStore, OrderReview } from "../types";
import { reviewsAPI } from "../services/api";

interface StoreReviewsModalProps {
  store: LaundryStore | null;
  onClose: () => void;
  onBookStore?: (store: LaundryStore) => void;
}

export const StoreReviewsModal: React.FC<StoreReviewsModalProps> = ({
  store,
  onClose,
  onBookStore,
}) => {
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!store) return;
    setLoading(true);
    reviewsAPI
      .getAll({ storeId: store.id })
      .then((res) => {
        setReviews(res.data?.data?.reviews || []);
      })
      .catch(() => {
        setReviews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [store]);

  if (!store) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>
                Ranking {store.rating.toFixed(1)}/5.0 ({store.reviewCount} lượt đánh giá)
              </span>
            </div>
            <h3 className="text-base font-black mt-0.5">{store.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{store.address}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Đang tải danh sách đánh giá thực tế từ bảng reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/80">
              Chưa có nhận xét chi tiết mới cho chi nhánh này.
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">
                        {rev.customerName}
                      </span>
                      <span className="font-mono text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-bold">
                        Đơn #{rev.orderId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.storeRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.storeComment && (
                  <p className="text-slate-700 leading-relaxed">
                    “{rev.storeComment}”
                  </p>
                )}

                {rev.shipperName && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 px-2.5 py-1.5 rounded-xl">
                    <Bike className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Đánh giá Shipper <strong>{rev.shipperName}</strong>:{" "}
                      <strong>{rev.shipperRating} ★</strong>
                      {rev.shipperComment ? ` — "${rev.shipperComment}"` : ""}
                    </span>
                  </div>
                )}

                {rev.storeReply && (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-700">
                      <MessageSquareReply className="w-3.5 h-3.5" />
                      <span>Phản hồi từ Chủ tiệm giặt:</span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {rev.storeReply}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% đánh giá từ đơn giặt đã hoàn thành (`reviews`)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Đóng
            </button>
            {onBookStore && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookStore(store);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer"
              >
                Đặt Giặt Tại Tiệm Này →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
