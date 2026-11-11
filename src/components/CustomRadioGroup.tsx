import React from 'react';

interface CustomRadioGroupProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
}

export const CustomRadioGroup = ({
  name,
  label,
  value,
  onChange,
  options,
  className = '',
}: CustomRadioGroupProps) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <span className="text-xs font-bold text-slate-700 block">{label}</span>}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              name={name}
              onClick={() => onChange(option.value)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-white text-blue-650 shadow-sm border border-slate-150' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
