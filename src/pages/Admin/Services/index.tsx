import { useState, useEffect } from "react";
import { Box, Typography, Button, Stack, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, Switch, FormControlLabel } from "@mui/material";
import { Sparkles, Plus, Search, Edit2, Trash2, Tag, RefreshCw, Layers, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { servicesAPI } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import { useLoading } from "../../../context/LoadingContext";
import { LaundryService, ServiceCategory, PricingType } from "../../../types";

const SERVICE_CATEGORY_MAP: Record<ServiceCategory, string> = {
  wash_fold: "Giặt sấy thông thường",
  dry_clean: "Giặt hấp cao cấp",
  heavy_items: "Đồ cồng kềnh",
  special_care: "Chăm sóc đặc biệt",
};

export const AdminServices = () => {
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
  const [editingService, setEditingService] = useState<LaundryService | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formUnitPrice, setFormUnitPrice] = useState<number>(0);
  const [formUnitName, setFormUnitName] = useState("kg");
  const [formCategory, setFormCategory] = useState<ServiceCategory>("wash_fold");
  const [formPricingType, setFormPricingType] = useState<PricingType>("per_kg");
  const [formIconName, setFormIconName] = useState("Shirt");
  const [formDurationDays, setFormDurationDays] = useState<number>(1);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

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
      setError(err.response?.data?.message || "Không thể tải danh sách dịch vụ giặt.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

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
    // In types.ts, isActive might be optional, cast here to have safe access
    setFormIsActive((s as any).isActive !== undefined ? (s as any).isActive : true);
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
      showToast(err.response?.data?.message || "Đã xảy ra lỗi khi lưu dịch vụ giặt sấy.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá dịch vụ "${name}" khỏi tiệm?`)) {
      return;
    }

    setLoading(true);
    try {
      await servicesAPI.delete(id);
      showToast("Xoá dịch vụ giặt thành công!", "success");
      await loadServices();
    } catch (err: any) {
      console.error("Error deleting service:", err);
      showToast(err.response?.data?.message || "Không thể xoá dịch vụ này.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (s: LaundryService) => {
    setLoading(true);
    try {
      const currentActive = (s as any).isActive !== undefined ? (s as any).isActive : true;
      await servicesAPI.update(s.id, { isActive: !currentActive });
      showToast(`Đã ${!currentActive ? "kích hoạt" : "tạm dừng cung cấp"} dịch vụ thành công!`, "info");
      await loadServices();
    } catch (err: any) {
      console.error("Error toggling service status:", err);
      showToast(err.response?.data?.message || "Không thể chuyển trạng thái dịch vụ.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Box className="p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Box>
          <Typography
            variant="h4"
            sx={{ fontSize: "24px", fontWeight: "bold", color: "slate.900", display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Sparkles className="w-6 h-6 text-indigo-650 text-indigo-600" />
            Cấu Hình Dịch Vụ Giặt Sấy
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1">
            Quản trị viên thiết lập bảng đơn giá giặt theo cân ký (kg) hoặc theo món/bộ quần áo chi tiết.
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
            Thêm dịch vụ mới
          </Button>
        </Stack>
      </Box>

      {/* Filters and search panel */}
      <Box className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <Box className="w-full md:max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên dịch vụ, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
          />
        </Box>

        <Box className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Phân loại nhóm:
          </span>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="small"
            sx={{
              minWidth: 180,
              borderRadius: "10px",
              fontSize: "13px",
            }}
          >
            <MenuItem value="all">Tất cả danh mục</MenuItem>
            <MenuItem value="wash_fold">Giặt sấy thông thường</MenuItem>
            <MenuItem value="dry_clean">Giặt hấp cao cấp</MenuItem>
            <MenuItem value="heavy_items">Đồ cồng kềnh</MenuItem>
            <MenuItem value="special_care">Chăm sóc đặc biệt</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Error status panel */}
      {error && (
        <Box className="bg-rose-50 p-4 border border-rose-100 rounded-2xl text-center">
          <Typography className="text-rose-600 text-sm font-medium">{error}</Typography>
          <Button startIcon={<RefreshCw className="w-4 h-4" />} onClick={loadServices} sx={{ mt: 1, textTransform: "none", fontSize: "12px" }}>Thử tải lại</Button>
        </Box>
      )}

      {/* Services list table/grid */}
      {loading ? (
        <Box className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
          <Typography className="text-slate-500 font-medium">Đang đối soát danh sách dịch vụ tiệm...</Typography>
        </Box>
      ) : filteredServices.length === 0 ? (
        <Box className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm space-y-2">
          <Typography className="text-slate-400 font-bold">Không tìm thấy dịch vụ nào khớp</Typography>
          <Typography className="text-slate-400 text-xs block">Nhấp "Thêm dịch vụ mới" để tạo một kiểu giặt sấy mới.</Typography>
        </Box>
      ) : (
        <Box className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Dịch vụ giặt ủi</th>
                  <th className="py-4 px-4">Nhóm phân loại</th>
                  <th className="py-4 px-4">Hình thức tính giá</th>
                  <th className="py-4 px-4 text-right">Đơn giá áp dụng</th>
                  <th className="py-4 px-4 text-center">Xử lý (Ngày)</th>
                  <th className="py-4 px-4 text-center">Đặc trưng</th>
                  <th className="py-4 px-4 text-center">Trạng thái nhận</th>
                  <th className="py-4 px-6 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredServices.map((s) => {
                  const isActive = (s as any).isActive !== undefined ? (s as any).isActive : true;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-black uppercase">{s.iconName ? s.iconName.substring(0, 3) : "Gi"}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm block">{s.name}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 block">{s.description || "Chưa có văn bản mô tả..."}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[11px] font-bold text-slate-650 bg-slate-100 px-2.5 py-1 rounded-full flex items-center w-max gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {SERVICE_CATEGORY_MAP[s.category] || s.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-600">
                        {s.pricingType === "per_kg" ? "Theo cân ký (KG)" : "Tính theo chiếc/bộ"}
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-slate-900 text-sm">
                        {s.unitPrice.toLocaleString("vi-VN")}đ <span className="text-slate-400 font-medium text-xs">/ {s.unitName}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-700">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-lg text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" /> {s.durationDays} ngày
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {s.featured ? (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 rounded-full py-0.5 px-2 font-black inline-block">Nổi bật</span>
                        ) : (
                          <span className="text-[10px] text-slate-450 text-slate-450 block">Thường</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-all border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                          {isActive ? "Đang phục vụ" : "Tạm đóng"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl cursor-pointer border border-slate-100 hover:border-indigo-100 transition-all"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(s.id, s.name)}
                            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl cursor-pointer border border-slate-100 hover:border-rose-100 transition-all"
                            title="Xóa dịch vụ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Box>
      )}

      {/* Save Dialog modal */}
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
        <form onSubmit={handleSaveService}>
          <DialogTitle sx={{ fontWeight: 900, pb: 1, fontSize: "1.1rem" }}>
            {editingService ? `Cấu hình dịch vụ: ${editingService.name}` : "Thêm Giải Pháp Giặt Sấy Mới"}
          </DialogTitle>
          <DialogContent className="space-y-4 pt-4 mt-2">
            <TextField
              label="Tên dịch vụ giặt *"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Ví dụ: Giặt hấp áo da, Vệ sinh giày Sneaker..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <Box className="grid grid-cols-2 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Danh mục dịch vụ</InputLabel>
                <Select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ServiceCategory)}
                  label="Danh mục dịch vụ"
                  sx={{ borderRadius: "10px" }}
                >
                  <MenuItem value="wash_fold">Giặt sấy thông thường (Wash & Fold)</MenuItem>
                  <MenuItem value="dry_clean">Giặt khô / Giặt hấp (Dry Clean)</MenuItem>
                  <MenuItem value="heavy_items">Đồ cồng kềnh (Chăn, Drap, Rèm)</MenuItem>
                  <MenuItem value="special_care">Chăm sóc đặc biệt (Vệ sinh giày/áo hiệu)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Quy chuẩn báo giá</InputLabel>
                <Select
                  value={formPricingType}
                  onChange={(e) => setFormPricingType(e.target.value as PricingType)}
                  label="Quy chuẩn báo giá"
                  sx={{ borderRadius: "10px" }}
                >
                  <MenuItem value="per_kg">Báo giá theo Cân ký (KG)</MenuItem>
                  <MenuItem value="per_item">Báo giá theo Chiếc / Bộ / Đôi</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                label="Đơn giá bán (VNĐ) *"
                type="number"
                value={formUnitPrice}
                onChange={(e) => setFormUnitPrice(Number(e.target.value))}
                fullWidth
                size="small"
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                label="Tên đơn vị quy ước"
                value={formUnitName}
                onChange={(e) => setFormUnitName(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Ví dụ: kg, cái, bộ, đôi..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                label="Thời gian hoàn thành (Đơn vị: Ngày)"
                type="number"
                value={formDurationDays}
                onChange={(e) => setFormDurationDays(Number(e.target.value))}
                fullWidth
                size="small"
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                label="Ký hiệu Icon (Shirt/Sparkles...)"
                value={formIconName}
                onChange={(e) => setFormIconName(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Shirt, Sparkles, BedDouble..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Box>

            <Box className="flex gap-4 items-center pl-1">
              <FormControlLabel
                control={
                  <Switch
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    color="primary"
                  />
                }
                label="Thiết lập nổi bật (Featured)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Đang mở nhận giặt"
              />
            </Box>

            <TextField
              label="Mô tả kỹ thuật quy trình giặt"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              multiline
              rows={3}
              placeholder="Quy trình thực hiện, cam kết chất lượng..."
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
                "&:hover": { bgcolor: "indigo.700" }
              }}
            >
              {editingService ? "Áp dụng cập nhật" : "Khởi tạo dịch vụ"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
