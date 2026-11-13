import { Box, Typography, Stack } from "@mui/material";
import { Sparkles, Plus, Search, RefreshCw, Layers } from "lucide-react";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { useAdminServices } from "./hook";
import { ServicesTable } from "./components/ServicesTable";
import { ServiceFormModal } from "./components/ServiceFormModal";

export const AdminServices = () => {
  const {
    navigate,
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
  } = useAdminServices();

  return (
    <Box className="p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "slate.900",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Cấu Hình Dịch Vụ Giặt Sấy
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1">
            Quản trị viên thiết lập bảng đơn giá giặt theo cân ký (kg) hoặc theo
            món/bộ quần áo chi tiết.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <ButtonOutLine
            onClick={() => navigate("/admin/dashboard")}
            label="← Bảng điều hành"
            className="!w-auto !h-10 !px-4"
            textClassName="!text-xs"
          />
          <ButtonCustom
            onClick={handleOpenCreateModal}
            iconStart={<Plus className="w-4 h-4" />}
            label="Thêm dịch vụ mới"
            className="!w-auto !h-10 !px-4"
            textClassName="!text-xs"
          />
        </Stack>
      </Box>

      {/* Filters and search panel */}
      <Box className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <Box className="md:col-span-7">
          <InputText
            placeholder="Tìm theo tên dịch vụ, mô tả..."
            startAdornment={<Search className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: searchQuery,
              onChange: (e: any) => setSearchQuery(e.target.value),
            }}
          />
        </Box>

        <Box className="md:col-span-5 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Phân loại nhóm:
          </span>
          <InputSelect
            value={selectedCategory}
            options={[
              { value: "all", label: "Tất cả danh mục" },
              { value: "wash_fold", label: "Giặt sấy thông thường" },
              { value: "dry_clean", label: "Giặt hấp cao cấp" },
              { value: "heavy_items", label: "Đồ cồng kềnh" },
              { value: "special_care", label: "Chăm sóc đặc biệt" },
            ]}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </Box>
      </Box>

      {/* Error status panel */}
      {error && (
        <Box className="bg-rose-50 p-4 border border-rose-100 rounded-2xl text-center space-y-2">
          <Typography className="text-rose-600 text-sm font-medium">
            {error}
          </Typography>
          <ButtonOutLine
            iconStart={<RefreshCw className="w-4 h-4" />}
            onClick={loadServices}
            label="Thử tải lại"
            className="!w-auto !h-9 !px-4 mx-auto"
            textClassName="!text-xs"
          />
        </Box>
      )}

      {/* Services list table/grid */}
      {loading ? (
        <Box className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
          <Typography className="text-slate-500 font-medium">
            Đang đối soát danh sách dịch vụ tiệm...
          </Typography>
        </Box>
      ) : filteredServices.length === 0 ? (
        <Box className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm space-y-2">
          <Typography className="text-slate-400 font-bold">
            Không tìm thấy dịch vụ nào khớp
          </Typography>
          <Typography className="text-slate-400 text-xs block">
            Nhấp "Thêm dịch vụ mới" để tạo một kiểu giặt sấy mới.
          </Typography>
        </Box>
      ) : (
        <ServicesTable
          services={filteredServices}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteService}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Save Dialog modal */}
      <ServiceFormModal
        open={showModal}
        editingService={editingService}
        formName={formName}
        setFormName={setFormName}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formUnitPrice={formUnitPrice}
        setFormUnitPrice={setFormUnitPrice}
        formUnitName={formUnitName}
        setFormUnitName={setFormUnitName}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formPricingType={formPricingType}
        setFormPricingType={setFormPricingType}
        formIconName={formIconName}
        setFormIconName={setFormIconName}
        formDurationDays={formDurationDays}
        setFormDurationDays={setFormDurationDays}
        formFeatured={formFeatured}
        setFormFeatured={setFormFeatured}
        formIsActive={formIsActive}
        setFormIsActive={setFormIsActive}
        onClose={() => setShowModal(false)}
        onSave={handleSaveService}
      />
    </Box>
  );
};
