import React, { useState, useEffect } from "react";
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Clock,
  Star,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Save,
  Building,
  UserCheck,
  Bike,
  Sliders,
  RefreshCw,
  Eye,
  EyeOff,
  MessageSquareReply,
} from "lucide-react";
import { LaundryStore, OrderReview } from "../../../types";
import { DEFAULT_STORES } from "../../../data/storesData";
import { storesAPI, reviewsAPI } from "../../../services/api";

export const AdminStoresPage: React.FC = () => {
  const [stores, setStores] = useState<LaundryStore[]>(DEFAULT_STORES);
  const [allReviews, setAllReviews] = useState<OrderReview[]>([]);
  const [reviewStoreFilter, setReviewStoreFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<Partial<LaundryStore> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const [response, reviewsRes] = await Promise.allSettled([
        storesAPI.getAll(),
        reviewsAPI.getAll({ includeHidden: true }),
      ]);
      if (
        response.status === "fulfilled" &&
        response.value.data &&
        response.value.data.data &&
        response.value.data.data.length > 0
      ) {
        setStores(response.value.data.data);
      } else {
        setStores(DEFAULT_STORES);
      }
      if (reviewsRes.status === "fulfilled") {
        setAllReviews(reviewsRes.value.data?.data?.reviews || []);
      }
    } catch (error) {
      console.warn("Using fallback store data for admin");
      setStores(DEFAULT_STORES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleToggleReviewVisibility = async (review: OrderReview) => {
    try {
      const res = await reviewsAPI.toggleVisibility(review.id, !review.isHidden);
      const updated = res.data?.data;
      setAllReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, isHidden: updated ? updated.isHidden : !r.isHidden } : r
        )
      );
      showToast(
        !review.isHidden
          ? `Đã ẩn đánh giá #${review.id} khỏi trang khách hàng!`
          : `Đã khôi phục hiển thị đánh giá #${review.id}!`
      );
    } catch {
      showToast("Không thể cập nhật trạng thái ẩn/hiện của đánh giá");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingStore({
      name: "",
      code: "STORE_" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      address: "",
      district: "Quận 1",
      city: "hcm",
      phone: "0900 000 000",
      lat: 10.7769,
      lng: 106.7009,
      status: "open",
      openHours: "06:00 - 22:00",
      priceRange: "15.000đ - 120.000đ",
      features: ["Giặt sấy siêu tốc", "Khử trùng UV"],
      image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=600",
      managerName: "Quản Lý Mới",
      managerPhone: "0900 000 000",
      activeShippersCount: 8,
      activeMachinesCount: 16,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (store: LaundryStore) => {
    setEditingStore({ ...store });
    setIsModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore || !editingStore.name || !editingStore.address) return;

    setIsSubmitting(true);
    try {
      if (editingStore.id) {
        // Update
        await storesAPI.update(editingStore.id, editingStore);
        setStores((prev) =>
          prev.map((s) => (s.id === editingStore.id ? ({ ...s, ...editingStore } as LaundryStore) : s))
        );
        showToast("Đã cập nhật thông tin cửa hàng thành công!");
      } else {
        // Create
        const newStoreObj: LaundryStore = {
          id: "store-" + Date.now(),
          rating: 4.8,
          reviewCount: 1,
          ...(editingStore as LaundryStore),
        };
        try {
          await storesAPI.create(newStoreObj);
        } catch (err) {
          // Fallback local append
        }
        setStores((prev) => [newStoreObj, ...prev]);
        showToast("Đã thêm cửa hàng mới vào hệ thống!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      showToast("Có lỗi xảy ra: " + (error.message || "Thao tác thất bại"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa chi nhánh cửa hàng "${name}"?`)) {
      try {
        await storesAPI.delete(id);
        setStores((prev) => prev.filter((s) => s.id !== id));
        showToast("Đã xóa cửa hàng khỏi danh sách!");
      } catch (error) {
        setStores((prev) => prev.filter((s) => s.id !== id));
        showToast("Đã xóa cửa hàng!");
      }
    }
  };

  const handleQuickToggleStatus = async (store: LaundryStore) => {
    const nextStatus =
      store.status === "open" ? "busy" : store.status === "busy" ? "closed" : "open";

    try {
      await storesAPI.update(store.id, { status: nextStatus });
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, status: nextStatus } : s))
      );
      showToast(`Đã đổi trạng thái "${store.name}" sang ${nextStatus.toUpperCase()}`);
    } catch (err) {
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, status: nextStatus } : s))
      );
    }
  };

  const filteredStores = stores.filter((s) => {
    if (selectedCity !== "all" && s.city !== selectedCity) return false;
    if (selectedStatus !== "all" && s.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            <span>Quản Lý Hệ Thống Chuỗi Cửa Hàng</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Danh Sách Chi Nhánh Cửa Hàng</h1>
          <p className="text-xs text-slate-500 mt-1">
            Cấu hình địa chỉ GPS, phân quyền quản lý, cập nhật giờ mở cửa & tài xế giao nhận từng chi nhánh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStores}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition-all shadow-sm"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Cửa Hàng Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">TÌM KIẾM</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Mã, Tên cửa hàng, Địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">THÀNH PHỐ</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả Thành phố</option>
            <option value="hcm">TP. Hồ Chí Minh</option>
            <option value="hanoi">Hà Nội</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">TRẠNG THÁI</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="open">🟢 Đang mở cửa</option>
            <option value="busy">🟡 Đang bận / Quá tải</option>
            <option value="closed">🔴 Đóng cửa</option>
          </select>
        </div>

        <div className="flex items-end text-xs font-medium text-slate-500">
          <span>Tổng số: <strong className="text-slate-900">{filteredStores.length}</strong> chi nhánh</span>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded-lg uppercase">
                  {store.code}
                </span>

                <button
                  onClick={() => handleQuickToggleStatus(store)}
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 transition-all ${
                    store.status === "open"
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : store.status === "busy"
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                  }`}
                  title="Bấm để đổi nhanh trạng thái"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      store.status === "open"
                        ? "bg-emerald-500 animate-pulse"
                        : store.status === "busy"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  ></span>
                  <span>
                    {store.status === "open"
                      ? "Đang Mở"
                      : store.status === "busy"
                      ? "Đang Bận"
                      : "Đóng Cửa"}
                  </span>
                </button>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base mb-1">{store.name}</h3>

              <p className="text-xs text-slate-500 flex items-start gap-1.5 mb-3 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{store.address}</span>
              </p>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{store.managerName || "Chưa gán"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{store.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-amber-600" />
                  <span>{store.activeShippersCount || 8} Shipper</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span className="truncate">{store.openHours}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>GPS: [{store.lat}, {store.lng}]</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                {store.rating} ({store.reviewCount} Đánh giá)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(store)}
                  className="p-2 bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 rounded-xl transition-all shadow-sm"
                  title="Chỉnh sửa chi nhánh"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteStore(store.id, store.name)}
                  className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-xl transition-all shadow-sm"
                  title="Xóa chi nhánh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Admin Review Moderation Panel (Bảng `reviews`) */}
      <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>Quản Trị & Kiểm Duyệt Bảng `reviews` Toàn Hệ Thống</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">
              Danh Sách Đánh Giá Cửa Hàng & Tài Xế ({allReviews.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản trị viên giám sát chất lượng phục vụ từng chi nhánh và ẩn/hiện (`isHidden`) các đánh giá spam hoặc vi phạm tiêu chuẩn.
            </p>
          </div>

          <div className="min-w-[240px]">
            <select
              value={reviewStoreFilter}
              onChange={(e) => setReviewStoreFilter(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="all">Tất cả chi nhánh ({allReviews.length} đánh giá)</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allReviews
            .filter(
              (r) => reviewStoreFilter === "all" || r.storeId === reviewStoreFilter
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
                      Chi nhánh: <strong className="text-slate-800">{rev.storeName}</strong> ·{" "}
                      {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleReviewVisibility(rev)}
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
                      <strong className="text-amber-600">{rev.storeRating} ★</strong>
                    </div>
                    {rev.storeComment && (
                      <p className="text-slate-700 mt-1">“{rev.storeComment}”</p>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Shipper ({rev.shipperName || "N/A"}):</span>
                      <strong className="text-emerald-600">{rev.shipperRating} ★</strong>
                    </div>
                    {rev.shipperComment && (
                      <p className="text-slate-700 mt-1">“{rev.shipperComment}”</p>
                    )}
                  </div>
                </div>

                {rev.storeReply && (
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-[11px] text-slate-700 flex items-start gap-1.5">
                    <MessageSquareReply className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-blue-700">Phản hồi của Chủ tiệm:</strong>{" "}
                      {rev.storeReply}
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingStore && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl p-6 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingStore.id ? "Chỉnh Sửa Chi Nhánh Cửa Hàng" : "Thêm Chi Nhánh Cửa Hàng Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Cửa Hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStore.name || ""}
                    onChange={(e) => setEditingStore({ ...editingStore, name: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Tiệm Giặt Sấy Vô Trùng Q1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Định Danh (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStore.code || ""}
                    onChange={(e) => setEditingStore({ ...editingStore, code: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500"
                    placeholder="STORE_HCM_Q1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa Chỉ Chi Nhánh *
                </label>
                <input
                  type="text"
                  required
                  value={editingStore.address || ""}
                  onChange={(e) => setEditingStore({ ...editingStore, address: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  placeholder="185 Nguyễn Trãi, Phường Nguyễn Cư Trinh..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thành Phố</label>
                  <select
                    value={editingStore.city || "hcm"}
                    onChange={(e) => setEditingStore({ ...editingStore, city: e.target.value as any })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="hcm">TP. Hồ Chí Minh</option>
                    <option value="hanoi">Hà Nội</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quận / Huyện</label>
                  <input
                    type="text"
                    value={editingStore.district || ""}
                    onChange={(e) => setEditingStore({ ...editingStore, district: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Quận 1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={editingStore.phone || ""}
                    onChange={(e) => setEditingStore({ ...editingStore, phone: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="0908 123 456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vĩ Độ (GPS Lat)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingStore.lat || 10.7769}
                    onChange={(e) => setEditingStore({ ...editingStore, lat: parseFloat(e.target.value) })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kinh Độ (GPS Lng)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingStore.lng || 106.7009}
                    onChange={(e) => setEditingStore({ ...editingStore, lng: parseFloat(e.target.value) })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái Kho</label>
                  <select
                    value={editingStore.status || "open"}
                    onChange={(e) => setEditingStore({ ...editingStore, status: e.target.value as any })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="open">🟢 Đang Mở Cửa</option>
                    <option value="busy">🟡 Đang Bận / Tải Cao</option>
                    <option value="closed">🔴 Đóng Cửa Tạm Thời</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ Tên Quản Lý Cửa Hàng</label>
                  <input
                    type="text"
                    value={editingStore.managerName || ""}
                    onChange={(e) => setEditingStore({ ...editingStore, managerName: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="Lê Văn An"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giờ Mở Cửa</label>
                  <input
                    type="text"
                    value={editingStore.openHours || ""}
                    onChange={(e) => setEditingStore({ ...editingStore, openHours: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    placeholder="06:00 - 22:00"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoresPage;
