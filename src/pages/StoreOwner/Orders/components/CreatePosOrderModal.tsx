import React, { useState } from "react";
import { X, Plus, Trash2, Store } from "lucide-react";
import { LaundryService } from "../../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";
import { InputText } from "../../../../components/InputText";
import { InputSelect } from "../../../../components/InputSelect";

interface CreatePosOrderModalProps {
  isOpen: boolean;
  services: LaundryService[];
  onClose: () => void;
  onCreate: (orderData: any) => void;
}

export const CreatePosOrderModal: React.FC<CreatePosOrderModalProps> = ({
  isOpen,
  services,
  onClose,
  onCreate,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("Khách gửi trực tiếp tại quầy (Walk-in POS)");
  const [district, setDistrict] = useState("Quận 1");
  const [paymentMethod, setPaymentMethod] = useState("vietqr");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<any[]>([
    {
      serviceId: "wf-regular",
      serviceName: "Giặt Sấy Thường (Wash & Fold)",
      fabricType: "Cotton / Đồ mặc hàng ngày",
      garmentDescription: "Đồ giặt cân ký tại quầy",
      pricingType: "per_kg",
      unitName: "kg",
      unitPrice: 20000,
      actualQuantity: 3,
    },
  ]);

  if (!isOpen) return null;

  const serviceOptions = services.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.unitPrice.toLocaleString("vi-VN")}đ/${s.unitName})`,
  }));

  const fabricOptions = [
    { value: "Cotton / Đồ mặc hàng ngày", label: "Cotton / Đồ mặc hàng ngày" },
    { value: "Đồ trắng (Giặt riêng)", label: "Đồ trắng (Giặt riêng)" },
    { value: "Lụa / Tơ tằm / Đồ mỏng", label: "Lụa / Tơ tằm / Đồ mỏng" },
    { value: "Chăn mền / Đồ nặng", label: "Chăn mền / Đồ nặng" },
    { value: "Âu phục / Vest / Áo dài", label: "Âu phục / Vest / Áo dài" },
  ];

  const handleAddRow = () => {
    const first = services[0] || {
      id: "wf-regular",
      name: "Giặt Sấy Thường",
      unitPrice: 20000,
      unitName: "kg",
      pricingType: "per_kg",
    };
    setItems((prev) => [
      ...prev,
      {
        serviceId: first.id,
        serviceName: first.name,
        fabricType: "Cotton / Đồ mặc hàng ngày",
        garmentDescription: "",
        pricingType: first.pricingType,
        unitName: first.unitName,
        unitPrice: first.unitPrice,
        actualQuantity: 1,
      },
    ]);
  };

  const handleUpdateRow = (idx: number, field: string, val: any) => {
    setItems((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        if (field === "serviceId") {
          const found = services.find((s) => s.id === val);
          if (found) {
            return {
              ...row,
              serviceId: found.id,
              serviceName: found.name,
              unitPrice: found.unitPrice,
              unitName: found.unitName,
              pricingType: found.pricingType,
            };
          }
        }
        return { ...row, [field]: val };
      })
    );
  };

  const subtotal = items.reduce(
    (sum, it) =>
      sum + Number(it.actualQuantity || 0) * Number(it.unitPrice || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim()) return;

    const today = new Date().toISOString().split("T")[0];
    onCreate({
      id: "POS-" + Math.floor(1000 + Math.random() * 9000),
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      district,
      storeId: "store-hcm-q1",
      storeName: "Tiệm Giặt Sấy Vô Trùng Q1",
      pickupDate: today,
      pickupTime: "Tại quầy POS",
      deliveryDate: today,
      deliveryTime: "18:00 - 20:00",
      notes,
      subtotal,
      estimatedSubtotal: subtotal,
      actualSubtotal: subtotal,
      deliveryFee: 0,
      discountAmount: 0,
      totalPrice: subtotal,
      weightConfirmStatus: "accepted",
      actualWeighedAt: new Date().toISOString(),
      status: "washing",
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "paid" : "pending",
      items: items.map((it) => ({
        ...it,
        quantity: Number(it.actualQuantity || 1),
        estimatedQuantity: Number(it.actualQuantity || 1),
        actualQuantity: Number(it.actualQuantity || 1),
        estimatedLineTotal:
          Number(it.actualQuantity || 1) * Number(it.unitPrice || 0),
        actualLineTotal:
          Number(it.actualQuantity || 1) * Number(it.unitPrice || 0),
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl p-6 md:p-8 my-8 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Tạo Đơn Giặt Trực Tiếp Tại Quầy (Walk-in POS)
              </h3>
              <p className="text-xs text-slate-500">
                Cân trực tiếp trước mặt khách · Tự động chốt khối lượng thực tế (accepted)
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
            title="Họ tên khách hàng"
            required
            placeholder="VD: Phạm Thanh Hằng"
            inputProps={{
              value: customerName,
              onChange: (e: any) => setCustomerName(e.target.value),
            }}
          />
          <InputText
            title="Số điện thoại nhận thông báo"
            required
            placeholder="VD: 0909123456"
            inputProps={{
              value: phoneNumber,
              onChange: (e: any) => setPhoneNumber(e.target.value),
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputText
            title="Địa chỉ / Hình thức nhận trả"
            inputProps={{
              value: address,
              onChange: (e: any) => setAddress(e.target.value),
            }}
          />
          <InputSelect
            title="Phương thức thanh toán"
            value={paymentMethod}
            options={[
              { value: "vietqr", label: "Quét mã VietQR / PayOS tại quầy" },
              { value: "cash", label: "Tiền mặt (Đã thu ngay)" },
              { value: "cod", label: "Thanh toán khi khách tới lấy đồ" },
            ]}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase">
              Các dòng đồ cân thực tế tại quầy
            </span>
            <ButtonOutLine
              type="button"
              onClick={handleAddRow}
              iconStart={<Plus className="w-3.5 h-3.5" />}
              label="Thêm Dòng Đồ"
              className="!w-auto !h-8 !px-3 !text-xs"
              textClassName="!text-xs"
            />
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
            >
              <div className="sm:col-span-5">
                <InputSelect
                  title="Gói dịch vụ"
                  value={item.serviceId}
                  options={serviceOptions}
                  onChange={(e) =>
                    handleUpdateRow(idx, "serviceId", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-4">
                <InputSelect
                  title="Loại vải"
                  value={item.fabricType}
                  options={fabricOptions}
                  onChange={(e) =>
                    handleUpdateRow(idx, "fabricType", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <InputText
                  title={`Số ${item.unitName}`}
                  inputProps={{
                    type: "number",
                    step: "0.1",
                    value: String(item.actualQuantity),
                    onChange: (e: any) =>
                      handleUpdateRow(
                        idx,
                        "actualQuantity",
                        parseFloat(e.target.value) || 0
                      ),
                  }}
                />
              </div>
              <div className="sm:col-span-1 flex justify-end pb-1">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Tổng tiền thanh toán tại quầy (Miễn phí ship):
          </span>
          <span className="text-xl font-black text-blue-600 font-mono tabular-nums">
            {subtotal.toLocaleString("vi-VN")}đ
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <ButtonOutLine
            type="button"
            label="Hủy"
            onClick={onClose}
            className="!w-28"
          />
          <ButtonCustom
            type="submit"
            label="Tạo Đơn & Đưa Vào Giặt"
            className="!w-52"
          />
        </div>
      </form>
    </div>
  );
};
