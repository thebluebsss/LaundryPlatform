import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UserPlus,
  LogIn,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "../../components/Toast";
import { useLoading } from "../../context/LoadingContext";
import { Stack, Box, Typography, Button } from "@mui/material";
import { InputText } from "../../components/InputText";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập phải chứa tối thiểu 3 ký tự")
    .max(30, "Tên đăng nhập chứa tối đa 30 ký tự")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ chứa chữ cái, chữ số và dấu gạch dưới (không chứa khoảng trắng)",
    ),
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Địa chỉ email không đúng định dạng (Ví dụ: user@gmail.com)"),
  password: z.string().min(6, "Mật khẩu bảo mật phải từ 6 ký tự trở lên"),
  fullName: z
    .string()
    .min(1, "Vui lòng nhập họ và tên của bạn")
    .min(2, "Họ và tên quá ngắn"),
  phone: z
    .string()
    .regex(
      /^(0)[35789][0-9]{8}$/,
      "Số điện thoại Việt Nam không hợp lệ (Mẫu 10 số bắt đầu bằng 03,05,07,08,09)",
    ),
  address: z.string().optional(),
});

const loginFormSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập hoặc email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;
type LoginFormData = z.infer<typeof loginFormSchema>;

export const UserAuth = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { setLoading: setGlobalLoading } = useLoading();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoadingState] = useState(false);
  
  const setLoading = (val: boolean) => {
    setLoadingState(val);
    setGlobalLoading(val);
  };

  // Get redirect path from query parameter
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirect") || "/";

  // React Hook Form for Registration
  const {
    register: rhfRegister,
    handleSubmit: rhfHandleSubmit,
    formState: { errors: registerErrors },
    setError: setRegisterError,
    clearErrors: clearRegisterErrors,
    setValue,
    getValues,
    reset,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      address: "",
    },
  });

  // React Hook Form for Login
  const {
    register: loginRegister,
    handleSubmit: loginHandleSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const checkDuplicateField = async (
    field: "username" | "email" | "phone",
    value: string,
  ) => {
    if (!value) return false;
    try {
      const res = await fetch(
        `/api/auth/check-duplicate?field=${field}&value=${encodeURIComponent(value)}`,
      );
      const data = await res.json();
      return data.success && data.duplicated;
    } catch (err) {
      console.error("Error checking duplicate:", err);
      return false;
    }
  };

  const handleBlurCheck = async (field: "username" | "email" | "phone") => {
    const val = getValues(field);
    const isValid = await trigger(field);
    if (isValid && val) {
      const isDup = await checkDuplicateField(field, val);
      if (isDup) {
        setRegisterError(field, {
          type: "manual",
          message:
            field === "username"
              ? "Tên đăng nhập đã được sử dụng!"
              : field === "email"
                ? "Địa chỉ Email đã được sử dụng!"
                : "Số điện thoại đã được đăng ký sử dụng!",
        });
      } else {
        clearRegisterErrors(field);
      }
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.username.includes("@") ? data.username : undefined,
          username: !data.username.includes("@") ? data.username : undefined,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem("sachse_user_token", result.data.token);
        localStorage.setItem(
          "sachse_user_profile",
          JSON.stringify(result.data.user),
        );

        showToast(
          `Chào mừng quay trở lại, ${result.data.user.fullName || result.data.user.username}!`,
          "success",
        );

        window.dispatchEvent(new Event("storage"));

        navigate(redirectTo);
      } else {
        showToast(
          result.message ||
            "Tài khoản hoặc mật khẩu chưa chính xác. Vui lòng thử lại!",
          "error",
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("Lỗi kết nối máy chủ dữ liệu. Vui lòng thử lại sau!", "error");
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const [usrDup, emailDup, phoneDup] = await Promise.all([
        checkDuplicateField("username", data.username),
        checkDuplicateField("email", data.email),
        checkDuplicateField("phone", data.phone),
      ]);

      let hasError = false;
      if (usrDup) {
        setRegisterError("username", {
          type: "manual",
          message: "Tên đăng nhập đã được sử dụng!",
        });
        hasError = true;
      }
      if (emailDup) {
        setRegisterError("email", {
          type: "manual",
          message: "Địa chỉ Email đã được sử dụng!",
        });
        hasError = true;
      }
      if (phoneDup) {
        setRegisterError("phone", {
          type: "manual",
          message: "Số điện thoại đã được đăng ký sử dụng!",
        });
        hasError = true;
      }

      if (hasError) {
        showToast(
          "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin trùng lặp!",
          "error",
        );
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast(
          "Chúc mừng bạn đăng ký tài khoản thành công! Thử đăng nhập ngay nhé.",
          "success",
        );
        setActiveTab("login");
        reset();
      } else {
        showToast(
          result.message ||
            "Đăng ký thất bại. Tên tài khoản hoặc Email đã tồn tại!",
          "error",
        );
      }
    } catch (error) {
      console.error("Register error:", error);
      showToast("Lỗi kết nối máy chủ dữ liệu. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  const regUsername = rhfRegister("username");
  const regEmail = rhfRegister("email");
  const regPassword = rhfRegister("password");
  const regFullName = rhfRegister("fullName");
  const regPhone = rhfRegister("phone");
  const regAddress = rhfRegister("address");

  return (
    <Box className="max-w-md mx-auto my-8 animate-in fade-in duration-300 px-4 sm:px-0">
      <Box className="bg-white border border-slate-105 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <Box className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all duration-300 bg-blue-505/5" />
        <Box className="absolute bottom-0 left-0 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-all duration-300 bg-indigo-505/5" />

        <Stack spacing={4}>
          <Box className="text-center space-y-2">
            <Box className="inline-flex w-12 h-12 items-center justify-center rounded-2xl transition-all duration-300 bg-blue-50 text-blue-600">
              {activeTab === "login" ? (
                <LogIn className="w-6 h-6 animate-pulse" />
              ) : (
                <UserPlus className="w-6 h-6 animate-pulse" />
              )}
            </Box>

            <Typography
              variant="h5"
              className="font-bold text-slate-900 tracking-tight"
              sx={{ fontWeight: 700 }}
            >
              {activeTab === "login"
                ? "Đăng Nhập Khách Hàng"
                : "Đăng Ký Thành Viên"}
            </Typography>

            <Typography
              variant="caption"
              className="text-slate-500 leading-normal block"
            >
              {activeTab === "login"
                ? "Để tiện giám sát quy trình giặt, liên lạc shipper và lưu hóa đơn"
                : "Gia nhập hệ thống Giặt Là Sạch Sẽ để nhận nhiều khuyến mại độc quyền"}
            </Typography>
          </Box>

          <Box className="flex bg-slate-100 p-1 rounded-2xl gap-1">
            <Button
              onClick={() => {
                setActiveTab("login");
                setShowPassword(false);
              }}
              fullWidth
              variant="text"
              sx={{
                py: 1.2,
                fontSize: "12px",
                fontWeight: "bold",
                borderRadius: "12px",
                textTransform: "none",
                bgcolor: activeTab === "login" ? "#ffffff" : "transparent",
                color: activeTab === "login" ? "primary.main" : "slate.500",
                boxShadow:
                  activeTab === "login"
                    ? "0 1px 3px 0 rgba(0,0,0,0.05)"
                    : "none",
                "&:hover": {
                  bgcolor: activeTab === "login" ? "#ffffff" : "slate-200",
                },
              }}
            >
              Đăng Nhập
            </Button>
            <Button
              onClick={() => {
                setActiveTab("register");
                setShowPassword(false);
              }}
              fullWidth
              variant="text"
              sx={{
                py: 1.2,
                fontSize: "12px",
                fontWeight: "bold",
                borderRadius: "12px",
                textTransform: "none",
                bgcolor: activeTab === "register" ? "#ffffff" : "transparent",
                color: activeTab === "register" ? "primary.main" : "slate.500",
                boxShadow:
                  activeTab === "register"
                    ? "0 1px 3px 0 rgba(0,0,0,0.05)"
                    : "none",
                "&:hover": {
                  bgcolor: activeTab === "register" ? "#ffffff" : "slate-200",
                },
              }}
            >
              Đăng Ký Mới
            </Button>
          </Box>

          {activeTab === "login" ? (
            <Box component="form" onSubmit={loginHandleSubmit(handleLogin)}>
              <Stack spacing={3}>
                <InputText
                  title="Tên tài khoản hoặc Email"
                  required
                  placeholder="Nhập username hoặc email@gmail.com"
                  startAdornment={<User className="w-4 h-4 text-slate-400" />}
                  inputError={loginErrors.username?.message}
                  inputProps={{
                    type: "text",
                    ...loginRegister("username"),
                  }}
                />

                <InputText
                  title="Mật khẩu bảo mật"
                  required
                  placeholder="Tối thiểu 6 ký tự bảo mật"
                  startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
                  inputError={loginErrors.password?.message}
                  endAdornment={
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{
                        p: 0,
                        minWidth: "auto",
                        color: "slate.400",
                        "&:hover": {
                          bgcolor: "transparent",
                          color: "slate.650",
                        },
                      }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  }
                  inputProps={{
                    type: showPassword ? "text" : "password",
                    ...loginRegister("password"),
                  }}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1.5,
                    borderRadius: "12px",
                    fontWeight: "bold",
                    textTransform: "none",
                    bgcolor: "primary.main",
                    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                  startIcon={<LogIn className="w-4 h-4" />}
                >
                  {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP KHÁCH HÀNG"}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={rhfHandleSubmit(onRegisterSubmit)}>
              <Stack spacing={2.5}>
                <Box className="grid grid-cols-2 gap-3">
                  <InputText
                    title="Tên đăng nhập"
                    required
                    placeholder="Ví dụ: longtran"
                    inputError={registerErrors.username?.message}
                    inputProps={{
                      type: "text",
                      name: regUsername.name,
                      ref: regUsername.ref,
                      onChange: (e: any) => {
                        const sanitized = e.target.value
                          .toLowerCase()
                          .replace(/\s/g, "");
                        setValue("username", sanitized, {
                          shouldValidate: true,
                        });
                      },
                      onBlur: (e: any) => {
                        regUsername.onBlur(e);
                        handleBlurCheck("username");
                      },
                    }}
                  />

                  <InputText
                    title="Địa chỉ Email"
                    required
                    placeholder="long@gmail.com"
                    inputError={registerErrors.email?.message}
                    inputProps={{
                      type: "email",
                      name: regEmail.name,
                      ref: regEmail.ref,
                      onChange: regEmail.onChange,
                      onBlur: (e: any) => {
                        regEmail.onBlur(e);
                        handleBlurCheck("email");
                      },
                    }}
                  />
                </Box>

                <InputText
                  title="Chọn mật khẩu bảo vệ"
                  required
                  placeholder="Nhập 6 ký tự bảo mật trở lên"
                  startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
                  inputError={registerErrors.password?.message}
                  endAdornment={
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{
                        p: 0,
                        minWidth: "auto",
                        color: "slate.400",
                        "&:hover": {
                          bgcolor: "transparent",
                          color: "slate.650",
                        },
                      }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  }
                  inputProps={{
                    type: showPassword ? "text" : "password",
                    name: regPassword.name,
                    ref: regPassword.ref,
                    onChange: regPassword.onChange,
                    onBlur: regPassword.onBlur,
                  }}
                />

                <InputText
                  title="Họ và Tên thành viên"
                  required
                  placeholder="Ví dụ: Trần Văn Long"
                  startAdornment={<User className="w-4 h-4 text-slate-400" />}
                  inputError={registerErrors.fullName?.message}
                  inputProps={{
                    type: "text",
                    name: regFullName.name,
                    ref: regFullName.ref,
                    onChange: regFullName.onChange,
                    onBlur: regFullName.onBlur,
                  }}
                />

                <InputText
                  title="Số điện thoại liên lạc"
                  required
                  placeholder="Ví dụ: 0987342615"
                  startAdornment={<Phone className="w-4 h-4 text-slate-400" />}
                  inputError={registerErrors.phone?.message}
                  inputProps={{
                    type: "tel",
                    name: regPhone.name,
                    ref: regPhone.ref,
                    onChange: regPhone.onChange,
                    onBlur: (e: any) => {
                      regPhone.onBlur(e);
                      handleBlurCheck("phone");
                    },
                  }}
                />

                <InputText
                  title="Địa chỉ giao nhận đồ mặc định"
                  placeholder="Ví dụ: Shophouse 03, Toà S2.12 Vinhomes Ocean Park"
                  startAdornment={<MapPin className="w-4 h-4 text-slate-400" />}
                  inputError={registerErrors.address?.message}
                  inputProps={{
                    type: "text",
                    name: regAddress.name,
                    ref: regAddress.ref,
                    onChange: regAddress.onChange,
                    onBlur: regAddress.onBlur,
                  }}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1.5,
                    borderRadius: "12px",
                    fontWeight: "bold",
                    textTransform: "none",
                    bgcolor: "primary.main",
                    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                  startIcon={<UserPlus className="w-4 h-4" />}
                >
                  {loading ? "ĐANG TẠO TÀI KHẢN..." : "HOÀN TẤT ĐĂNG KÝ"}
                </Button>
              </Stack>
            </Box>
          )}

          <Box className="border-t border-slate-105 pt-4 text-center">
            <Typography
              variant="caption"
              className="text-slate-400 flex items-center justify-center gap-1 leading-normal block"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Giặt Là Sạch Sẽ bảo mật thông tin & lịch vụ của bạn tuyệt đối 100%
            </Typography>

            <Box className="mt-3 pt-3 border-t border-slate-100">
              <Typography
                variant="caption"
                className="text-slate-500 block mb-2"
              >
                Bạn là quản trị viên hệ thống?
              </Typography>
              <Button
                onClick={() => navigate("/admin/login")}
                variant="text"
                sx={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  textTransform: "none",
                  color: "indigo.600",
                  "&:hover": {
                    bgcolor: "indigo.50",
                  },
                }}
              >
                Đăng nhập trang quản trị →
              </Button>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
