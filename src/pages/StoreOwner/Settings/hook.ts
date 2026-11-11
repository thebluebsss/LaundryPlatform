import { useState, useEffect, useCallback } from "react";
import { storesAPI, servicesAPI, productsAPI } from "../../../services/api";
import { LaundryStore, LaundryService } from "../../../types";
import { LAUNDRY_SERVICES } from "../../../data";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";

const EMPTY_STORE_DRAFT: LaundryStore = {
  id: "",
  name: "",
  code: "STORE_HN_" + Math.random().toString(36).substring(2, 5).toUpperCase(),
  address: "",
  district: "Quận Hoàn Kiếm",
  city: "hanoi",
  phone: "",
  lat: 21.0285,
  lng: 105.8542,
  rating: 5.0,
  reviewCount: 0,
  status: "open",
  openHours: "06:30 - 22:00",
  priceRange: "15.000đ - 120.000đ",
  features: ["Giặt sấy siêu tốc", "Khử trùng UV Nano", "Gom đồ tận nơi"],
  image:
    "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=600",
  managerName: "",
  managerPhone: "",
  activeShippersCount: 5,
  activeMachinesCount: 12,
};

export const useStoreOwnerSettings = () => {
  const { showToast } = useToast();
  const { setLoading } = useLoading();

  const [store, setStore] = useState<LaundryStore>(() => {
    let defaultManagerName = "";
    let defaultPhone = "";
    let defaultAddress = "";
    try {
      const cached = localStorage.getItem("sachse_user_profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        defaultManagerName = parsed.fullName || parsed.username || "";
        defaultPhone = parsed.phone || "";
        defaultAddress = parsed.address || "";
      }
    } catch {}
    return {
      ...EMPTY_STORE_DRAFT,
      managerName: defaultManagerName,
      managerPhone: defaultPhone,
      phone: defaultPhone,
      address: defaultAddress,
    };
  });
  const [isNewStore, setIsNewStore] = useState<boolean>(true);
  const [services, setServices] = useState<LaundryService[]>(LAUNDRY_SERVICES);
  const [products, setProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  const loadSettingsData = useCallback(async () => {
    try {
      const [sRes, srvRes, pRes] = await Promise.allSettled([
        storesAPI.getAll(),
        servicesAPI.getAll(),
        productsAPI.getAll({ limit: 50 }),
      ]);

      if (sRes.status === "fulfilled") {
        const raw = sRes.value.data?.data;
        const sList: LaundryStore[] = Array.isArray(raw)
          ? raw
          : raw?.stores || [];
        if (sList.length > 0) {
          let matchedStore = sList[0];
          try {
            const cached = localStorage.getItem("sachse_user_profile");
            if (cached) {
              const parsed = JSON.parse(cached);
              const byAssignedId = sList.find(
                (st: any) =>
                  (parsed.assignedStoreId &&
                    (st.id === parsed.assignedStoreId ||
                      st.customId === parsed.assignedStoreId)) ||
                  (parsed.storeCode && st.code === parsed.storeCode) ||
                  (parsed.id && st.ownerId === String(parsed.id))
              );
              if (byAssignedId) {
                matchedStore = byAssignedId;
              }
            }
          } catch {}
          setStore(matchedStore);
          setIsNewStore(false);
        } else {
          setIsNewStore(true);
        }
      }

      if (srvRes.status === "fulfilled") {
        const srvList =
          srvRes.value.data?.data?.services || srvRes.value.data?.data || [];
        if (Array.isArray(srvList) && srvList.length > 0) {
          setServices(
            srvList.map((s: any) => ({
              id: s._id || s.customId || s.id,
              name: s.name,
              category: s.category || "wash_fold",
              pricingType: s.pricingType || "per_kg",
              unitPrice: Number(s.unitPrice || 20000),
              unitName: s.unitName || "kg",
              description: s.description || "",
              iconName: s.iconName || "Shirt",
              durationDays: s.durationDays || 1,
            }))
          );
        }
      }

      if (pRes.status === "fulfilled") {
        const pList =
          pRes.value.data?.data?.products || pRes.value.data?.data || [];
        if (Array.isArray(pList)) {
          setProducts(pList);
        }
      }
    } catch (error) {
      console.error("Failed to load store settings:", error);
    }
  }, []);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.name.trim() || !store.address.trim()) {
      showToast("Vui lòng nhập Tên cửa hàng và Địa chỉ chi tiết!", "warning");
      return;
    }

    setSaving(true);
    setLoading(true);
    try {
      if (isNewStore || !store.id) {
        const newId = "store-" + Date.now();
        const payload = {
          ...store,
          id: newId,
          customId: newId,
        };
        const res = await storesAPI.create(payload);
        const created = res.data?.data || payload;
        setStore(created);
        setIsNewStore(false);
        showToast(
          "Đã khởi tạo chi nhánh cửa hàng mới vào Cơ sở dữ liệu & hiển thị trên Google Maps!",
          "success"
        );
      } else {
        const res = await storesAPI.update(store.id, store);
        if (res.data?.data) {
          setStore(res.data.data);
        }
        showToast(
          "Đã lưu thông tin cấu hình chi nhánh cửa hàng thành công!",
          "success"
        );
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Không thể lưu thông tin cửa hàng!",
        "error"
      );
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleUpdateServicePrice = async (
    srv: LaundryService,
    newPrice: number
  ) => {
    try {
      await servicesAPI.update(srv.id, { unitPrice: newPrice });
      setServices((prev) =>
        prev.map((s) => (s.id === srv.id ? { ...s, unitPrice: newPrice } : s))
      );
      showToast(
        `Đã cập nhật đơn giá "${srv.name}" thành ${newPrice.toLocaleString(
          "vi-VN"
        )}đ/${srv.unitName}`,
        "success"
      );
    } catch {
      showToast("Không thể cập nhật đơn giá dịch vụ!", "error");
    }
  };

  return {
    store,
    setStore,
    isNewStore,
    services,
    products,
    saving,
    handleSaveStoreProfile,
    handleUpdateServicePrice,
  };
};
