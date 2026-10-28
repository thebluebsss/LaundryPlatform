import React, { FC, useState, useRef, useEffect } from 'react';
import { Stack } from '@mui/material';
import { ChevronDown, Check, X } from 'lucide-react';

export type SelectOptions = {
  value: string;
  label: string;
  extra?: string | React.ReactNode;
  extraBefore?: string | React.ReactNode;
};

type InputSelectProps = {
  title?: string;
  value?: string | null;
  options?: SelectOptions[];
  onChange?: (e: { target: { value: string } }) => void;
  inputError?: string;
  placeholder?: string;
  colorTitle?: string;
  isAuthScreen?: boolean;
  required?: boolean;
  disabled?: boolean;
};

export const InputSelect: FC<InputSelectProps> = ({
  title,
  value,
  options = [],
  onChange,
  required = false,
  inputError,
  placeholder,
  isAuthScreen,
  colorTitle,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Stack ref={dropdownRef} className="w-full gap-1.5 relative">
      {title && (
        <label className={`text-xs font-bold block ${colorTitle || (isAuthScreen ? 'text-slate-500' : 'text-slate-700')}`}>
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-xs md:text-sm py-3 px-4 bg-slate-50 border rounded-xl focus:outline-none transition-all font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 selection:bg-blue-100 ${
          inputError ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {selectedOption ? (
            <>
              {selectedOption.extraBefore}
              <span className="truncate text-slate-850">{selectedOption.label}</span>
              {selectedOption.extra && <span className="text-slate-400 text-[11px] ml-1">{selectedOption.extra}</span>}
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-450 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-150 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {options.length === 0 ? (
            <div className="px-4 py-2.5 text-xs text-slate-400 italic">Không có lựa chọn nào</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange?.({ target: { value: opt.value } });
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs md:text-sm flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-600 font-extrabold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {opt.extraBefore}
                    <span className="truncate">{opt.label}</span>
                    {opt.extra && <span className="text-[11px] opacity-75">{opt.extra}</span>}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}

      {inputError && (
        <span className="text-[11px] text-rose-500 font-medium mt-0.5">
          {inputError}
        </span>
      )}
    </Stack>
  );
};

export type InputSelectMultipleProps = {
  label?: string;
  options: SelectOptions[];
  onChangeInput?: (value: string[]) => void;
  placeholder?: string;
  listChooseSelect?: string[];
  inputError?: string;
  disabled?: boolean;
  isAuthScreen?: boolean;
  required?: boolean;
};

export const InputSelectMultiple: FC<InputSelectMultipleProps> = ({
  label,
  options = [],
  onChangeInput,
  placeholder,
  listChooseSelect = [],
  inputError,
  disabled = false,
  isAuthScreen,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    const current = [...listChooseSelect];
    let updated: string[];
    if (current.includes(val)) {
      updated = current.filter((v) => v !== val);
    } else {
      updated = [...current, val];
    }
    onChangeInput?.(updated);
  };

  const selectedLabels = options.filter((opt) => listChooseSelect.includes(opt.value));

  return (
    <Stack ref={dropdownRef} className="w-full gap-1.5 relative">
      {label && (
        <label className={`text-xs font-bold block ${isAuthScreen ? 'text-slate-500' : 'text-slate-700'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-xs md:text-sm py-2 px-4 bg-slate-50 border rounded-xl focus:outline-none transition-all font-medium text-slate-800 ${
          inputError ? 'border-rose-400' : 'border-slate-200'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'cursor-pointer'}`}
      >
        <div className="flex flex-wrap gap-1.5 items-center mr-2 max-w-[90%]">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 bg-slate-200 py-1 pl-2.5 pr-1.5 text-xs text-slate-700 font-bold rounded-lg border border-slate-250"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  className="p-0.5 rounded-md hover:bg-slate-300 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-450 transition-transform" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-150 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((opt) => {
            const isChecked = listChooseSelect.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className="w-full text-left px-4 py-2.5 text-xs md:text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 font-medium"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isChecked && (
                    <svg className="w-3 h-3 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {inputError && (
        <span className="text-[11px] text-rose-500 font-medium mt-0.5">
          {inputError}
        </span>
      )}
    </Stack>
  );
};
