import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Shirt,
  Truck,
  Scale,
  Sparkles,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "./components/HeroSection";
import { storesAPI, servicesAPI } from "../../services/api";
import { LaundryStore, LaundryService } from "../../types";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<LaundryStore[]>([]);
  const [services, setServices] = useState<LaundryService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [storesRes, servicesRes] = await Promise.allSettled([
          storesAPI.getAll(),
          servicesAPI.getAll(),
        ]);

        if (!mounted) return;

        if (storesRes.status === "fulfilled") {
          const rawStores =
            storesRes.value.data?.data?.stores ||
            (Array.isArray(storesRes.value.data?.data)
              ? storesRes.value.data.data
              : []);
          setStores(rawStores);
        }

        if (servicesRes.status === "fulfilled") {
          const rawServices =
            servicesRes.value.data?.data?.services ||
            (Array.isArray(servicesRes.value.data?.data)
              ? servicesRes.value.data.data
              : []);
          setServices(
            rawServices.map((s: any) => ({
              ...s,
              id: s.customId || s.id || s._id,
            }))
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  const workflowSteps = [
    {
      step: "Bước 1",
      title: "Chọn tiệm & kê khai đồ giặt",
      desc: "Chọn chi nhánh gần nhà, chọn dịch vụ theo cân hoặc theo món và ghi chú riêng cho từng loại vải.",
      icon: Shirt,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      step: "Bước 2",
      title: "Tài xế đến tận cửa lấy đồ",
      desc: "Tài xế gần khu vực của bạn nhận chuyến, đến lấy túi đồ tận nhà và bàn giao về cửa hàng.",
      icon: Truck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      step: "Bước 3",
      title: "Cân thực tế & xác nhận giá",
      desc: "Cửa hàng phân loại, cân chính xác từng dòng đồ và gửi thông báo để bạn duyệt chi phí trước khi giặt.",
      icon: Scale,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      step: "Bước 4",
      title: "Giặt sạch & giao trả tận nhà",
      desc: "Đồ được giặt riêng từng mẻ, sấy khô gấp phẳng và giao trả đúng khung giờ bạn chọn.",
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner Area */}
      <HeroSection />

      {/* 4-Step Customer Journey */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-blue-600">
              Quy trình đơn giản
            </p>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mt-1">
              4 bước đặt giặt minh bạch từ lúc lấy đến khi giao trả
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate("/mobile-customer/home")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer self-start md:self-auto"
          >
            <span>Bắt đầu đặt giặt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      {item.step}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Services Catalog */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shirt className="w-5 h-5 text-blue-600" />
              <span>Dịch vụ giặt sấy đang phục vụ ({services.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Giá niêm yết công khai — tạm tính ngay khi bạn chọn dịch vụ
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/price-info")}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer self-start sm:self-auto"
          >
            Xem đầy đủ bảng giá →
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải danh sách dịch vụ...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.slice(0, 8).map((svc) => (
              <div
                key={svc.id}
                onClick={() =>
                  navigate(
                    `/mobile-customer/create-order?serviceId=${encodeURIComponent(svc.id)}`,
                  )
                }
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-500 bg-slate-50/40 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col justify-between gap-3"
              >
                <div>
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {svc.pricingType === "per_kg" ? "Tính theo kg" : "Tính theo món"}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {svc.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {svc.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60">
                  <span className="text-sm font-bold text-blue-600 tabular-nums">
                    {Number(svc.unitPrice || 0).toLocaleString("vi-VN")}đ/{svc.unitName}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    Đặt ngay <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Branches */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              <span>Hệ thống chi nhánh tại Hà Nội ({stores.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn cửa hàng gần khu vực của bạn để đặt lịch lấy đồ nhanh hơn
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/stores-map")}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer self-start sm:self-auto"
          >
            Xem bản đồ tất cả chi nhánh →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stores.slice(0, 6).map((store) => (
            <div
              key={store.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white transition-all flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {store.status === "open" ? "Đang mở cửa" : "Đang bận"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {store.rating} ({store.reviewCount})
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {store.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 flex items-center gap-1 tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {store.openHours}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/mobile-customer/create-order?storeId=${encodeURIComponent(store.id)}`,
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Đặt giặt →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
