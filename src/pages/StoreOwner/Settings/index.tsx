import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  ArrowLeft,
  Save,
  Sparkles,
  Package,
  MapPin,
  PlusCircle,
} from "lucide-react";
import { useStoreOwnerSettings } from "./hook";
import { HANOI_DISTRICTS } from "../../../data";
import { GoogleMapCanvas } from "../../../components/GoogleMapCanvas";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";

export const StoreOwnerSettings: React.FC = () => {
  const navigate = useNavigate();
  const {
    store,
    setStore,
    isNewStore,
    services,
    products,
    saving,
    handleSaveStoreProfile,
    handleUpdateServicePrice,
  } = useStoreOwnerSettings();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {isNewStore
              ? "Khởi tạo cửa hàng giặt sấy mới"
              : "Cấu hình cửa hàng & bảng giá dịch vụ"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập thông tin liên hệ, vị trí bản đồ tại Hà Nội, bảng giá giặt sấy và tồn kho nước giặt xả.
          </p>
        </div>
      </div>

      {isNewStore && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
          <PlusCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-sm">
              Cơ sở dữ liệu hiện chưa có cửa hàng nào!
            </div>
            <p className="mt-0.5 text-blue-700">
              Hãy điền tên tiệm, chọn Quận/Huyện tại Hà Nội, nhập địa chỉ và chạm
              vào bản đồ Google Maps bên dưới để chọn vị trí GPS, sau đó nhấn{" "}
              <strong>"Tạo Mới Cửa Hàng Lên Hệ Thống"</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Store Profile Form (Left 7 cols) */}
        <form
          onSubmit={handleSaveStoreProfile}
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-5"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">
              1. Hồ Sơ Chi Nhánh & Tọa Độ Bản Đồ Tại Hà Nội
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hiển thị trực tiếp trên bản đồ tìm kiếm tiệm giặt của khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              title="Tên cửa hàng giặt sấy"
              required
              placeholder="VD: Tiệm Giặt Sấy Vô Trùng Cầu Giấy"
              inputProps={{
                value: store.name || "",
                onChange: (e: any) =>
                  setStore({ ...store, name: e.target.value }),
              }}
            />
            <InputText
              title="Mã chi nhánh"
              required
              inputProps={{
                value: store.code || "",
                onChange: (e: any) =>
                  setStore({ ...store, code: e.target.value }),
              }}
            />
          </div>

          <InputText
            title="Địa chỉ chi tiết tại Hà Nội"
            required
            placeholder="VD: Số 165 Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội"
            inputProps={{
              value: store.address || "",
              onChange: (e: any) =>
                setStore({ ...store, address: e.target.value }),
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputSelect
              title="Chọn Quận / Huyện (TP. Hà Nội)"
              value={store.district || HANOI_DISTRICTS[0].name}
              options={HANOI_DISTRICTS.map((d) => ({
                value: d.name,
                label: `${d.name} - Hà Nội`,
              }))}
              onChange={(e) => {
                const nextDistrict = e.target.value;
                const matched = HANOI_DISTRICTS.find(
                  (d) => d.name === nextDistrict
                );
                setStore({
                  ...store,
                  city: "hanoi",
                  district: nextDistrict,
                  ...(matched ? { lat: matched.lat, lng: matched.lng } : {}),
                });
              }}
            />
            <InputText
              title="Số điện thoại Hotline tiệm"
              required
              placeholder="0908123456"
              inputProps={{
                value: store.phone || "",
                onChange: (e: any) =>
                  setStore({ ...store, phone: e.target.value }),
              }}
            />
          </div>

          {/* Interactive Google Maps Coordinate Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Chấm chọn vị trí cửa hàng trên Google Maps Hà Nội</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Lat: {(store.lat ?? 21.0285).toFixed(4)} · Lng:{" "}
                {(store.lng ?? 105.8542).toFixed(4)}
              </span>
            </div>

            <GoogleMapCanvas
              center={{ lat: store.lat || 21.0285, lng: store.lng || 105.8542 }}
              pickedCoords={{
                lat: store.lat || 21.0285,
                lng: store.lng || 105.8542,
              }}
              onPickLocation={(lat, lng) => setStore({ ...store, lat, lng })}
              zoom={14}
              heightClassName="h-[260px]"
              showRouteToSelected={false}
            />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <InputText
                title="Vĩ độ (Latitude)"
                inputProps={{
                  type: "number",
                  step: "0.0001",
                  value: String(store.lat ?? 21.0285),
                  onChange: (e: any) =>
                    setStore({ ...store, lat: Number(e.target.value) }),
                }}
              />
              <InputText
                title="Kinh độ (Longitude)"
                inputProps={{
                  type: "number",
                  step: "0.0001",
                  value: String(store.lng ?? 105.8542),
                  onChange: (e: any) =>
                    setStore({ ...store, lng: Number(e.target.value) }),
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputText
              title="Họ tên Chủ cửa hàng / Quản lý"
              inputProps={{
                value: store.managerName || "",
                onChange: (e: any) =>
                  setStore({ ...store, managerName: e.target.value }),
              }}
            />
            <InputText
              title="Khung giờ mở cửa"
              inputProps={{
                value: store.openHours || "06:30 - 22:00",
                onChange: (e: any) =>
                  setStore({ ...store, openHours: e.target.value }),
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
              label={
                isNewStore
                  ? "Tạo Mới Cửa Hàng Lên Hệ Thống"
                  : "Lưu Cấu Hình Chi Nhánh"
              }
              className="!w-64"
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
                Nước giặt hữu cơ, nước xả, túi giặt bán kèm cho khách hàng
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
