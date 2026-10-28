import { useState, useEffect } from "react";
import { Box, Typography, Button, Stack, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, Switch, FormControlLabel } from "@mui/material";
import { Package, Plus, Search, Edit2, Trash2, Tag, RefreshCw, Layers } from "lucide-react";
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

const CATEGORY_MAP: Record<string, string> = {
  "Bột giặt": "Bột giặt",
  "Nước xả": "Nước xả",
  "Nước giặt": "Nước giặt",
  "Xà phòng": "Xà phòng",
  "Nước tẩy": "Nước tẩy",
  "Phụ kiện": "Phụ kiện",
  "accessory": "Phụ kiện",
  "care": "Chăm sóc vải",
  "cleaning": "Dụng cụ vệ sinh",
  "detergent": "Nước giặt chính",
  "softener": "Nước xả chính",
  "bleach": "Nước tẩy rửa",
  "bag": "Túi giặt chuyên dụng",
  "other": "Sản phẩm khác",
};

export const AdminProducts = () => {
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
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
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

  useEffect(() => {
    loadProducts();
  }, []);

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
      setError(err.response?.data?.message || "Không thể tải danh sách sản phẩm.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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
    setFormOriginalPrice(p.originalPrice !== undefined && p.originalPrice !== null ? p.originalPrice : "");
    // Ensure the form category is one of the valid ones
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
      showToast(err.response?.data?.message || "Đã xảy ra lỗi khi lưu sản phẩm.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá sản phẩm "${name}" không?`)) {
      return;
    }

    setLoading(true);
    try {
      await productsAPI.delete(id);
      showToast("Xoá sản phẩm thành công!", "success");
      await loadProducts();
    } catch (err: any) {
      console.error("Error deleting product:", err);
      showToast(err.response?.data?.message || "Không thể xoá sản phẩm này.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (p: AdminProduct) => {
    setLoading(true);
    try {
      await productsAPI.update(p.id, { isActive: !p.isActive });
      showToast(`Đã ${!p.isActive ? "kích hoạt" : "tạm ngưng"} sản phẩm thành công!`, "info");
      await loadProducts();
    } catch (err: any) {
      console.error("Error toggling product status:", err);
      showToast(err.response?.data?.message || "Không thể chuyển trạng thái sản phẩm.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Box className="p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header element */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Box>
          <Typography
            variant="h4"
            sx={{ fontSize: "24px", fontWeight: "bold", color: "slate.900", display: "flex", alignItems: "center", gap: 1 }}
          >
            <Package className="w-6 h-6 text-indigo-600" />
            Quản Lý Sản Phẩm Tiệm
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1">
            Thiết lập danh mục nước giặt xả, phụ kiện, túi giữ nhiệt bán kèm cho khách hàng đặt lịch.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => navigate("/admin/dashboard")}
            variant="outlined"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "13px",
              color: "slate.700",
              borderColor: "slate.200",
              "&:hover": { bgcolor: "slate.50", borderColor: "slate.300" }
            }}
          >
            ← Bảng điều hành
          </Button>
          <Button
            onClick={handleOpenCreateModal}
            variant="contained"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "13px",
              bgcolor: "indigo.600",
              "&:hover": { bgcolor: "indigo.700" },
            }}
            startIcon={<Plus className="w-4 h-4" />}
          >
            Thêm sản phẩm
          </Button>
        </Stack>
      </Box>

      {/* Searching filters and quick category selectors */}
      <Box className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <Box className="w-full md:max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên nước giặt, thương hiệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-505 focus:ring-indigo-600/20 focus:border-indigo-600"
          />
        </Box>

        <Box className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Bộ lọc:
          </span>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="small"
            sx={{
              minWidth: 150,
              borderRadius: "10px",
              fontSize: "13px",
            }}
          >
            <MenuItem value="all">Tất cả danh mục</MenuItem>
            <MenuItem value="Bột giặt">Bột giặt</MenuItem>
            <MenuItem value="Nước giặt">Nước giặt</MenuItem>
            <MenuItem value="Nước xả">Nước xả</MenuItem>
            <MenuItem value="Xà phòng">Xà phòng</MenuItem>
            <MenuItem value="Nước tẩy">Nước tẩy</MenuItem>
            <MenuItem value="Phụ kiện">Phụ kiện</MenuItem>
            <MenuItem value="accessory">Phụ kiện (ENG)</MenuItem>
            <MenuItem value="care">Chăm sóc giày/áo</MenuItem>
            <MenuItem value="cleaning">Dụng cụ lau chùi</MenuItem>
            <MenuItem value="detergent">Detergent (Gốc)</MenuItem>
            <MenuItem value="softener">Softener (Gốc)</MenuItem>
            <MenuItem value="other">Khác</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Error display */}
      {error && (
        <Box className="bg-rose-50 p-4 border border-rose-100 rounded-2xl text-center">
          <Typography className="text-rose-600 text-sm font-medium">{error}</Typography>
          <Button startIcon={<RefreshCw className="w-4 h-4" />} onClick={loadProducts} sx={{ mt: 1, textTransform: "none", fontSize: "12px" }}>Thử tải lại</Button>
        </Box>
      )}

      {/* Grid view/table details loading */}
      {loading ? (
        <Box className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
          <Typography className="text-slate-500 font-medium">Đang truy vấn kho sản phẩm...</Typography>
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Box className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm space-y-2">
          <Typography className="text-slate-400 font-bold">Không tìm thấy sản phẩm phù hợp</Typography>
          <Typography className="text-slate-400 text-xs text-center block">Vui lòng thay đổi từ khóa hoặc nhấn "Thêm sản phẩm" để khởi tạo.</Typography>
        </Box>
      ) : (
        <Box className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 border-slate-100 text-[11px] font-black uppercase text-slate-450 text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Ảnh / Tên</th>
                  <th className="py-4 px-4">Phân loại</th>
                  <th className="py-4 px-4 text-right">Đơn giá bán</th>
                  <th className="py-4 px-4 text-center">Tồn kho</th>
                  <th className="py-4 px-4 text-center">Trạng thái mua</th>
                  <th className="py-4 px-6 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || "https://images.unsplash.com/photo-1610557892470-76d747e49536?w=100&auto=format&fit=crop&q=60"}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-100"
                        />
                        <div>
                          <span className="font-extrabold text-slate-800 text-sm block">{p.name}</span>
                          {p.brand && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold mr-1">{p.brand}</span>}
                          {p.weight && <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">{p.weight}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center w-max gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {CATEGORY_MAP[p.category] || p.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-extrabold text-slate-800 block">{(p.price || 0).toLocaleString("vi-VN")}đ</span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-slate-450 text-slate-400 line-through">
                          {(p.originalPrice || 0).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-mono font-bold ${p.stock <= 5 ? "text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-black" : "text-slate-700"}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                        {p.isActive ? "Đang Bán" : "Tạm Ngưng"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl cursor-pointer border border-slate-100 hover:border-indigo-100 transition-all"
                          title="Sửa sản phẩm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl cursor-pointer border border-slate-100 hover:border-rose-100 transition-all"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      )}

      {/* Add / Edit product dialog modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "24px",
            p: 1,
          }
        }}
      >
        <form onSubmit={handleSaveProduct}>
          <DialogTitle sx={{ fontWeight: 900, pb: 1, fontSize: "1.1rem" }}>
            {editingProduct ? `Biên Tập: ${editingProduct.name}` : "Tạo Mới Sản Phẩm Bán Kèm"}
          </DialogTitle>
          <DialogContent className="space-y-4 pt-4 mt-2">
            <TextField
              label="Tên sản phẩm *"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Ví dụ: Nước xả Comfort hương ban mai"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                label="Giá bán (VNĐ) *"
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                fullWidth
                size="small"
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                label="Giá gốc (gối găm mốc)"
                type="number"
                value={formOriginalPrice}
                onChange={(e) => setFormOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Để trống nếu không giảm giá"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Danh mục phân loại *</InputLabel>
                <Select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  label="Danh mục phân loại *"
                  sx={{ borderRadius: "10px" }}
                >
                  <MenuItem value="Bột giặt">Bột giặt</MenuItem>
                  <MenuItem value="Nước xả">Nước xả</MenuItem>
                  <MenuItem value="Nước giặt">Nước giặt</MenuItem>
                  <MenuItem value="Xà phòng">Xà phòng</MenuItem>
                  <MenuItem value="Nước tẩy">Nước tẩy</MenuItem>
                  <MenuItem value="Phụ kiện">Phụ kiện</MenuItem>
                  <MenuItem value="accessory">Phụ kiện (ENG)</MenuItem>
                  <MenuItem value="care">Chăm sóc giày/áo</MenuItem>
                  <MenuItem value="cleaning">Dụng cụ lau chùi</MenuItem>
                  <MenuItem value="detergent">Detergent (Gốc)</MenuItem>
                  <MenuItem value="softener">Softener (Gốc)</MenuItem>
                  <MenuItem value="other">Sản phẩm khác</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Đơn vị tính"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Chai, túi, gói, chiếc..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                label="Số lượng tồn kho"
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(Number(e.target.value))}
                fullWidth
                size="small"
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                label="Thể tích / Trọng lượng"
                value={formWeight}
                onChange={(e) => setFormWeight(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Ví dụ: 3.8kg, 500ml..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                label="Thương hiệu"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Omo, Comfort, Downy..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Kích hoạt bán ngay"
                sx={{ ml: 1 }}
              />
            </Box>

            <TextField
              label="URL Ảnh sản phẩm"
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="https://images.unsplash.com/..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <TextField
              label="Mô tả sản phẩm"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              multiline
              rows={3}
              placeholder="Chi tiết công dụng, cách dùng..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={() => setShowModal(false)}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "10px",
                color: "slate.500",
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "10px",
                bgcolor: "indigo.600",
                "&:hover": { bgval: "indigo.700" }
              }}
            >
              {editingProduct ? "Cập nhật" : "Khởi tạo ngay"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
