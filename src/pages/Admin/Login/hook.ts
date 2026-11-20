import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../../services/api";
import { getScopedToken, setScopedSession } from "../../../utils/authStorage";

export const useAdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const token = getScopedToken("admin");
    if (token) {
      setIsLogged(true);
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authAPI.login(username.trim(), password.trim());
      const { token, user } = res.data?.data || {};
      if (token && user?.role === "admin") {
        setScopedSession("admin", token, user);
        setErrorMsg("");
        navigate("/admin/dashboard");
      } else {
        setErrorMsg("Tài khoản không có quyền Quản trị viên.");
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          "Tài khoản mật khẩu quản trị viên chưa chính xác."
      );
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    errorMsg,
    handleAdminAuth,
    isLogged,
  };
};
