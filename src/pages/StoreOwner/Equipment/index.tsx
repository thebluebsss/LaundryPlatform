import React from "react";
import { useNavigate } from "react-router-dom";
import {
  WashingMachine,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Wrench,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useStoreOwnerEquipment } from "./hook";
import { EquipmentModal } from "./components/EquipmentModal";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { InputSelect } from "../../../components/InputSelect";
import { DialogConfirm } from "../../../components/DialogConfirm";

const TYPE_LABELS: Record<string, string> = {
  "washing-machine": "Máy giặt công nghiệp",
  dryer: "Máy sấy / Tủ hấp UV",
  iron: "Bàn ủi hơi nước",
  other: "Thiết bị phụ trợ",
};

export const StoreOwnerEquipment: React.FC = () => {
  const navigate = useNavigate();
  const {
    equipment,
    allEquipment,
    loading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    setEditingItem,
    itemToDelete,
    setItemToDelete,
    handleSaveEquipment,
    handleQuickStatusChange,
    handleDeleteEquipment,
  } = useStoreOwnerEquipment();

  const workingCount = allEquipment.filter((e) => e.status === "working").length;
  const maintenanceCount = allEquipment.filter(
    (e) => e.status === "maintenance"
  ).length;
  const brokenCount = allEquipment.filter((e) => e.status === "broken").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
            <WashingMachine className="w-4 h-4" />
            <span>Quản Lý Trang Thiết Bị Cửa Hàng (Bảng equipment)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            Hệ Thống Lồng Giặt, Máy Sấy & Bàn Ủi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đang hoạt động:{" "}
            <strong className="font-mono text-emerald-600 tabular-nums">
              {workingCount}
            </strong>{" "}
            máy · Đang bảo trì:{" "}
            <strong className="font-mono text-amber-600 tabular-nums">
              {maintenanceCount}
            </strong>{" "}
            · Báo hỏng:{" "}
            <strong className="font-mono text-rose-600 tabular-nums">
              {brokenCount}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ButtonOutLine
            onClick={() => navigate("/store-owner/dashboard")}
            iconStart={<ArrowLeft className="w-4 h-4" />}
            label="Tổng Quan Tiệm"
            className="!w-auto !h-10 !px-4 whitespace-nowrap"
            textClassName="!text-xs"
          />
          <ButtonCustom
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            iconStart={<Plus className="w-4 h-4" />}
            label="Thêm Thiết Bị Mới"
            className="!w-auto !h-10 !px-4 whitespace-nowrap"
            textClassName="!text-xs"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-6">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Tìm theo tên máy, số Serial, khu vực lắp đặt
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="VD: Electrolux, SpeedQueen, ELX-2026..."
              className="w-full py-3 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <InputSelect
            title="Loại thiết bị"
            value={typeFilter}
            options={[
              { value: "all", label: "Tất cả loại máy" },
              { value: "washing-machine", label: "Máy giặt công nghiệp" },
              { value: "dryer", label: "Máy sấy / Tủ hấp UV" },
              { value: "iron", label: "Bàn ủi hơi nước" },
              { value: "other", label: "Thiết bị khác" },
            ]}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <InputSelect
            title="Trạng thái"
            value={statusFilter}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "working", label: "Đang hoạt động tốt" },
              { value: "maintenance", label: "Đang bảo trì" },
              { value: "broken", label: "Đang báo hỏng" },
            ]}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
          Đang tải danh sách thiết bị tại cửa hàng...
        </div>
      ) : equipment.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-slate-500 text-sm font-semibold">
            Không tìm thấy thiết bị nào phù hợp.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{TYPE_LABELS[item.type] || item.type}</span>
                  <span className="font-mono font-bold text-slate-700">
                    {item.serialNumber}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900">
                  {item.name}
                </h3>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    Model:{" "}
                    <strong className="font-mono text-slate-800">
                      {item.model}
                    </strong>{" "}
                    <span aria-hidden="true">·</span> Khu vực:{" "}
                    <strong className="text-slate-700">{item.location}</strong>
                  </div>
                  {item.notes && (
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Interactive Status Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(item, "working")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      item.status === "working"
                        ? "bg-white text-emerald-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Chạy tốt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(item, "maintenance")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      item.status === "maintenance"
                        ? "bg-white text-amber-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    Bảo trì
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(item, "broken")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      item.status === "broken"
                        ? "bg-white text-rose-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Hỏng
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Chỉnh sửa thiết bị"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Xóa thiết bị"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EquipmentModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveEquipment}
      />

      <DialogConfirm
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onSubmit={handleDeleteEquipment}
        isDelete
        textTitle="Xác nhận xóa thiết bị"
        textContent={`Bạn có chắc chắn muốn xóa "${itemToDelete?.name}" (Serial: ${itemToDelete?.serialNumber}) khỏi danh mục thiết bị của tiệm?`}
        textCancel="Hủy bỏ"
        textButton="Xóa thiết bị"
      />
    </div>
  );
};
