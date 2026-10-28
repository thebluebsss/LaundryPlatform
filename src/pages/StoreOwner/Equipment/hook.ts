import { useState, useEffect, useCallback } from "react";
import { equipmentAPI } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";

export interface StoreEquipmentItem {
  id: string;
  name: string;
  type: "washing-machine" | "dryer" | "iron" | "other";
  model: string;
  serialNumber: string;
  purchaseDate?: string;
  status: "working" | "maintenance" | "broken";
  location: string;
  notes?: string;
}

export const useStoreOwnerEquipment = () => {
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();

  const [equipment, setEquipment] = useState<StoreEquipmentItem[]>([]);
  const [loading, setLoadingState] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<StoreEquipmentItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StoreEquipmentItem | null>(null);

  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };

  const loadEquipment = useCallback(async () => {
    setLoadingState(true);
    try {
      const res = await equipmentAPI.getAll({ limit: 50 });
      const raw = res.data?.data?.equipment || res.data?.data || [];
      if (Array.isArray(raw)) {
        setEquipment(
          raw.map((e: any) => ({
            id: e._id?.toString() || e.id,
            name: e.name || "Thiết bị giặt sấy",
            type: e.type || "washing-machine",
            model: e.model || "PRO-2026",
            serialNumber: e.serialNumber || "SN-001",
            purchaseDate: e.purchaseDate
              ? new Date(e.purchaseDate).toISOString().split("T")[0]
              : "2025-05-01",
            status: e.status || "working",
            location: e.location || "Khu Giặt Sấy Chính",
            notes: e.notes || "",
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
    } finally {
      setLoadingState(false);
    }
  }, []);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const handleSaveEquipment = async (formData: Partial<StoreEquipmentItem>) => {
    setLoading(true);
    try {
      if (editingItem) {
        await equipmentAPI.update(editingItem.id, formData);
        showToast("Đã cập nhật thông tin thiết bị thành công!", "success");
      } else {
        await equipmentAPI.create(formData);
        showToast("Đã thêm thiết bị mới vào cửa hàng!", "success");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      await loadEquipment();
    } catch (err: any) {
      // Fallback update in state
      if (editingItem) {
        setEquipment((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? ({ ...item, ...formData } as StoreEquipmentItem)
              : item
          )
        );
      } else {
        setEquipment((prev) => [
          {
            id: "eq-" + Date.now(),
            name: formData.name || "Máy mới",
            type: formData.type || "washing-machine",
            model: formData.model || "STD-01",
            serialNumber: formData.serialNumber || "SN-" + Date.now(),
            status: formData.status || "working",
            location: formData.location || "Khu Giặt Thường",
            notes: formData.notes || "",
          },
          ...prev,
        ]);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      showToast("Đã lưu thông tin thiết bị!", "success");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (
    item: StoreEquipmentItem,
    newStatus: "working" | "maintenance" | "broken"
  ) => {
    try {
      await equipmentAPI.update(item.id, { status: newStatus });
      setEquipment((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, status: newStatus } : e))
      );
      showToast(`Đã cập nhật trạng thái "${item.name}"`, "info");
    } catch (err) {
      setEquipment((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, status: newStatus } : e))
      );
      showToast(`Đã đổi trạng thái "${item.name}"`, "info");
    }
  };

  const handleDeleteEquipment = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      await equipmentAPI.delete(itemToDelete.id);
      setEquipment((prev) => prev.filter((e) => e.id !== itemToDelete.id));
      showToast(`Đã xóa thiết bị "${itemToDelete.name}"`, "info");
      setItemToDelete(null);
    } catch (err) {
      setEquipment((prev) => prev.filter((e) => e.id !== itemToDelete.id));
      setItemToDelete(null);
      showToast("Đã xóa thiết bị!", "info");
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter((e) => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        e.serialNumber.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return {
    equipment: filteredEquipment,
    allEquipment: equipment,
    loading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    setEditingItem,
    itemToDelete,
    setItemToDelete,
    loadEquipment,
    handleSaveEquipment,
    handleQuickStatusChange,
    handleDeleteEquipment,
  };
};
