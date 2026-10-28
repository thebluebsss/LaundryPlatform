import React, { FC, ChangeEvent } from 'react';
import { Stack } from '@mui/material';

type InputAreaProps = {
  title?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  inputError?: string;
  placeholder?: string;
  rows?: number;
  colorTitle?: string;
  isAuthScreen?: boolean;
  disabled?: boolean;
  required?: boolean;
};

export const InputArea: FC<InputAreaProps> = ({
  title,
  value,
  onChange,
  onBlur,
  inputError,
  placeholder,
  rows = 4,
  colorTitle,
  isAuthScreen,
  disabled,
  required,
}) => {
  const isError = !!inputError;

  return (
    <Stack className="w-full gap-1.5">
      {title && (
        <label className={`text-xs font-bold block ${colorTitle || (isAuthScreen ? 'text-slate-500' : 'text-slate-700')}`}>
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        disabled={disabled}
        rows={rows}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full text-xs md:text-sm py-2.5 px-4 bg-slate-50 border rounded-xl focus:outline-none transition-all font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
          isError ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200'
        } ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
        }`}
      />

      {inputError && (
        <span className="text-[11px] text-rose-500 font-medium mt-0.5">
          {inputError}
        </span>
      )}
    </Stack>
  );
};
