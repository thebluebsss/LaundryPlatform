import React, { useState } from "react";
import { X, Camera, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { aiAPI } from "../../../../services/api";
import { GarmentInspectionResult } from "../../../../types";
import { ButtonCustom, ButtonOutLine } from "../../../../components/ButtonCustom";
import { InputText } from "../../../../components/InputText";
import { useToast } from "../../../../components/Toast";

interface AiFabricScannerModalProps {
  isOpen: boolean;
  declaredServiceName: string;
  onClose: () => void;
  onApplyAiResult: (result: GarmentInspectionResult) => void;
}

const SAMPLE_GARMENT_PRESETS = [
  {
    label: "Áo sơ mi Lụa Tơ Tằm (Silk 100%)",
    itemName: "Áo sơ mi lụa tơ tằm trắng",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Áo khoác Dạ / Len Cashmere",
    itemName: "Áo khoác dạ lông cừu",
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Quần áo Cotton mặc hàng ngày",
    itemName: "Áo thun và quần cotton hỗn hợp",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  },
];

export const AiFabricScannerModal: React.FC<AiFabricScannerModalProps> = ({
  isOpen,
  declaredServiceName,
  onClose,
  onApplyAiResult,
}) => {
  const { showToast } = useToast();
  const [itemName, setItemName] = useState("Áo sơ mi lụa tơ tằm trắng");
  const [imagePreview, setImagePreview] = useState(
    SAMPLE_GARMENT_PRESETS[0].image
  );
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<GarmentInspectionResult | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunScan = async () => {
    setScanning(true);
    try {
      const res = await aiAPI.inspectGarment({
        image: imagePreview,
        declaredService: declaredServiceName,
        itemName,
      });
      const inspection = res.data?.data as GarmentInspectionResult;
      setResult(inspection);
      showToast("AI đã phân tích xong chất liệu vải & nhãn mác!", "success");
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Lỗi khi phân tích hình ảnh món đồ",
        "error"
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-2xl border border-slate-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900">
                AI Kiểm Tra Chất Liệu Vải & Nhãn Mác
              </h3>
              <p className="text-[11px] text-slate-500">
                Bước tự chọn (opt) trong Sequence Diagram Đặt Đơn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sample Garment Selector or Camera Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Chọn mẫu thử nhanh hoặc tải ảnh chụp món đồ / tem mác:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_GARMENT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setItemName(preset.itemName);
                  setImagePreview(preset.image);
                  setResult(null);
                }}
                className={`p-2 rounded-xl border text-left text-[11px] font-bold transition-colors cursor-pointer ${
                  itemName === preset.itemName
                    ? "border-indigo-600 bg-indigo-50/60 text-indigo-900"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-36 bg-slate-100">
            <img
              src={imagePreview}
              alt={itemName}
              className="w-full h-full object-cover"
            />
            <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-slate-900/80 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-900">
              <Camera className="w-3.5 h-3.5" />
              <span>Chụp / Đổi ảnh</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-3">
            <InputText
              title="Tên hoặc mô tả món đồ"
              inputProps={{
                value: itemName,
                onChange: (e) => setItemName(e.target.value),
              }}
            />
            <ButtonCustom
              type="button"
              loading={scanning}
              onClick={handleRunScan}
              iconStart={<Sparkles className="w-4 h-4" />}
              label="Phân Tích Bằng AI Ngay"
              className="!h-10 !text-xs"
              textClassName="!text-xs"
            />
          </div>
        </div>

        {/* AI Result Panel */}
        {result && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-indigo-950 flex items-center gap-1.5">
                {result.isDiscrepancy ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Kết quả nhận diện: {result.detectedFabric}</span>
              </span>
              <span className="font-mono font-bold text-indigo-700">
                Độ tin cậy: {Math.round(result.confidence * 100)}%
              </span>
            </div>

            {result.warningMessage && (
              <p className="text-amber-800 bg-amber-100/80 p-2.5 rounded-xl font-semibold leading-relaxed">
                {result.warningMessage}
              </p>
            )}

            <div className="text-slate-700 space-y-1">
              <div>
                • <strong>Gói khuyến nghị:</strong>{" "}
                <span className="text-blue-700 font-bold">
                  {result.recommendedServiceName}
                </span>{" "}
                (
                <span className="font-mono">
                  {result.suggestedUnitPrice.toLocaleString("vi-VN")}đ
                </span>
                )
              </div>
              <div>
                • <strong>Hướng dẫn bảo quản:</strong>{" "}
                {result.careInstructions.join(" · ")}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <ButtonCustom
                type="button"
                onClick={() => {
                  onApplyAiResult(result);
                  onClose();
                }}
                label="Áp Dụng Vào Dòng Đồ Này"
                className="!h-10 !text-xs"
                textClassName="!text-xs"
              />
              <ButtonOutLine
                type="button"
                onClick={onClose}
                label="Đóng"
                className="!h-10 !w-28 !text-xs"
                textClassName="!text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
