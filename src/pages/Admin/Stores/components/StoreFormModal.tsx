import React from "react";
import { X, Save } from "lucide-react";
import { LaundryStore } from "../../../../types";
import { HANOI_DISTRICTS } from "../../../../data";
import { GoogleMapCanvas } from "../../../../components/GoogleMapCanvas";
import { InputText } from "../../../../components/InputText";
import { InputSelect } from "../../../../components/InputSelect";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";

interface StoreFormModalProps {
  isOpen: boolean;
  editingStore: Partial<LaundryStore> | null;
  setEditingStore: React.Dispatch<
    React.SetStateAction<Partial<LaundryStore> | null>
  >;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const StoreFormModal: React.FC<StoreFormModalProps> = ({
  isOpen,
  editingStore,
  setEditingStore,
  isSubmitting,
  onClose,
  onSave,
}) => {
  if (!isOpen || !editingStore) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl p-6 animate-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <h2 className="text-lg font-extrabold text-slate-900">
            {editingStore.id
              ? "Chỉnh Sửa Chi Nhánh Cửa Hàng"
              : "Thêm Chi Nhánh Cửa Hàng Mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              title="Tên Cửa Hàng"
              required
              placeholder="VD: Tiệm Giặt Sấy Vô Trùng Cầu Giấy"
              inputProps={{
                value: editingStore.name || "",
                onChange: (e: any) =>
                  setEditingStore({ ...editingStore, name: e.target.value }),
              }}
            />

            <InputText
              title="Mã Định Danh (Code)"
              required
              placeholder="STORE_HN_CG"
              inputProps={{
                value: editingStore.code || "",
                onChange: (e: any) =>
                  setEditingStore({ ...editingStore, code: e.target.value }),
              }}
            />
          </div>

          <InputText
            title="Địa Chỉ Chi Nhánh"
            required
            placeholder="Số nhà, đường/phố, Quận tại Hà Nội..."
            inputProps={{
              value: editingStore.address || "",
              onChange: (e: any) =>
                setEditingStore({ ...editingStore, address: e.target.value }),
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputSelect
              title="Chọn Quận / Huyện (TP. Hà Nội)"
              required
              value={editingStore.district || HANOI_DISTRICTS[0].name}
              options={HANOI_DISTRICTS.map((d) => ({
                value: d.name,
                label: `${d.name} - Hà Nội`,
              }))}
              onChange={(e) => {
                const nextDist = e.target.value;
                const matched = HANOI_DISTRICTS.find((d) => d.name === nextDist);
                setEditingStore({
                  ...editingStore,
                  city: "hanoi",
                  district: nextDist,
                  ...(matched ? { lat: matched.lat, lng: matched.lng } : {}),
                });
              }}
            />

            <InputText
              title="Số Điện Thoại"
              placeholder="0908 123 456"
              inputProps={{
                value: editingStore.phone || "",
                onChange: (e: any) =>
                  setEditingStore({ ...editingStore, phone: e.target.value }),
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Chấm Chọn Tọa Độ Cửa Hàng Trên Google Maps Hà Nội
            </label>
            <GoogleMapCanvas
              center={{
                lat: editingStore.lat || 21.0285,
                lng: editingStore.lng || 105.8542,
              }}
              pickedCoords={{
                lat: editingStore.lat || 21.0285,
                lng: editingStore.lng || 105.8542,
              }}
              onPickLocation={(lat, lng) =>
                setEditingStore({ ...editingStore, lat, lng })
              }
              zoom={14}
              heightClassName="h-[220px]"
              showRouteToSelected={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputText
              title="Vĩ Độ (GPS Lat)"
              inputProps={{
                type: "number",
                step: "0.0001",
                value: String(editingStore.lat || 21.0285),
                onChange: (e: any) =>
                  setEditingStore({
                    ...editingStore,
                    lat: parseFloat(e.target.value),
                  }),
              }}
            />

            <InputText
              title="Kinh Độ (GPS Lng)"
              inputProps={{
                type: "number",
                step: "0.0001",
                value: String(editingStore.lng || 105.8542),
                onChange: (e: any) =>
                  setEditingStore({
                    ...editingStore,
                    lng: parseFloat(e.target.value),
                  }),
              }}
            />

            <InputSelect
              title="Trạng Thái Kho"
              value={editingStore.status || "open"}
              options={[
                { value: "open", label: "🟢 Đang Mở Cửa" },
                { value: "busy", label: "🟡 Đang Bận / Tải Cao" },
                { value: "closed", label: "🔴 Đóng Cửa Tạm Thời" },
              ]}
              onChange={(e) =>
                setEditingStore({
                  ...editingStore,
                  status: e.target.value as any,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              title="Họ Tên Quản Lý Cửa Hàng"
              placeholder="Lê Văn An"
              inputProps={{
                value: editingStore.managerName || "",
                onChange: (e: any) =>
                  setEditingStore({
                    ...editingStore,
                    managerName: e.target.value,
                  }),
              }}
            />

            <InputText
              title="Giờ Mở Cửa"
              placeholder="06:00 - 22:00"
              inputProps={{
                value: editingStore.openHours || "",
                onChange: (e: any) =>
                  setEditingStore({
                    ...editingStore,
                    openHours: e.target.value,
                  }),
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
            <ButtonOutLine
              type="button"
              onClick={onClose}
              label="Hủy Bỏ"
              className="!w-auto !h-10 !px-5"
              textClassName="!text-xs"
            />

            <ButtonCustom
              type="submit"
              loading={isSubmitting}
              iconStart={<Save className="w-4 h-4" />}
              label={isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
              className="!w-auto !h-10 !px-6"
              textClassName="!text-xs"
            />
          </div>
        </form>
      </div>
    </div>
  );
};
