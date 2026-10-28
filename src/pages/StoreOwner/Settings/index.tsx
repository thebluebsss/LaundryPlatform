import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, ArrowLeft, Save, Sparkles, Package } from "lucide-react";
import { useStoreOwnerSettings } from "./hook";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";

export const StoreOwnerSettings: React.FC = () => {
  const navigate = useNavigate();
  const {
    store,
    setStore,
    services,
    products,
    saving,
    handleSaveStoreProfile,
    handleUpdateServicePrice,
  } = useStoreOwnerSettings();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-600 font-bold">
            <Settings className="w-4 h-4" />
            <span>Cấu Hình Cửa Hàng · Dịch Vụ & Vật Tư (Bảng stores & laundry_services)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            Thiết Lập Vận Hành Chi Nhánh
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý thông tin định danh cửa hàng, tọa độ bản đồ, đơn giá giặt sấy và tồn kho hóa phẩm.
          </p>
        </div>

        <ButtonOutLine
          onClick={() => navigate("/store-owner/dashboard")}
          iconStart={<ArrowLeft className="w-4 h-4" />}
          label="Tổng Quan Tiệm"
          className="!w-auto !h-10 !px-4 whitespace-nowrap shrink-0"
          textClassName="!text-xs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Store Profile Form (Left 7 cols) */}
        <form
          onSubmit={handleSaveStoreProfile}
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-5"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">
              1. Hồ Sơ Chi Nhánh Cửa Hàng (Bảng stores)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hiển thị trực tiếp trên Bản đồ tìm tiệm của ứng dụng Khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              title="Tên cửa hàng giặt sấy"
              required
              inputProps={{
                value: store.name || "",
                onChange: (e: any) =>
                  setStore({ ...store, name: e.target.value }),
              }}
            />
            <InputText
              title="Mã chi nhánh (Store Code)"
              required
              inputProps={{
                value: store.code || "",
                onChange: (e: any) =>
                  setStore({ ...store, code: e.target.value }),
              }}
            />
          </div>

          <InputText
            title="Địa chỉ chi tiết"
            required
            inputProps={{
              value: store.address || "",
              onChange: (e: any) =>
                setStore({ ...store, address: e.target.value }),
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputText
              title="Quận / Khu vực"
              inputProps={{
                value: store.district || "",
                onChange: (e: any) =>
                  setStore({ ...store, district: e.target.value }),
              }}
            />
            <InputText
              title="Số điện thoại Hotline tiệm"
              inputProps={{
                value: store.phone || "",
                onChange: (e: any) =>
                  setStore({ ...store, phone: e.target.value }),
              }}
            />
            <InputText
              title="Khung giờ mở cửa"
              inputProps={{
                value: store.openHours || "",
                onChange: (e: any) =>
                  setStore({ ...store, openHours: e.target.value }),
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputText
              title="Họ tên Chủ cửa hàng / Quản lý"
              inputProps={{
                value: store.managerName || "Lê Văn An",
                onChange: (e: any) =>
                  setStore({ ...store, managerName: e.target.value }),
              }}
            />
            <InputText
              title="Số lồng máy hoạt động"
              inputProps={{
                type: "number",
                value: String(store.activeMachinesCount || 16),
                onChange: (e: any) =>
                  setStore({
                    ...store,
                    activeMachinesCount: Number(e.target.value),
                  }),
              }}
            />
            <InputSelect
              title="Trạng thái đón đơn"
              value={store.status || "open"}
              options={[
                { value: "open", label: "Đang mở cửa" },
                { value: "busy", label: "Đang quá tải" },
                { value: "closed", label: "Đóng cửa tạm thời" },
              ]}
              onChange={(e) =>
                setStore({ ...store, status: e.target.value as any })
              }
            />
          </div>

          <div className="pt-2 flex justify-end">
            <ButtonCustom
              type="submit"
              loading={saving}
              iconStart={<Save className="w-4 h-4" />}
              label="Lưu Cấu Hình Chi Nhánh"
              className="!w-56"
            />
          </div>
        </form>

        {/* Right 5 cols: Services Quick Pricing & Consumables Inventory */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  2. Bảng Giá Dịch Vụ Áp Dụng
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đơn giá tính tiền tự động khi cân đồ thực tế
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {services.slice(0, 6).map((srv) => (
                <div
                  key={srv.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{srv.name}</div>
                    <div className="text-slate-500">
                      Tính theo: {srv.unitName} · Thời gian: {srv.durationDays}{" "}
                      ngày
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      step="1000"
                      defaultValue={srv.unitPrice}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val > 0 && val !== srv.unitPrice) {
                          handleUpdateServicePrice(srv, val);
                        }
                      }}
                      className="w-28 py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-right font-mono font-bold text-slate-900 tabular-nums"
                    />
                    <span className="text-slate-500">đ/{srv.unitName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                3. Tồn Kho Hóa Phẩm Giặt Xả Tại Tiệm
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nước giặt hữu cơ, nước xả, túi giặt bán kèm (Bảng products)
              </p>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {products.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">
                  Đang đồng bộ danh mục sản phẩm...
                </p>
              ) : (
                products.slice(0, 5).map((p: any) => (
                  <div
                    key={p._id || p.id}
                    className="py-2.5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <span className="text-slate-400 ml-2">
                        ({(p.price || 0).toLocaleString("vi-VN")}đ)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 tabular-nums">
                      Tồn: {p.stock ?? 20} {p.unit || "chai"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
