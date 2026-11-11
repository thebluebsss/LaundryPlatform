import React, { useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import {
  X,
  Store,
  MapPin,
  Bike,
  Upload,
  FileCheck,
  Navigation,
  CreditCard,
} from "lucide-react";
import { User } from "../index";
import { HANOI_DISTRICTS } from "../../../../data";
import { InputText } from "../../../../components/InputText";
import { InputSelect } from "../../../../components/InputSelect";
import { GoogleMapCanvas } from "../../../../components/GoogleMapCanvas";

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (user: User & { password?: string }) => void;
}

export const UserFormModal = ({
  user,
  onClose,
  onSave,
}: UserFormModalProps) => {
  const normalizedInitialRole =
    user?.role === "store_manager"
      ? "store_owner"
      : user?.role === "shipper"
      ? "driver"
      : user?.role || "user";

  const initialDistrict =
    user?.storeDistrict &&
    HANOI_DISTRICTS.some((d) => d.name === user.storeDistrict)
      ? user.storeDistrict
      : HANOI_DISTRICTS[0].name;

  const [formData, setFormData] = useState<Partial<User>>({
    id: user?.id || "",
    username: user?.username || "",
    email: user?.email || "",
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    role: normalizedInitialRole,
    status: user?.status || "active",
    // Store Owner fields (Hà Nội)
    assignedStoreId: user?.assignedStoreId || "",
    storeName: user?.storeName || "",
    storeCode:
      user?.storeCode ||
      "STORE_HN_" + Math.random().toString(36).substring(2, 5).toUpperCase(),
    storeDistrict: initialDistrict,
    storeCity: "hanoi",
    storeLat: user?.storeLat ?? HANOI_DISTRICTS[0].lat,
    storeLng: user?.storeLng ?? HANOI_DISTRICTS[0].lng,
    openHours: user?.openHours || "06:30 - 22:00",
    priceRange: user?.priceRange || "15.000đ - 120.000đ",
    // Shipper fields
    vehicleType: user?.vehicleType || "bike",
    licensePlate: user?.licensePlate || "",
    idCardNumber: user?.idCardNumber || "",
    driverLicenseNumber: user?.driverLicenseNumber || "",
    driverLicenseImage: user?.driverLicenseImage || "",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLicenseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({
          ...prev,
          driverLicenseImage: reader.result as string,
        }));
        setErrors((prev) => ({ ...prev, driverLicenseImage: "" }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDistrictChange = (districtName: string) => {
    const matched = HANOI_DISTRICTS.find((d) => d.name === districtName);
    setFormData((prev) => ({
      ...prev,
      storeCity: "hanoi",
      storeDistrict: districtName,
      ...(matched
        ? {
            storeLat: matched.lat,
            storeLng: matched.lng,
          }
        : {}),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username?.trim())
      newErrors.username = "Tên đăng nhập không được để trống";

    if (!formData.email?.trim()) newErrors.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.fullName?.trim())
      newErrors.fullName = "Họ tên không được để trống";

    if (!formData.phoneNumber?.trim())
      newErrors.phoneNumber = "Số điện thoại liên hệ không được để trống";

    // Password validation for new users (or if admin typed a new password while editing)
    if (!user?.id) {
      if (!password.trim()) newErrors.password = "Mật khẩu không được để trống";
      else if (password.length < 6)
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

      if (password !== confirmPassword)
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    } else if (password.trim()) {
      if (password.length < 6)
        newErrors.password = "Mật khẩu mới phải có ít nhất 6 ký tự";
      if (password !== confirmPassword)
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    // Role-specific validation for Store Owner
    if (formData.role === "store_owner") {
      if (!formData.storeName?.trim()) {
        newErrors.storeName =
          "Vui lòng nhập tên cửa hàng giặt sấy của Đối tác";
      }
      if (!formData.address?.trim()) {
        newErrors.address =
          "Chủ tiệm giặt bắt buộc phải có địa chỉ chi tiết đầy đủ";
      }
      if (!formData.storeDistrict?.trim()) {
        newErrors.storeDistrict = "Vui lòng chọn Quận / Huyện của tiệm";
      }
      if (
        formData.storeLat === undefined ||
        formData.storeLng === undefined ||
        Number.isNaN(Number(formData.storeLat)) ||
        Number.isNaN(Number(formData.storeLng))
      ) {
        newErrors.storeCoords =
          "Vui lòng chấm chọn định vị tọa độ trên Google Maps";
      }
    }

    // Role-specific validation for Shipper / Driver
    if (formData.role === "driver") {
      if (!formData.idCardNumber?.trim()) {
        newErrors.idCardNumber = "Vui lòng nhập số CCCD / CMND của Shipper";
      }
      if (!formData.licensePlate?.trim()) {
        newErrors.licensePlate =
          "Vui lòng nhập biển số xe đăng ký giao nhận";
      }
      if (!formData.driverLicenseNumber?.trim()) {
        newErrors.driverLicenseNumber =
          "Vui lòng nhập số Giấy phép lái xe (GPLX)";
      }
      if (!formData.driverLicenseImage?.trim()) {
        newErrors.driverLicenseImage =
          "Vui lòng tải lên hoặc gắn ảnh chụp Bằng lái xe (GPLX) của Shipper";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...(formData as User),
        storeCity: "hanoi",
        ...(password.trim() ? { password: password.trim() } : {}),
      });
    }
  };

  return (
    <Box className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <Box className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <Box className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <Typography
              variant="h6"
              sx={{ fontSize: "18px", fontWeight: "bold" }}
            >
              {user?.id
                ? "Chỉnh Sửa Tài Khoản & Hồ Sơ Đối Tác (Hà Nội)"
                : "Thêm Tài Khoản / Cấp Quyền Đối Tác Mới (Hà Nội)"}
            </Typography>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn vai trò Chủ tiệm giặt hoặc Shipper để mở form thẩm định hồ sơ
              & định vị Google Maps tại Hà Nội ở phía dưới
            </p>
          </div>
          <Button
            onClick={onClose}
            sx={{
              minWidth: "auto",
              p: 1,
              borderRadius: "50%",
              color: "slate.500",
              "&:hover": { bgcolor: "slate.100" },
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* 1. Role Selection at Top */}
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <InputSelect
                title="Vai trò tài khoản / Đối tác (RBAC)"
                required
                value={formData.role}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as any,
                  })
                }
                options={[
                  { value: "user", label: "Khách hàng (User)" },
                  {
                    value: "store_owner",
                    label: "Chủ tiệm giặt (Đối tác Cửa hàng)",
                  },
                  {
                    value: "driver",
                    label: "Shipper / Tài xế giao nhận (Đối tác Tài xế)",
                  },
                  { value: "admin", label: "Quản trị viên (System Admin)" },
                ]}
              />

              <InputSelect
                title="Trạng thái kích hoạt"
                required
                value={formData.status}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                options={[
                  { value: "active", label: "Hoạt động (Đã duyệt)" },
                  { value: "inactive", label: "Vô hiệu hóa / Tạm khóa" },
                ]}
              />
            </Box>

            {/* 2. Basic Account Info */}
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputText
                title="Tên đăng nhập"
                required
                placeholder="VD: chutiem_caugiay hoặc shipper_minh"
                inputError={errors.username}
                inputProps={{
                  value: formData.username,
                  onChange: (e: any) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/\s/g, ""),
                    }),
                  disabled: !!user?.id,
                }}
              />

              <InputText
                title={
                  formData.role === "store_owner"
                    ? "Họ và tên Chủ tiệm giặt"
                    : formData.role === "driver"
                    ? "Họ và tên Đối tác Shipper"
                    : "Họ và tên"
                }
                required
                placeholder="Nguyễn Văn A"
                inputError={errors.fullName}
                inputProps={{
                  value: formData.fullName,
                  onChange: (e: any) =>
                    setFormData({ ...formData, fullName: e.target.value }),
                }}
              />
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputText
                title="Email liên hệ"
                required
                placeholder="email@example.com"
                inputError={errors.email}
                inputProps={{
                  type: "email",
                  value: formData.email,
                  onChange: (e: any) =>
                    setFormData({ ...formData, email: e.target.value }),
                }}
              />

              <InputText
                title="Số điện thoại"
                required
                placeholder="0912345678"
                inputError={errors.phoneNumber}
                inputProps={{
                  value: formData.phoneNumber,
                  onChange: (e: any) =>
                    setFormData({ ...formData, phoneNumber: e.target.value }),
                }}
              />
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputText
                title={
                  user?.id
                    ? "Đổi mật khẩu mới (Để trống nếu giữ nguyên)"
                    : "Mật khẩu bàn giao"
                }
                required={!user?.id}
                placeholder="Tối thiểu 6 ký tự"
                inputError={errors.password}
                inputProps={{
                  type: "password",
                  value: password,
                  onChange: (e: any) => setPassword(e.target.value),
                }}
              />

              <InputText
                title="Xác nhận mật khẩu"
                required={!user?.id || !!password}
                placeholder="Nhập lại mật khẩu"
                inputError={errors.confirmPassword}
                inputProps={{
                  type: "password",
                  value: confirmPassword,
                  onChange: (e: any) => setConfirmPassword(e.target.value),
                }}
              />
            </Box>

            {formData.role !== "store_owner" && (
              <InputText
                title="Địa chỉ liên hệ / Khu vực hoạt động tại Hà Nội"
                placeholder="Số 25 Kim Mã, Quận Ba Đình, Hà Nội"
                inputError={errors.address}
                inputProps={{
                  value: formData.address,
                  onChange: (e: any) =>
                    setFormData({ ...formData, address: e.target.value }),
                }}
              />
            )}

            {/* 3A. CONDITIONAL SECTION: STORE OWNER (CHỦ TIỆM GIẶT) */}
            {formData.role === "store_owner" && (
              <Box className="p-5 rounded-3xl bg-blue-50/60 border-2 border-blue-200 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-blue-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        Hồ Sơ Cửa Hàng Giặt Sấy & Định Vị Google Maps (Khu Vực Hà Nội)
                      </div>
                      <p className="text-xs text-slate-600">
                        Chọn Quận/Huyện trong danh sách và chấm vị trí chính xác
                        trên bản đồ Google Maps để hiển thị lên Web & App
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                    Đối tác Chủ tiệm
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <InputText
                      title="Tên cửa hàng / Chi nhánh giặt sấy"
                      required
                      placeholder="VD: Tiệm Giặt Sấy Sạch Sẽ Cầu Giấy"
                      inputError={errors.storeName}
                      inputProps={{
                        value: formData.storeName,
                        onChange: (e: any) =>
                          setFormData({
                            ...formData,
                            storeName: e.target.value,
                          }),
                      }}
                    />
                  </div>
                  <InputText
                    title="Mã chi nhánh (Store Code)"
                    required
                    placeholder="STORE_HN_CG"
                    inputProps={{
                      value: formData.storeCode,
                      onChange: (e: any) =>
                        setFormData({
                          ...formData,
                          storeCode: e.target.value.toUpperCase(),
                        }),
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <InputSelect
                      title="Chọn Quận / Huyện tại Hà Nội (Chọn trong danh sách)"
                      required
                      value={formData.storeDistrict || HANOI_DISTRICTS[0].name}
                      options={HANOI_DISTRICTS.map((d) => ({
                        value: d.name,
                        label: `${d.name} - TP. Hà Nội`,
                      }))}
                      onChange={(e: any) => handleDistrictChange(e.target.value)}
                    />
                  </div>

                  <InputText
                    title="Khung giờ mở cửa"
                    placeholder="06:30 - 22:00"
                    inputProps={{
                      value: formData.openHours,
                      onChange: (e: any) =>
                        setFormData({ ...formData, openHours: e.target.value }),
                    }}
                  />
                </div>

                <InputText
                  title="Địa chỉ chi tiết của tiệm giặt trên bản đồ (Số nhà, ngõ, tên phố/đường, phường)"
                  required
                  placeholder="VD: Số 165 Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội"
                  inputError={errors.address}
                  startAdornment={<MapPin className="w-4 h-4 text-blue-600" />}
                  inputProps={{
                    value: formData.address,
                    onChange: (e: any) =>
                      setFormData({ ...formData, address: e.target.value }),
                  }}
                />

                {/* Interactive Google Map Picker */}
                <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-blue-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      <span>
                        Định vị tọa độ cửa hàng trên Google Maps Hà Nội (Click
                        trực tiếp lên bản đồ để ghim vị trí tiệm)
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      Lat: {Number(formData.storeLat ?? 21.0285).toFixed(4)} ·
                      Lng: {Number(formData.storeLng ?? 105.8542).toFixed(4)}
                    </span>
                  </div>

                  <GoogleMapCanvas
                    center={{
                      lat: Number(formData.storeLat ?? 21.0285),
                      lng: Number(formData.storeLng ?? 105.8542),
                    }}
                    pickedCoords={{
                      lat: Number(formData.storeLat ?? 21.0285),
                      lng: Number(formData.storeLng ?? 105.8542),
                    }}
                    onPickLocation={(lat, lng) =>
                      setFormData({
                        ...formData,
                        storeLat: Number(lat.toFixed(6)),
                        storeLng: Number(lng.toFixed(6)),
                      })
                    }
                    zoom={15}
                    heightClassName="h-[260px]"
                    showRouteToSelected={false}
                  />

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <InputText
                      title="Vĩ độ GPS (Latitude)"
                      required
                      inputProps={{
                        type: "number",
                        step: "0.0001",
                        value: String(formData.storeLat ?? 21.0285),
                        onChange: (e: any) =>
                          setFormData({
                            ...formData,
                            storeLat: Number(e.target.value),
                          }),
                      }}
                    />
                    <InputText
                      title="Kinh độ GPS (Longitude)"
                      required
                      inputProps={{
                        type: "number",
                        step: "0.0001",
                        value: String(formData.storeLng ?? 105.8542),
                        onChange: (e: any) =>
                          setFormData({
                            ...formData,
                            storeLng: Number(e.target.value),
                          }),
                      }}
                    />
                  </div>
                  {errors.storeCoords && (
                    <p className="text-xs font-bold text-rose-600">
                      {errors.storeCoords}
                    </p>
                  )}
                </div>
              </Box>
            )}

            {/* 3B. CONDITIONAL SECTION: SHIPPER / DRIVER */}
            {formData.role === "driver" && (
              <Box className="p-5 rounded-3xl bg-emerald-50/60 border-2 border-emerald-200 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-emerald-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        Hồ Sơ Thẩm Định Shipper Giao Nhận & Bằng Lái Xe (Bắt buộc)
                      </div>
                      <p className="text-xs text-slate-600">
                        Xác minh CCCD, biển số phương tiện và lưu trữ ảnh chụp
                        Giấy phép lái xe (GPLX) của Shipper
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                    Đối tác Shipper
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputText
                    title="Số CCCD / CMND định danh"
                    required
                    placeholder="VD: 001098001234"
                    inputError={errors.idCardNumber}
                    startAdornment={
                      <CreditCard className="w-4 h-4 text-slate-400" />
                    }
                    inputProps={{
                      value: formData.idCardNumber,
                      onChange: (e: any) =>
                        setFormData({
                          ...formData,
                          idCardNumber: e.target.value,
                        }),
                    }}
                  />

                  <InputText
                    title="Số Giấy phép lái xe (GPLX)"
                    required
                    placeholder="VD: 010123456789 (Hạng A1/A2/B2)"
                    inputError={errors.driverLicenseNumber}
                    startAdornment={
                      <FileCheck className="w-4 h-4 text-slate-400" />
                    }
                    inputProps={{
                      value: formData.driverLicenseNumber,
                      onChange: (e: any) =>
                        setFormData({
                          ...formData,
                          driverLicenseNumber: e.target.value,
                        }),
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputSelect
                    title="Loại phương tiện giao nhận"
                    required
                    value={formData.vehicleType || "bike"}
                    options={[
                      {
                        value: "bike",
                        label: "Xe máy 2 bánh (Có giá chở túi giặt chuyên dụng)",
                      },
                      {
                        value: "van",
                        label: "Xe tải Van (Vận chuyển đơn sỉ / khách sạn)",
                      },
                    ]}
                    onChange={(e: any) =>
                      setFormData({
                        ...formData,
                        vehicleType: e.target.value as "bike" | "van",
                      })
                    }
                  />

                  <InputText
                    title="Biển kiểm soát phương tiện"
                    required
                    placeholder="VD: 29-B1 686.88"
                    inputError={errors.licensePlate}
                    inputProps={{
                      value: formData.licensePlate,
                      onChange: (e: any) =>
                        setFormData({
                          ...formData,
                          licensePlate: e.target.value.toUpperCase(),
                        }),
                    }}
                  />
                </div>

                {/* Driver License Image Upload & Preview */}
                <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-black text-slate-800">
                        Ảnh chụp Bằng lái xe (GPLX) & Đăng ký xe *
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Tải ảnh chụp thực tế từ máy tính hoặc dán đường dẫn ảnh
                        hồ sơ GPLX
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh GPLX từ máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLicenseImageUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            driverLicenseImage:
                              "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
                          });
                          setErrors((prev) => ({
                            ...prev,
                            driverLicenseImage: "",
                          }));
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                      >
                        Ảnh mẫu đối chiếu
                      </button>
                    </div>
                  </div>

                  <InputText
                    title="Hoặc nhập URL ảnh chụp Bằng lái xe"
                    placeholder="https://..."
                    inputError={errors.driverLicenseImage}
                    inputProps={{
                      value: formData.driverLicenseImage,
                      onChange: (e: any) =>
                        setFormData({
                          ...formData,
                          driverLicenseImage: e.target.value,
                        }),
                    }}
                  />

                  {formData.driverLicenseImage && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <img
                        src={formData.driverLicenseImage}
                        alt="Ảnh chụp GPLX Shipper"
                        className="w-28 h-20 object-cover rounded-lg border border-slate-300 shrink-0"
                      />
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-emerald-700 flex items-center gap-1">
                          <FileCheck className="w-4 h-4" />
                          <span>Đã đính kèm ảnh chụp Bằng lái xe (GPLX)</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Số GPLX:{" "}
                          <strong>
                            {formData.driverLicenseNumber || "Chưa nhập"}
                          </strong>{" "}
                          · Biển số:{" "}
                          <strong>
                            {formData.licensePlate || "Chưa nhập"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Box>
            )}

            <Stack direction="row" spacing={2} className="pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Hủy Bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                  bgcolor:
                    formData.role === "store_owner"
                      ? "blue.600"
                      : formData.role === "driver"
                      ? "emerald.600"
                      : "blue.600",
                  "&:hover": {
                    bgcolor:
                      formData.role === "store_owner"
                        ? "blue.700"
                        : formData.role === "driver"
                        ? "emerald.700"
                        : "blue.700",
                  },
                }}
              >
                {user?.id
                  ? "Lưu Cập Nhật Hồ Sơ"
                  : formData.role === "store_owner"
                  ? "Cấp Tài Khoản Chủ Tiệm & Ghim Google Maps"
                  : formData.role === "driver"
                  ? "Cấp Tài Khoản Đối Tác Shipper"
                  : "Thêm Tài Khoản Mới"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};
