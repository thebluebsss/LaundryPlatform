import React from 'react';
import { KeyRound, UserSquare2, Lock, HelpCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Stack, Box, Typography, Button } from '@mui/material';
import { InputText } from '../../../../components/InputText';

interface LoginFormCardProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  errorMsg: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const LoginFormCard: React.FC<LoginFormCardProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  errorMsg,
  onSubmit,
  onBack
}) => {
  return (
    <Box 
      id="admin-login-card" 
      className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 relative animate-in fade-in zoom-in-95 duration-200"
    >
      <Stack spacing={4}>
        {/* Back link */}
        <Box>
          <Button
            onClick={onBack}
            variant="text"
            sx={{
              p: 0,
              fontSize: '11px',
              fontWeight: 800,
              color: 'slate.400',
              textTransform: 'none',
              minWidth: 'auto',
              justifyContent: 'flex-start',
              '&:hover': {
                color: 'slate.600',
                bgcolor: 'transparent'
              }
            }}
            startIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="cursor-pointer"
          >
            Về trang chủ
          </Button>
        </Box>

        <Box className="text-center space-y-2">
          <Box className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-slate-900/20">
            <KeyRound className="w-7 h-7" />
          </Box>
          <Typography variant="h5" className="font-black text-slate-900 text-xl font-sans" sx={{ fontWeight: 900 }}>
            Hệ Thống Quản Trị Viên
          </Typography>
          <Typography variant="caption" className="text-slate-505 block leading-relaxed">
            Đăng nhập bằng tài khoản để truy cập cơ sở dữ liệu giặt là và điều hướng lồng giặt.
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit} className="space-y-6">
          <Stack spacing={2.5}>
            <InputText
              title="Tên tài khoản quản trị"
              required
              placeholder="admin"
              startAdornment={<UserSquare2 className="w-4 h-4 text-slate-400" />}
              inputProps={{
                type: 'text',
                value: username,
                onChange: (e: any) => setUsername(e.target.value),
              }}
            />

            <InputText
              title="Mật mã bảo mật"
              required
              placeholder="••••••••"
              startAdornment={<Lock className="w-4 h-4 text-slate-400" />}
              inputProps={{
                type: 'password',
                value: password,
                onChange: (e: any) => setPassword(e.target.value),
              }}
            />
          </Stack>

          {errorMsg && (
            <Box className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-medium flex items-center gap-2 animate-bounce-once">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <Typography variant="caption" className="font-medium text-rose-600">
                {errorMsg}
              </Typography>
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: 'slate.900',
              color: '#ffffff',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'slate.800',
                boxShadow: 'none'
              }
            }}
            className="cursor-pointer active:scale-95 transition-all text-center"
          >
            Đăng Nhập Tiếp Quản
          </Button>
        </Box>

        <Box className="bg-slate-50 rounded-xl p-3.5 text-[11px] text-slate-500 space-y-1 border border-slate-100">
          <Typography className="font-extrabold text-slate-705 flex items-center gap-1.5" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Tài khoản dùng thử Demo:
          </Typography>
          <Typography variant="caption" className="text-slate-500 block">• Username: <Box component="span" className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">admin</Box></Typography>
          <Typography variant="caption" className="text-slate-500 block">• Password: <Box component="span" className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">admin123</Box></Typography>
        </Box>
      </Stack>
    </Box>
  );
};
