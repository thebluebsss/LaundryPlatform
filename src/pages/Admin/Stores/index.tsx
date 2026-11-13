import React from "react";
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
  Building,
  UserCheck,
  Bike,
  RefreshCw,
} from "lucide-react";
import { HANOI_DISTRICTS } from "../../../data";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { useAdminStores } from "./hook";
import { StoreFormModal } from "./components/StoreFormModal";
import { StoreReviewsModerationPanel } from "./components/StoreReviewsModerationPanel";

export const AdminStoresPage: React.FC = () => {
  const {
    stores,
    allReviews,
    reviewStoreFilter,
    setReviewStoreFilter,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedStatus,
    setSelectedStatus,
    isModalOpen,
    setIsModalOpen,
    editingStore,
    setEditingStore,
    isSubmitting,
    toastMessage,
    filteredStores,
    fetchStores,
    handleToggleReviewVisibility,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSaveStore,
    handleDeleteStore,
    handleQuickToggleStatus,
  } = useAdminStores();

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
          <h1 className="text-2xl font-extrabold text-slate-900">
            Danh Sách Chi Nhánh Cửa Hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cấu hình địa chỉ GPS, phân quyền quản lý, cập nhật giờ mở cửa & tài
            xế giao nhận từng chi nhánh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ButtonOutLine
            onClick={fetchStores}
            iconStart={
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            }
            label="Làm mới"
            className="!w-auto !h-10 !px-3.5"
            textClassName="!text-xs"
          />

          <ButtonCustom
            onClick={handleOpenAddModal}
            iconStart={<Plus className="w-4 h-4" />}
            label="Thêm Cửa Hàng Mới"
            className="!w-auto !h-10 !px-4"
            textClassName="!text-xs"
          />
        </div>
      </div>

      {/* Filter Toolbar using global InputText and InputSelect */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
        <InputText
          title="TÌM KIẾM"
          placeholder="Mã, Tên cửa hàng, Địa chỉ..."
          startAdornment={<Search className="w-4 h-4 text-slate-400" />}
          inputProps={{
            value: searchQuery,
            onChange: (e: any) => setSearchQuery(e.target.value),
          }}
        />

        <InputSelect
          title="QUẬN / HUYỆN (HÀ NỘI)"
          value={selectedCity}
          options={[
            { value: "all", label: "Tất cả Quận / Huyện Hà Nội" },
            ...HANOI_DISTRICTS.map((d) => ({
              value: d.name,
              label: d.name,
            })),
          ]}
          onChange={(e) => setSelectedCity(e.target.value)}
        />

        <InputSelect
          title="TRẠNG THÁI"
          value={selectedStatus}
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "open", label: "🟢 Đang mở cửa" },
            { value: "busy", label: "🟡 Đang bận / Quá tải" },
            { value: "closed", label: "🔴 Đóng cửa" },
          ]}
          onChange={(e) => setSelectedStatus(e.target.value)}
        />

        <div className="flex items-center pb-2 text-xs font-medium text-slate-500">
          <span>
            Tổng số:{" "}
            <strong className="text-slate-900">{filteredStores.length}</strong>{" "}
            chi nhánh
          </span>
        </div>
      </div>

      {/* Stores Grid */}
      {!loading && filteredStores.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 mb-6">
          <Store className="w-10 h-10 text-blue-500 mx-auto" />
          <h3 className="text-base font-black text-slate-900">
            Chưa có chi nhánh cửa hàng nào trong hệ thống
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Bấm nút "Thêm Cửa Hàng Mới" bên dưới để tạo chi nhánh đầu tiên và
            ghim vị trí trên Google Maps.
          </p>
          <ButtonCustom
            type="button"
            onClick={handleOpenAddModal}
            iconStart={<Plus className="w-4 h-4" />}
            label="Thêm Cửa Hàng Đầu Tiên"
            className="!w-auto !h-10 !px-5 mx-auto"
            textClassName="!text-xs"
          />
        </div>
      )}

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

              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                {store.name}
              </h3>

              <p className="text-xs text-slate-500 flex items-start gap-1.5 mb-3 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{store.address}</span>
              </p>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">
                    {store.managerName || "Chưa gán"}
                  </span>
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
                <span>
                  GPS: [{store.lat}, {store.lng}]
                </span>
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

      {/* System Admin Review Moderation Panel */}
      <StoreReviewsModerationPanel
        stores={stores}
        allReviews={allReviews}
        reviewStoreFilter={reviewStoreFilter}
        setReviewStoreFilter={setReviewStoreFilter}
        onToggleReviewVisibility={handleToggleReviewVisibility}
      />

      {/* Edit / Add Modal */}
      <StoreFormModal
        isOpen={isModalOpen}
        editingStore={editingStore}
        setEditingStore={setEditingStore}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStore}
      />
    </div>
  );
};

export default AdminStoresPage;
