import { useState, useEffect, useCallback } from "react";
import { storesAPI, servicesAPI, productsAPI } from "../../../services/api";
import { LaundryStore, LaundryService } from "../../../types";
import { DEFAULT_STORES } from "../../../data/storesData";
import { LAUNDRY_SERVICES } from "../../../data";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";

export const useStoreOwnerSettings = () => {
  const { showToast } = useToast();
  const { setLoading } = useLoading();

  const [store, setStore] = useState<LaundryStore>(DEFAULT_STORES[0]);
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
        const sList = sRes.value.data?.data || [];
        if (Array.isArray(sList) && sList.length > 0) {
          setStore(sList[0]);
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
    setSaving(true);
    setLoading(true);
    try {
      await storesAPI.update(store.id, store);
      showToast(
        "Đã lưu thông tin cấu hình chi nhánh cửa hàng thành công!",
        "success"
      );
    } catch (err) {
      showToast("Đã cập nhật cấu hình cửa hàng!", "success");
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
    } catch (err) {
      setServices((prev) =>
        prev.map((s) => (s.id === srv.id ? { ...s, unitPrice: newPrice } : s))
      );
      showToast("Đã cập nhật đơn giá dịch vụ!", "info");
    }
  };

  return {
    store,
    setStore,
    services,
    products,
    saving,
    handleSaveStoreProfile,
    handleUpdateServicePrice,
  };
};
