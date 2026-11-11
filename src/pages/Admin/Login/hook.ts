import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sachse_admin_token');
    if (token) {
      setIsLogged(true);
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'admin123') {
      localStorage.setItem('sachse_admin_token', 'activated');
      setErrorMsg('');
      navigate('/admin/dashboard');
    } else {
      setErrorMsg('Tài khoản mật khẩu quản trị viên chưa chính xác.');
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    errorMsg,
    handleAdminAuth,
    isLogged
  };
};
