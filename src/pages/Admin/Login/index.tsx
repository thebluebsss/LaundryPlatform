import React from 'react';
import { useAdminLogin } from './hook';
import { useNavigate } from 'react-router-dom';
import { LoginFormCard } from './components/LoginFormCard';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const {
    username,
    setUsername,
    password,
    setPassword,
    errorMsg,
    handleAdminAuth
  } = useAdminLogin();

  return (
    <div className="min-h-[500px] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 rounded-3xl border border-slate-100 my-4">
      <LoginFormCard
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        errorMsg={errorMsg}
        onSubmit={handleAdminAuth}
        onBack={() => navigate('/')}
      />
    </div>
  );
};
