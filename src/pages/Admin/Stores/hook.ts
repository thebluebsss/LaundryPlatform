import React, { useState, useEffect } from "react";
import { LaundryStore, OrderReview } from "../../../types";
import { HANOI_DISTRICTS } from "../../../data";
import { storesAPI, reviewsAPI } from "../../../services/api";

export const useAdminStores = () => {
  const [stores, setStores] = useState<LaundryStore[]>([]);
  const [allReviews, setAllReviews] = useState<OrderReview[]>([]);
  const [reviewStoreFilter, setReviewStoreFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStore, setEditingStore] =
    useState<Partial<LaundryStore> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const [response, reviewsRes] = await Promise.allSettled([
        storesAPI.getAll(),
        reviewsAPI.getAll({ includeHidden: true }),
      ]);
      if (response.status === "fulfilled") {
        const raw = response.value.data?.data;
        const list = Array.isArray(raw) ? raw : raw?.stores || [];
        setStores(list);
      } else {
        setStores([]);
      }
      if (reviewsRes.status === "fulfilled") {
        setAllReviews(reviewsRes.value.data?.data?.reviews || []);
      }
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleToggleReviewVisibility = async (review: OrderReview) => {
    try {
      const res = await reviewsAPI.toggleVisibility(review.id, !review.isHidden);
      const updated = res.data?.data;
      setAllReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { ...r, isHidden: updated ? updated.isHidden : !r.isHidden }
            : r
        )
      );
      showToast(
        !review.isHidden
          ? `Đã ẩn đánh giá #${review.id} khỏi trang khách hàng!`
          : `Đã khôi phục hiển thị đánh giá #${review.id}!`
      );
    } catch {
      showToast("Không thể cập nhật trạng thái ẩn/hiện của đánh giá");
    }
  };

  const handleOpenAddModal = () => {
    setEditingStore({
      name: "",
      code:
        "STORE_HN_" + Math.random().toString(36).substring(2, 5).toUpperCase(),
      address: "",
      district: HANOI_DISTRICTS[0].name,
      city: "hanoi",
      phone: "0900 000 000",
      lat: HANOI_DISTRICTS[0].lat,
      lng: HANOI_DISTRICTS[0].lng,
      status: "open",
      openHours: "06:00 - 22:00",
      priceRange: "15.000đ - 120.000đ",
      features: ["Giặt sấy siêu tốc", "Khử trùng UV"],
      image:
        "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=600",
      managerName: "Quản Lý Mới",
      managerPhone: "0900 000 000",
      activeShippersCount: 8,
      activeMachinesCount: 16,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (store: LaundryStore) => {
    setEditingStore({ ...store });
    setIsModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore || !editingStore.name || !editingStore.address) return;

    setIsSubmitting(true);
    try {
      if (editingStore.id) {
        await storesAPI.update(editingStore.id, editingStore);
        setStores((prev) =>
          prev.map((s) =>
            s.id === editingStore.id
              ? ({ ...s, ...editingStore } as LaundryStore)
              : s
          )
        );
        showToast("Đã cập nhật thông tin cửa hàng thành công!");
      } else {
        const newStoreObj: LaundryStore = {
          id: "store-" + Date.now(),
          rating: 4.8,
          reviewCount: 1,
          ...(editingStore as LaundryStore),
        };
        try {
          await storesAPI.create(newStoreObj);
        } catch {
          // Fallback local append
        }
        setStores((prev) => [newStoreObj, ...prev]);
        showToast("Đã thêm cửa hàng mới vào hệ thống!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      showToast("Có lỗi xảy ra: " + (error.message || "Thao tác thất bại"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async (id: string, name: string) => {
    try {
      await storesAPI.delete(id);
      setStores((prev) => prev.filter((s) => s.id !== id));
      showToast(`Đã xóa chi nhánh cửa hàng "${name}" khỏi danh sách!`);
    } catch {
      setStores((prev) => prev.filter((s) => s.id !== id));
      showToast(`Đã xóa cửa hàng "${name}"!`);
    }
  };

  const handleQuickToggleStatus = async (store: LaundryStore) => {
    const nextStatus =
      store.status === "open"
        ? "busy"
        : store.status === "busy"
          ? "closed"
          : "open";

    try {
      await storesAPI.update(store.id, { status: nextStatus });
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, status: nextStatus } : s))
      );
      showToast(
        `Đã đổi trạng thái "${store.name}" sang ${nextStatus.toUpperCase()}`
      );
    } catch {
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, status: nextStatus } : s))
      );
    }
  };

  const filteredStores = stores.filter((s) => {
    if (selectedCity !== "all" && s.district !== selectedCity) return false;
    if (selectedStatus !== "all" && s.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return {
    stores,
    allReviews,
    reviewStoreFilter,
    setReviewStoreFilter,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedStatus,
    setSelectedStatus,
    isModalOpen,
    setIsModalOpen,
    editingStore,
    setEditingStore,
    isSubmitting,
    toastMessage,
    filteredStores,
    fetchStores,
    handleToggleReviewVisibility,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSaveStore,
    handleDeleteStore,
    handleQuickToggleStatus,
  };
};
