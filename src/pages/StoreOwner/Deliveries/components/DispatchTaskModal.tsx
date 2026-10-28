import React, { useState } from "react";
import { X, Truck } from "lucide-react";
import { CourierDriver } from "../../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";
import { InputText } from "../../../../components/InputText";
import { InputSelect } from "../../../../components/InputSelect";
import { InputArea } from "../../../../components/InputArea";

interface DispatchTaskModalProps {
  isOpen: boolean;
  drivers: CourierDriver[];
  onClose: () => void;
  onCreate: (data: any) => void;
}

export const DispatchTaskModal: React.FC<DispatchTaskModalProps> = ({
  isOpen,
  drivers,
  onClose,
  onCreate,
}) => {
  const [orderId, setOrderId] = useState("ORD-" + Math.floor(1000 + Math.random() * 9000));
  const [taskType, setTaskType] = useState<"pickup_from_customer" | "deliver_to_customer">(
    "pickup_from_customer"
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [shippingFee, setShippingFee] = useState(25000);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const driverOptions = [
    { value: "", label: "Phát sóng tự động cho tài xế gần nhất (Broadcasting)" },
    ...drivers.map((d) => ({
      value: d.id,
      label: `${d.name} (${d.phone}) - ${d.vehicleType === "van" ? "Xe tải nhẹ" : "Xe máy"}`,
    })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) return;
    const assignedDriver = drivers.find((d) => d.id === selectedDriverId);

    onCreate({
      orderId: orderId.trim(),
      taskType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      shippingFee: Number(shippingFee),
      driverId: assignedDriver?.id || "",
      driverName: assignedDriver?.name || "",
      driverPhone: assignedDriver?.phone || "",
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
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Điều Phối Chuyến Giao Nhận Mới
              </h3>
              <p className="text-xs text-slate-500">
                Gọi Shipper đi lấy giỏ đồ bẩn hoặc đi giao trả đồ sạch cho khách
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputText
            title="Mã đơn giặt liên kết (orderId)"
            required
            inputProps={{
              value: orderId,
              onChange: (e: any) => setOrderId(e.target.value),
            }}
          />
          <InputSelect
            title="Loại nhiệm vụ (taskType)"
            value={taskType}
            options={[
              {
                value: "pickup_from_customer",
                label: "Chiều đi lấy đồ bẩn từ nhà khách về tiệm",
              },
              {
                value: "deliver_to_customer",
                label: "Chiều đi giao đồ sạch từ tiệm về nhà khách",
              },
            ]}
            onChange={(e) => setTaskType(e.target.value as any)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputText
            title="Họ tên khách hàng"
            required
            placeholder="VD: Nguyễn Hoàng Nam"
            inputProps={{
              value: customerName,
              onChange: (e: any) => setCustomerName(e.target.value),
            }}
          />
          <InputText
            title="Số điện thoại khách hàng"
            required
            placeholder="VD: 0908111222"
            inputProps={{
              value: customerPhone,
              onChange: (e: any) => setCustomerPhone(e.target.value),
            }}
          />
        </div>

        <InputText
          title="Địa chỉ lấy / giao đồ"
          required
          placeholder="VD: 45 Lê Thánh Tôn, Phường Bến Nghé, Quận 1"
          inputProps={{
            value: customerAddress,
            onChange: (e: any) => setCustomerAddress(e.target.value),
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputSelect
            title="Chỉ định tài xế (Hoặc phát sóng tự động)"
            value={selectedDriverId}
            options={driverOptions}
            onChange={(e) => setSelectedDriverId(e.target.value)}
          />
          <InputText
            title="Phí giao nhận chuyến (VNĐ)"
            inputProps={{
              type: "number",
              value: String(shippingFee),
              onChange: (e: any) => setShippingFee(Number(e.target.value)),
            }}
          />
        </div>

        <InputArea
          title="Ghi chú cho Tài xế"
          placeholder="VD: Gọi khách trước 10 phút, nhận đồ tại sảnh lễ tân..."
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
            label="Phát Sóng Chuyến Ngay"
            className="!w-48"
          />
        </div>
      </form>
    </div>
  );
};
