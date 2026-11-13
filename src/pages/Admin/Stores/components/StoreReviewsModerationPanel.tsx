import React from "react";
import { Star, Eye, EyeOff, MessageSquareReply } from "lucide-react";
import { LaundryStore, OrderReview } from "../../../../types";
import { InputSelect } from "../../../../components/InputSelect";

interface StoreReviewsModerationPanelProps {
  stores: LaundryStore[];
  allReviews: OrderReview[];
  reviewStoreFilter: string;
  setReviewStoreFilter: (val: string) => void;
  onToggleReviewVisibility: (review: OrderReview) => void;
}

export const StoreReviewsModerationPanel: React.FC<
  StoreReviewsModerationPanelProps
> = ({
  stores,
  allReviews,
  reviewStoreFilter,
  setReviewStoreFilter,
  onToggleReviewVisibility,
}) => {
  return (
    <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>Quản Trị & Kiểm Duyệt Đánh Giá Toàn Hệ Thống</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mt-1">
            Danh Sách Đánh Giá Cửa Hàng & Tài Xế ({allReviews.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị viên giám sát chất lượng phục vụ từng chi nhánh và ẩn/hiện
            các đánh giá spam hoặc vi phạm tiêu chuẩn.
          </p>
        </div>

        <div className="min-w-[260px]">
          <InputSelect
            value={reviewStoreFilter}
            options={[
              {
                value: "all",
                label: `Tất cả chi nhánh (${allReviews.length} đánh giá)`,
              },
              ...stores.map((s) => ({
                value: s.id,
                label: `${s.code} - ${s.name}`,
              })),
            ]}
            onChange={(e) => setReviewStoreFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allReviews
          .filter(
            (r) =>
              reviewStoreFilter === "all" || r.storeId === reviewStoreFilter
          )
          .map((rev) => (
            <div
              key={rev.id}
              className={`p-4 rounded-2xl border space-y-3 text-xs transition-colors ${
                rev.isHidden
                  ? "bg-rose-50/40 border-rose-200 opacity-75"
                  : "bg-slate-50 border-slate-200/80"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-500">
                      {rev.id}
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      {rev.customerName}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      Đơn #{rev.orderId}
                    </span>
                    {rev.isHidden && (
                      <span className="text-[10px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded-full">
                        Đã ẩn bởi Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Chi nhánh:{" "}
                    <strong className="text-slate-800">{rev.storeName}</strong> ·{" "}
                    {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleReviewVisibility(rev)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 ${
                    rev.isHidden
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-100 hover:bg-rose-200 text-rose-700"
                  }`}
                >
                  {rev.isHidden ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Hiện Lại</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ẩn Vi Phạm</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Điểm Cửa hàng:</span>
                    <strong className="text-amber-600">
                      {rev.storeRating} ★
                    </strong>
                  </div>
                  {rev.storeComment && (
                    <p className="text-slate-700 mt-1">“{rev.storeComment}”</p>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Shipper ({rev.shipperName || "N/A"}):</span>
                    <strong className="text-emerald-600">
                      {rev.shipperRating} ★
                    </strong>
                  </div>
                  {rev.shipperComment && (
                    <p className="text-slate-700 mt-1">
                      “{rev.shipperComment}”
                    </p>
                  )}
                </div>
              </div>

              {rev.storeReply && (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-[11px] text-slate-700 flex items-start gap-1.5">
                  <MessageSquareReply className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-blue-700">
                      Phản hồi của Chủ tiệm:
                    </strong>{" "}
                    {rev.storeReply}
                  </span>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
