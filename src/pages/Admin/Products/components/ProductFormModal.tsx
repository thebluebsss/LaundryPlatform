import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { InputText } from "../../../../components/InputText";
import { InputSelect } from "../../../../components/InputSelect";
import { InputArea } from "../../../../components/InputArea";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";
import { AdminProduct } from "../hook";

interface ProductFormModalProps {
  open: boolean;
  editingProduct: AdminProduct | null;
  formName: string;
  setFormName: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formPrice: number;
  setFormPrice: (val: number) => void;
  formOriginalPrice: number | "";
  setFormOriginalPrice: (val: number | "") => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formUnit: string;
  setFormUnit: (val: string) => void;
  formStock: number;
  setFormStock: (val: number) => void;
  formImage: string;
  setFormImage: (val: string) => void;
  formBrand: string;
  setFormBrand: (val: string) => void;
  formWeight: string;
  setFormWeight: (val: string) => void;
  formIsActive: boolean;
  setFormIsActive: (val: boolean) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
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
  onClose,
  onSave,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "24px",
          p: 1,
        },
      }}
    >
      <form onSubmit={onSave}>
        <DialogTitle sx={{ fontWeight: 900, pb: 1, fontSize: "1.1rem" }}>
          {editingProduct
            ? `Biên Tập: ${editingProduct.name}`
            : "Tạo Mới Sản Phẩm Bán Kèm"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4 mt-2">
          <InputText
            title="Tên sản phẩm"
            required
            placeholder="Ví dụ: Nước xả Comfort hương ban mai"
            inputProps={{
              value: formName,
              onChange: (e: any) => setFormName(e.target.value),
            }}
          />

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              title="Giá bán (VNĐ)"
              required
              inputProps={{
                type: "number",
                value: String(formPrice),
                onChange: (e: any) => setFormPrice(Number(e.target.value)),
              }}
            />
            <InputText
              title="Giá gốc (nếu có)"
              placeholder="Để trống nếu không giảm giá"
              inputProps={{
                type: "number",
                value: String(formOriginalPrice),
                onChange: (e: any) =>
                  setFormOriginalPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  ),
              }}
            />
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputSelect
              title="Danh mục phân loại"
              required
              value={formCategory}
              options={[
                { value: "Bột giặt", label: "Bột giặt" },
                { value: "Nước xả", label: "Nước xả" },
                { value: "Nước giặt", label: "Nước giặt" },
                { value: "Xà phòng", label: "Xà phòng" },
                { value: "Nước tẩy", label: "Nước tẩy" },
                { value: "Phụ kiện", label: "Phụ kiện" },
                { value: "accessory", label: "Phụ kiện (ENG)" },
                { value: "care", label: "Chăm sóc giày/áo" },
                { value: "cleaning", label: "Dụng cụ lau chùi" },
                { value: "detergent", label: "Detergent (Gốc)" },
                { value: "softener", label: "Softener (Gốc)" },
                { value: "other", label: "Sản phẩm khác" },
              ]}
              onChange={(e) => setFormCategory(e.target.value)}
            />

            <InputText
              title="Đơn vị tính"
              placeholder="Chai, túi, gói, chiếc..."
              inputProps={{
                value: formUnit,
                onChange: (e: any) => setFormUnit(e.target.value),
              }}
            />
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              title="Số lượng tồn kho"
              inputProps={{
                type: "number",
                value: String(formStock),
                onChange: (e: any) => setFormStock(Number(e.target.value)),
              }}
            />
            <InputText
              title="Thể tích / Trọng lượng"
              placeholder="Ví dụ: 3.8kg, 500ml..."
              inputProps={{
                value: formWeight,
                onChange: (e: any) => setFormWeight(e.target.value),
              }}
            />
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <InputText
              title="Thương hiệu"
              placeholder="Omo, Comfort, Downy..."
              inputProps={{
                value: formBrand,
                onChange: (e: any) => setFormBrand(e.target.value),
              }}
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

          <InputText
            title="URL Ảnh sản phẩm"
            placeholder="https://images.unsplash.com/..."
            inputProps={{
              value: formImage,
              onChange: (e: any) => setFormImage(e.target.value),
            }}
          />

          <InputArea
            title="Mô tả sản phẩm"
            rows={3}
            placeholder="Chi tiết công dụng, cách dùng..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <ButtonOutLine
            type="button"
            onClick={onClose}
            label="Hủy bỏ"
            className="!w-auto !h-10 !px-5"
            textClassName="!text-xs"
          />
          <ButtonCustom
            type="submit"
            label={editingProduct ? "Cập nhật" : "Khởi tạo ngay"}
            className="!w-auto !h-10 !px-6"
            textClassName="!text-xs"
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};
