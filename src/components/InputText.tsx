import React, { FC, ReactNode, ChangeEvent } from 'react';
import { Stack } from '@mui/material';

export type InputProps = {
  value: string;
  type?: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  autoComplete?: string;
  disabled?: boolean;
};

export type RequiredInputProps = InputProps & { required: true };

type InputTextProps = {
  title?: string;
  inputProps?: InputProps | RequiredInputProps | any;
  inputError?: string;
  placeholder?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  errorWithoutText?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null> | null;
  maxLength?: number;
  colorTitle?: string;
  isAuthScreen?: boolean;
  required?: boolean;
};

export const InputText: FC<InputTextProps> = ({
  title,
  inputProps = {},
  inputError,
  placeholder,
  startAdornment,
  endAdornment,
  colorTitle,
  inputRef,
  isAuthScreen,
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
      
      <div className="relative flex items-center w-full">
        {startAdornment && (
          <div className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none">
            {startAdornment}
          </div>
        )}

        <input
          {...inputProps}
          ref={(node) => {
            if (inputRef) {
              if (typeof inputRef === 'function') {
                (inputRef as any)(node);
              } else {
                (inputRef as any).current = node;
              }
            }
            if (inputProps.ref) {
              if (typeof inputProps.ref === 'function') {
                (inputProps.ref as any)(node);
              } else {
                (inputProps.ref as any).current = node;
              }
            }
          }}
          type={inputProps.type || 'text'}
          placeholder={placeholder}
          autoComplete={inputProps.autoComplete || 'off'}
          disabled={inputProps.disabled}
          className={`w-full text-xs md:text-sm py-3 px-4 bg-slate-50 border rounded-xl focus:outline-none transition-all font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
            startAdornment ? 'pl-10' : ''
          } ${
            endAdornment ? 'pr-10' : ''
          } ${
            isError ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200'
          } ${
            inputProps.disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
          }`}
        />

        {endAdornment && (
          <div className="absolute right-3.5 flex items-center justify-center text-slate-400">
            {endAdornment}
          </div>
        )}
      </div>

      {inputError && (
        <span className="text-[11px] text-rose-500 font-medium mt-0.5">
          {inputError}
        </span>
      )}
    </Stack>
  );
};
