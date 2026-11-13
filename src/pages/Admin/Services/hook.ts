import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { servicesAPI } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";
import { LaundryService, ServiceCategory, PricingType } from "../../../types";

export const SERVICE_CATEGORY_MAP: Record<ServiceCategory, string> = {
  wash_fold: "Giặt sấy thông thường",
  dry_clean: "Giặt hấp cao cấp",
  heavy_items: "Đồ cồng kềnh",
  special_care: "Chăm sóc đặc biệt",
};

export const useAdminServices = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();
  const [services, setServices] = useState<LaundryService[]>([]);
  const [loading, setLoadingState] = useState(true);

  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };

  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<LaundryService | null>(
    null
  );
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formUnitPrice, setFormUnitPrice] = useState<number>(0);
  const [formUnitName, setFormUnitName] = useState("kg");
  const [formCategory, setFormCategory] =
    useState<ServiceCategory>("wash_fold");
  const [formPricingType, setFormPricingType] =
    useState<PricingType>("per_kg");
  const [formIconName, setFormIconName] = useState("Shirt");
  const [formDurationDays, setFormDurationDays] = useState<number>(1);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await servicesAPI.getAll();
      const fetchedServices = response.data.data?.services || [];

      setServices(
        Array.isArray(fetchedServices)
          ? fetchedServices.map((s: any) => ({
              id: s._id || s.id,
              name: s.name,
              category: s.category || "wash_fold",
              pricingType: s.pricingType || "per_kg",
              unitPrice: s.unitPrice || 0,
              unitName: s.unitName || "kg",
              description: s.description || "",
              iconName: s.iconName || "Shirt",
              durationDays: s.durationDays || 1,
              featured: s.featured || false,
              isActive: s.isActive !== undefined ? s.isActive : true,
            }))
          : []
      );
    } catch (err: any) {
      console.error("Error loading services:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách dịch vụ giặt."
      );
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormName("");
    setFormDescription("");
    setFormUnitPrice(15000);
    setFormUnitName("kg");
    setFormCategory("wash_fold");
    setFormPricingType("per_kg");
    setFormIconName("Shirt");
    setFormDurationDays(1);
    setFormFeatured(false);
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (s: LaundryService) => {
    setEditingService(s);
    setFormName(s.name);
    setFormDescription(s.description);
    setFormUnitPrice(s.unitPrice);
    setFormUnitName(s.unitName);
    setFormCategory(s.category);
    setFormPricingType(s.pricingType);
    setFormIconName(s.iconName);
    setFormDurationDays(s.durationDays);
    setFormFeatured(s.featured || false);
    setFormIsActive(
      (s as any).isActive !== undefined ? (s as any).isActive : true
    );
    setShowModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Vui lòng nhập tên dịch vụ!", "warning");
      return;
    }
    if (formUnitPrice <= 0) {
      showToast("Đơn giá bán phải lớn hơn 0!", "warning");
      return;
    }

    const payload: any = {
      name: formName.trim(),
      description: formDescription.trim(),
      unitPrice: Number(formUnitPrice),
      unitName: formUnitName.trim() || "kg",
      category: formCategory,
      pricingType: formPricingType,
      iconName: formIconName,
      durationDays: Number(formDurationDays),
      featured: formFeatured,
      isActive: formIsActive,
    };

    setLoading(true);
    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, payload);
        showToast("Cập nhật dịch vụ giặt sấy thành công!", "success");
      } else {
        await servicesAPI.create(payload);
        showToast("Thêm mới dịch vụ thành công!", "success");
      }
      setShowModal(false);
      await loadServices();
    } catch (err: any) {
      console.error("Error saving service:", err);
      showToast(
        err.response?.data?.message ||
          "Đã xảy ra lỗi khi lưu dịch vụ giặt sấy.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    setLoading(true);
    try {
      await servicesAPI.delete(id);
      showToast(`Đã xoá dịch vụ giặt "${name}" thành công!`, "success");
      await loadServices();
    } catch (err: any) {
      console.error("Error deleting service:", err);
      showToast(
        err.response?.data?.message || "Không thể xoá dịch vụ này.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (s: LaundryService) => {
    setLoading(true);
    try {
      const currentActive =
        (s as any).isActive !== undefined ? (s as any).isActive : true;
      await servicesAPI.update(s.id, { isActive: !currentActive });
      showToast(
        `Đã ${!currentActive ? "kích hoạt" : "tạm dừng cung cấp"} dịch vụ thành công!`,
        "info"
      );
      await loadServices();
    } catch (err: any) {
      console.error("Error toggling service status:", err);
      showToast(
        err.response?.data?.message || "Không thể chuyển trạng thái dịch vụ.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description &&
        s.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || s.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return {
    navigate,
    services,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showModal,
    setShowModal,
    editingService,
    formName,
    setFormName,
    formDescription,
    setFormDescription,
    formUnitPrice,
    setFormUnitPrice,
    formUnitName,
    setFormUnitName,
    formCategory,
    setFormCategory,
    formPricingType,
    setFormPricingType,
    formIconName,
    setFormIconName,
    formDurationDays,
    setFormDurationDays,
    formFeatured,
    setFormFeatured,
    formIsActive,
    setFormIsActive,
    filteredServices,
    loadServices,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveService,
    handleDeleteService,
    handleToggleStatus,
  };
};
