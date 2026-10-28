import React, { useState, useEffect } from "react";
import { X, WashingMachine } from "lucide-react";
import { StoreEquipmentItem } from "../hook";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";
import { InputText } from "../../../../components/InputText";
import { InputSelect } from "../../../../components/InputSelect";
import { InputArea } from "../../../../components/InputArea";

interface EquipmentModalProps {
  isOpen: boolean;
  editingItem: StoreEquipmentItem | null;
  onClose: () => void;
  onSave: (data: Partial<StoreEquipmentItem>) => void;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  editingItem,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"washing-machine" | "dryer" | "iron" | "other">(
    "washing-machine"
  );
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState<"working" | "maintenance" | "broken">(
    "working"
  );
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setType(editingItem.type);
      setModel(editingItem.model);
      setSerialNumber(editingItem.serialNumber);
      setStatus(editingItem.status);
      setLocation(editingItem.location);
      setNotes(editingItem.notes || "");
    } else {
      setName("");
      setType("washing-machine");
      setModel("ELX-2026");
      setSerialNumber(
        "SN-" + Math.random().toString(36).substring(2, 7).toUpperCase()
      );
      setStatus("working");
      setLocation("Tiệm Giặt Sấy Vô Trùng Q1 - Khu Giặt Chính");
      setNotes("");
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !serialNumber.trim()) return;
    onSave({
      name: name.trim(),
      type,
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      status,
      location: location.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 md:p-8 space-y-5 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <WashingMachine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {editingItem
                  ? "Cập Nhật Thiết Bị Giặt Sấy"
                  : "Thêm Máy Giặt / Máy Sấy / Thiết Bị Mới"}
              </h3>
              <p className="text-xs text-slate-500">
                Quản lý tài sản kỹ thuật & lịch bảo trì định kỳ tại tiệm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <InputText
          title="Tên thiết bị / Số hiệu lồng máy"
          required
          placeholder="VD: Máy giặt công nghiệp Electrolux 20kg #03"
          inputProps={{
            value: name,
            onChange: (e: any) => setName(e.target.value),
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputSelect
            title="Phân loại thiết bị"
            value={type}
            options={[
              { value: "washing-machine", label: "Máy giặt công nghiệp" },
              { value: "dryer", label: "Máy sấy / Tủ hấp khử khuẩn" },
              { value: "iron", label: "Bàn ủi hơi nước áp suất" },
              { value: "other", label: "Thiết bị phụ trợ khác" },
            ]}
            onChange={(e) => setType(e.target.value as any)}
          />
          <InputSelect
            title="Trạng thái vận hành"
            value={status}
            options={[
              { value: "working", label: "Đang hoạt động tốt (Working)" },
              { value: "maintenance", label: "Đang bảo trì định kỳ" },
              { value: "broken", label: "Đang hỏng / Ngưng chạy" },
            ]}
            onChange={(e) => setStatus(e.target.value as any)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputText
            title="Mã Model kỹ thuật"
            required
            inputProps={{
              value: model,
              onChange: (e: any) => setModel(e.target.value),
            }}
          />
          <InputText
            title="Số Serial (serialNumber)"
            required
            inputProps={{
              value: serialNumber,
              onChange: (e: any) => setSerialNumber(e.target.value),
            }}
          />
        </div>

        <InputText
          title="Vị trí lắp đặt tại cửa hàng"
          required
          inputProps={{
            value: location,
            onChange: (e: any) => setLocation(e.target.value),
          }}
        />

        <InputArea
          title="Ghi chú mẻ giặt hiện tại / Lịch sử bảo trì"
          placeholder="VD: Đang chạy mẻ giặt đồ trắng hoặc lịch thay bộ lọc..."
          inputProps={{
            value: notes,
            onChange: (e: any) => setNotes(e.target.value),
          }}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <ButtonOutLine
            type="button"
            label="Hủy"
            onClick={onClose}
            className="!w-28"
          />
          <ButtonCustom
            type="submit"
            label={editingItem ? "Lưu Thay Đổi" : "Thêm Thiết Bị"}
            className="!w-44"
          />
        </div>
      </form>
    </div>
  );
};
