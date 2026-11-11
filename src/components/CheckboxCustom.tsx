import React from 'react';

export interface CheckboxProps {
  checked: boolean;
  onCheck: (nextChecked: boolean) => void;
  label?: string;
  className?: string;
}

export const CheckboxCustom: React.FC<CheckboxProps> = ({ checked, onCheck, label, className = '' }) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheck(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
          checked
            ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        {checked && (
          <svg
            className="w-3.5 h-3.5 stroke-[3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {label && (
        <span className="text-sm font-bold text-slate-700 leading-none">
          {label}
        </span>
      )}
    </label>
  );
};
