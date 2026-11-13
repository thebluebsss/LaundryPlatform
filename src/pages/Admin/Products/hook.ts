import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  stock: number;
  unit: string;
  weight?: string;
  brand?: string;
  isActive: boolean;
  createdAt?: string;
}

export const CATEGORY_MAP: Record<string, string> = {
  "Bột giặt": "Bột giặt",
  "Nước xả": "Nước xả",
  "Nước giặt": "Nước giặt",
  "Xà phòng": "Xà phòng",
  "Nước tẩy": "Nước tẩy",
  "Phụ kiện": "Phụ kiện",
  accessory: "Phụ kiện",
  care: "Chăm sóc vải",
  cleaning: "Dụng cụ vệ sinh",
  detergent: "Nước giặt chính",
  softener: "Nước xả chính",
  bleach: "Nước tẩy rửa",
  bag: "Túi giặt chuyên dụng",
  other: "Sản phẩm khác",
};

export const useAdminProducts = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setLoading: setGlobalLoading } = useLoading();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoadingState] = useState(true);

  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };

  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | "">("");
  const [formCategory, setFormCategory] = useState("Nước giặt");
  const [formUnit, setFormUnit] = useState("Chai");
  const [formStock, setFormStock] = useState<number>(10);
  const [formImage, setFormImage] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await productsAPI.getAll({ limit: 100 });
      const productsData = response.data.data?.products || [];

      setProducts(
        Array.isArray(productsData)
          ? productsData.map((p: any) => ({
              id: p._id || p.id,
              name: p.name,
              description: p.description || "",
              price: p.price || 0,
              originalPrice: p.originalPrice,
              category: p.category || "other",
              image: p.image || "",
              stock: p.stock !== undefined ? p.stock : 0,
              unit: p.unit || "Chai",
              brand: p.brand || "",
              weight: p.weight || "",
              isActive: p.isActive !== undefined ? p.isActive : true,
              createdAt: p.createdAt,
            }))
          : []
      );
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách sản phẩm."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice(0);
    setFormOriginalPrice("");
    setFormCategory("Nước giặt");
    setFormUnit("Chai");
    setFormStock(50);
    setFormImage("");
    setFormBrand("");
    setFormWeight("");
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (p: AdminProduct) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.description);
    setFormPrice(p.price);
    setFormOriginalPrice(
      p.originalPrice !== undefined && p.originalPrice !== null
        ? p.originalPrice
        : ""
    );
    setFormCategory(p.category);
    setFormUnit(p.unit);
    setFormStock(p.stock);
    setFormImage(p.image || "");
    setFormBrand(p.brand || "");
    setFormWeight(p.weight || "");
    setFormIsActive(p.isActive);
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Vui lòng nhập tên sản phẩm!", "warning");
      return;
    }
    if (formPrice <= 0) {
      showToast("Đơn giá bán phải lớn hơn 0!", "warning");
      return;
    }

    const payload: any = {
      name: formName,
      description: formDescription,
      price: Number(formPrice),
      category: formCategory,
      unit: formUnit,
      stock: Number(formStock),
      isActive: formIsActive,
    };

    if (formOriginalPrice !== "") {
      payload.originalPrice = Number(formOriginalPrice);
    }
    if (formImage.trim()) {
      payload.image = formImage.trim();
    } else {
      payload.image = `https://images.unsplash.com/photo-1610557892470-76d747e49536?w=200&auto=format&fit=crop&q=60`;
    }
    if (formBrand.trim()) payload.brand = formBrand.trim();
    if (formWeight.trim()) payload.weight = formWeight.trim();

    setLoading(true);
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, payload);
        showToast("Cập nhật sản phẩm thành công!", "success");
      } else {
        await productsAPI.create(payload);
        showToast("Thêm mới sản phẩm thành công!", "success");
      }
      setShowModal(false);
      await loadProducts();
    } catch (err: any) {
      console.error("Error saving product:", err);
      showToast(
        err.response?.data?.message || "Đã xảy ra lỗi khi lưu sản phẩm.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    setLoading(true);
    try {
      await productsAPI.delete(id);
      showToast(`Đã xoá sản phẩm "${name}" thành công!`, "success");
      await loadProducts();
    } catch (err: any) {
      console.error("Error deleting product:", err);
      showToast(
        err.response?.data?.message || "Không thể xoá sản phẩm này.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (p: AdminProduct) => {
    setLoading(true);
    try {
      await productsAPI.update(p.id, { isActive: !p.isActive });
      showToast(
        `Đã ${!p.isActive ? "kích hoạt" : "tạm ngưng"} sản phẩm thành công!`,
        "info"
      );
      await loadProducts();
    } catch (err: any) {
      console.error("Error toggling product status:", err);
      showToast(
        err.response?.data?.message || "Không thể chuyển trạng thái sản phẩm.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return {
    navigate,
    products,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showModal,
    setShowModal,
    editingProduct,
    formName,
    setFormName,
    formDescription,
    setFormDescription,
    formPrice,
    setFormPrice,
    formOriginalPrice,
    setFormOriginalPrice,
    formCategory,
    setFormCategory,
    formUnit,
    setFormUnit,
    formStock,
    setFormStock,
    formImage,
    setFormImage,
    formBrand,
    setFormBrand,
    formWeight,
    setFormWeight,
    formIsActive,
    setFormIsActive,
    filteredProducts,
    loadProducts,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveProduct,
    handleDeleteProduct,
    handleToggleStatus,
  };
};
