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
import { LaundryService, ServiceCategory, PricingType } from "../../../../types";

interface ServiceFormModalProps {
  open: boolean;
  editingService: LaundryService | null;
  formName: string;
  setFormName: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formUnitPrice: number;
  setFormUnitPrice: (val: number) => void;
  formUnitName: string;
  setFormUnitName: (val: string) => void;
  formCategory: ServiceCategory;
  setFormCategory: (val: ServiceCategory) => void;
  formPricingType: PricingType;
  setFormPricingType: (val: PricingType) => void;
  formIconName: string;
  setFormIconName: (val: string) => void;
  formDurationDays: number;
  setFormDurationDays: (val: number) => void;
  formFeatured: boolean;
  setFormFeatured: (val: boolean) => void;
  formIsActive: boolean;
  setFormIsActive: (val: boolean) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  open,
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
          {editingService
            ? `Cấu hình dịch vụ: ${editingService.name}`
            : "Thêm Giải Pháp Giặt Sấy Mới"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4 mt-2">
          <InputText
            title="Tên dịch vụ giặt"
            required
            placeholder="Ví dụ: Giặt hấp áo da, Vệ sinh giày Sneaker..."
            inputProps={{
              value: formName,
              onChange: (e: any) => setFormName(e.target.value),
            }}
          />

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputSelect
              title="Danh mục dịch vụ"
              value={formCategory}
              options={[
                {
                  value: "wash_fold",
                  label: "Giặt sấy thông thường (Wash & Fold)",
                },
                {
                  value: "dry_clean",
                  label: "Giặt khô / Giặt hấp (Dry Clean)",
                },
                {
                  value: "heavy_items",
                  label: "Đồ cồng kềnh (Chăn, Drap, Rèm)",
                },
                {
                  value: "special_care",
                  label: "Chăm sóc đặc biệt (Vệ sinh giày/áo hiệu)",
                },
              ]}
              onChange={(e) =>
                setFormCategory(e.target.value as ServiceCategory)
              }
            />

            <InputSelect
              title="Quy chuẩn báo giá"
              value={formPricingType}
              options={[
                { value: "per_kg", label: "Báo giá theo Cân ký (KG)" },
                {
                  value: "per_item",
                  label: "Báo giá theo Chiếc / Bộ / Đôi",
                },
              ]}
              onChange={(e) =>
                setFormPricingType(e.target.value as PricingType)
              }
            />
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              title="Đơn giá bán (VNĐ)"
              required
              inputProps={{
                type: "number",
                value: String(formUnitPrice),
                onChange: (e: any) =>
                  setFormUnitPrice(Number(e.target.value)),
              }}
            />
            <InputText
              title="Tên đơn vị quy ước"
              placeholder="Ví dụ: kg, cái, bộ, đôi..."
              inputProps={{
                value: formUnitName,
                onChange: (e: any) => setFormUnitName(e.target.value),
              }}
            />
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              title="Thời gian hoàn thành (Đơn vị: Ngày)"
              inputProps={{
                type: "number",
                value: String(formDurationDays),
                onChange: (e: any) =>
                  setFormDurationDays(Number(e.target.value)),
              }}
            />
            <InputText
              title="Ký hiệu Icon (Shirt/Sparkles...)"
              placeholder="Shirt, Sparkles, BedDouble..."
              inputProps={{
                value: formIconName,
                onChange: (e: any) => setFormIconName(e.target.value),
              }}
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

          <InputArea
            title="Mô tả kỹ thuật quy trình giặt"
            rows={3}
            placeholder="Quy trình thực hiện, cam kết chất lượng..."
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
            label={editingService ? "Áp dụng cập nhật" : "Khởi tạo dịch vụ"}
            className="!w-auto !h-10 !px-6"
            textClassName="!text-xs"
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};
