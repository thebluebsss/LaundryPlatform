import React from 'react';
import { Loader2 } from 'lucide-react';

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  disabled?: boolean;
  loadingPosition?: 'start' | 'end' | 'center';
  children?: React.ReactNode;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  className = '',
  type = 'submit',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center font-bold transition-all focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed select-none ${className}`}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
      )}
      {children}
    </button>
  );
};

export interface CustomButtonProps extends SubmitButtonProps {
  label?: string;
  typeOutline?: 'black' | 'secondary';
  isSecondary?: boolean;
  isDelete?: boolean;
  iconStart?: React.ReactNode;
  textClassName?: string;
}

export const ButtonCustom: React.FC<CustomButtonProps> = ({
  label,
  isDelete,
  isSecondary,
  iconStart,
  textClassName = '',
  children,
  className = '',
  ...props
}) => {
  let bgClass = 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200/40';
  if (isDelete) {
    bgClass = 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200/40';
  } else if (isSecondary) {
    bgClass = 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200';
  }

  return (
    <SubmitButton
      className={`h-11 px-5 w-full rounded-xl transition-all active:scale-[0.98] ${bgClass} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {iconStart && <span className="flex items-center">{iconStart}</span>}
        {label && (
          <span className={`text-[15px] font-semibold ${textClassName}`}>
            {label}
          </span>
        )}
        {children}
      </div>
    </SubmitButton>
  );
};

export const ButtonOutLine: React.FC<CustomButtonProps> = ({
  label,
  iconStart,
  typeOutline = 'secondary',
  textClassName = '',
  children,
  className = '',
  ...props
}) => {
  const borderClass = typeOutline === 'black' 
    ? 'border border-slate-900 text-slate-900 bg-transparent hover:bg-slate-50'
    : 'border border-slate-200 text-slate-600 bg-transparent hover:bg-slate-50';

  return (
    <SubmitButton
      className={`h-11 px-5 w-full rounded-xl transition-all active:scale-[0.98] ${borderClass} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {iconStart && <span className="flex items-center">{iconStart}</span>}
        {label && (
          <span className={`text-[15px] font-semibold ${textClassName}`}>
            {label}
          </span>
        )}
        {children}
      </div>
    </SubmitButton>
  );
};
