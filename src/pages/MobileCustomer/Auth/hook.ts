import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../../components/Toast";
import { setScopedSession } from "../../../utils/authStorage";

export interface CustomerRegisterFormState {
  username: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

export const useMobileCustomerAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirect") || "/mobile-customer/home";

  const [replaySplash, setReplaySplash] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regForm, setRegForm] = useState<CustomerRegisterFormState>({
    username: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    password: "",
  });

  // Forgot Password state (Step 1: Send OTP -> Step 2: Verify OTP & Reset Password)
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [fallbackOtpHint, setFallbackOtpHint] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      showToast(
        "Vui lòng nhập tên đăng nhập/email/SĐT và mật khẩu!",
        "warning"
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const loggedUser = result.data.user;
        const normalizedRole =
          loggedUser.role === "store_manager"
            ? "store_owner"
            : loggedUser.role === "shipper"
              ? "driver"
              : loggedUser.role || "user";

        if (normalizedRole !== "user") {
          showToast(
            "Đây là App Khách Hàng. Tài khoản Tài xế/Chủ tiệm vui lòng đăng nhập đúng ứng dụng tương ứng!",
            "error"
          );
          setLoading(false);
          return;
        }

        loggedUser.role = "user";
        setScopedSession("customer", result.data.token, loggedUser);
        showToast(
          `Xin chào ${loggedUser.fullName || loggedUser.username}! Chào mừng bạn đến với App Sạch Sẽ.`,
          "success"
        );
        navigate(redirectTo, { replace: true });
      } else {
        showToast(
          result.message || "Tài khoản hoặc mật khẩu không chính xác!",
          "error"
        );
      }
    } catch {
      showToast("Lỗi kết nối máy chủ. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !regForm.username.trim() ||
      !regForm.fullName.trim() ||
      !regForm.phone.trim() ||
      !regForm.email.trim() ||
      regForm.password.length < 6
    ) {
      showToast(
        "Vui lòng điền đầy đủ thông tin và mật khẩu tối thiểu 6 ký tự!",
        "warning"
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...regForm,
          username: regForm.username.trim().toLowerCase(),
          role: "user",
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const loggedUser = { ...result.data.user, role: "user" };
        setScopedSession("customer", result.data.token, loggedUser);
        showToast(
          "Đăng ký tài khoản Khách hàng thành công! Đang vào Trang chủ...",
          "success"
        );
        navigate("/mobile-customer/home", { replace: true });
      } else {
        showToast(
          result.message || "Đăng ký thất bại, vui lòng kiểm tra lại!",
          "error"
        );
      }
    } catch {
      showToast("Lỗi kết nối máy chủ khi đăng ký!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast("Vui lòng nhập địa chỉ Email đã đăng ký!", "warning");
      return;
    }
    setLoading(true);
    setFallbackOtpHint(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const data = result.data || {};
        if (data.email) {
          setForgotEmail(data.email);
        }
        if (data.devOtp) {
          setFallbackOtpHint(String(data.devOtp));
          setForgotOtp(String(data.devOtp));
        }
        showToast(
          data.message ||
            result.message ||
            "Đã gửi mã xác nhận OTP tới email của bạn!",
          "success"
        );
        setForgotStep(2);
      } else {
        showToast(
          result.message || "Không tìm thấy tài khoản với Email này!",
          "error"
        );
      }
    } catch {
      showToast("Không thể kết nối máy chủ để gửi mã OTP!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      showToast("Vui lòng nhập đúng mã OTP gồm 6 chữ số!", "warning");
      return;
    }
    if (forgotNewPassword.length < 6) {
      showToast("Mật khẩu mới phải có tối thiểu 6 ký tự!", "warning");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      showToast("Mật khẩu xác nhận không khớp!", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        showToast(
          result.data?.message ||
            "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.",
          "success"
        );
        setLoginUsername(forgotEmail.trim());
        setLoginPassword("");
        setForgotStep(1);
        setForgotOtp("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setFallbackOtpHint(null);
        setMode("login");
      } else {
        showToast(
          result.message || "Mã OTP không hợp lệ hoặc đã hết hạn!",
          "error"
        );
      }
    } catch {
      showToast("Lỗi kết nối máy chủ khi đặt lại mật khẩu!", "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    replaySplash,
    setReplaySplash,
    mode,
    setMode,
    showPassword,
    setShowPassword,
    loading,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    regForm,
    setRegForm,
    forgotStep,
    setForgotStep,
    forgotEmail,
    setForgotEmail,
    forgotOtp,
    setForgotOtp,
    forgotNewPassword,
    setForgotNewPassword,
    forgotConfirmPassword,
    setForgotConfirmPassword,
    fallbackOtpHint,
    handleLogin,
    handleRegister,
    handleSendOtp,
    handleResetPassword,
  };
};
