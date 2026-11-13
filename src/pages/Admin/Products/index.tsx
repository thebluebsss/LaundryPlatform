import { Box, Typography, Stack } from "@mui/material";
import { Package, Plus, Search, RefreshCw, Layers } from "lucide-react";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { useAdminProducts } from "./hook";
import { ProductsTable } from "./components/ProductsTable";
import { ProductFormModal } from "./components/ProductFormModal";

export type { AdminProduct } from "./hook";

export const AdminProducts = () => {
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
  } = useAdminProducts();

  return (
    <Box className="p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header element */}
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
              gap: 1,
            }}
          >
            <Package className="w-6 h-6 text-indigo-600" />
            Quản Lý Sản Phẩm Tiệm
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1">
            Thiết lập danh mục nước giặt xả, phụ kiện, túi giữ nhiệt bán kèm cho
            khách hàng đặt lịch.
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
            label="Thêm sản phẩm"
            className="!w-auto !h-10 !px-4"
            textClassName="!text-xs"
          />
        </Stack>
      </Box>

      {/* Searching filters and quick category selectors */}
      <Box className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <Box className="md:col-span-7">
          <InputText
            placeholder="Tìm theo tên nước giặt, thương hiệu..."
            startAdornment={<Search className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: searchQuery,
              onChange: (e: any) => setSearchQuery(e.target.value),
            }}
          />
        </Box>

        <Box className="md:col-span-5 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Bộ lọc:
          </span>
          <InputSelect
            value={selectedCategory}
            options={[
              { value: "all", label: "Tất cả danh mục" },
              { value: "Bột giặt", label: "Bột giặt" },
              { value: "Nước giặt", label: "Nước giặt" },
              { value: "Nước xả", label: "Nước xả" },
              { value: "Xà phòng", label: "Xà phòng" },
              { value: "Nước tẩy", label: "Nước tẩy" },
              { value: "Phụ kiện", label: "Phụ kiện" },
              { value: "accessory", label: "Phụ kiện (ENG)" },
              { value: "care", label: "Chăm sóc giày/áo" },
              { value: "cleaning", label: "Dụng cụ lau chùi" },
              { value: "detergent", label: "Detergent (Gốc)" },
              { value: "softener", label: "Softener (Gốc)" },
              { value: "other", label: "Khác" },
            ]}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </Box>
      </Box>

      {/* Error display */}
      {error && (
        <Box className="bg-rose-50 p-4 border border-rose-100 rounded-2xl text-center space-y-2">
          <Typography className="text-rose-600 text-sm font-medium">
            {error}
          </Typography>
          <ButtonOutLine
            iconStart={<RefreshCw className="w-4 h-4" />}
            onClick={loadProducts}
            label="Thử tải lại"
            className="!w-auto !h-9 !px-4 mx-auto"
            textClassName="!text-xs"
          />
        </Box>
      )}

      {/* Grid view/table details loading */}
      {loading ? (
        <Box className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
          <Typography className="text-slate-500 font-medium">
            Đang truy vấn kho sản phẩm...
          </Typography>
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Box className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm space-y-2">
          <Typography className="text-slate-400 font-bold">
            Không tìm thấy sản phẩm phù hợp
          </Typography>
          <Typography className="text-slate-400 text-xs text-center block">
            Vui lòng thay đổi từ khóa hoặc nhấn "Thêm sản phẩm" để khởi tạo.
          </Typography>
        </Box>
      ) : (
        <ProductsTable
          products={filteredProducts}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteProduct}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Add / Edit product dialog modal */}
      <ProductFormModal
        open={showModal}
        editingProduct={editingProduct}
        formName={formName}
        setFormName={setFormName}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formPrice={formPrice}
        setFormPrice={setFormPrice}
        formOriginalPrice={formOriginalPrice}
        setFormOriginalPrice={setFormOriginalPrice}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formUnit={formUnit}
        setFormUnit={setFormUnit}
        formStock={formStock}
        setFormStock={setFormStock}
        formImage={formImage}
        setFormImage={setFormImage}
        formBrand={formBrand}
        setFormBrand={setFormBrand}
        formWeight={formWeight}
        setFormWeight={setFormWeight}
        formIsActive={formIsActive}
        setFormIsActive={setFormIsActive}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProduct}
      />
    </Box>
  );
};
