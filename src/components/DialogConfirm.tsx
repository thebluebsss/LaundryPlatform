import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { ButtonCustom, ButtonOutLine } from './ButtonCustom';

type DialogConfirmType = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  textTitle?: string;
  textContent?: string;
  textButton?: string;
  textCancel?: string;
  isDelete?: boolean;
  isIconClose?: boolean;
  children?: ReactNode;
  maxWidth?: number;
};

export const DialogConfirm = ({
  isOpen,
  onClose,
  onSubmit,
  textContent,
  textTitle,
  textButton,
  isDelete,
  isIconClose = true,
  children,
  textCancel,
}: DialogConfirmType) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={isIconClose ? onClose : undefined}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-250"
      />

      {/* Content wrapper */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          {textTitle ? (
            <h3 className="text-lg md:text-xl font-black tracking-tight text-slate-900">
              {textTitle}
            </h3>
          ) : <div />}
          
          {isIconClose && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Text Body */}
        {textContent && (
          <p className="text-slate-500 font-medium leading-relaxed text-sm whitespace-pre-line">
            {textContent}
          </p>
        )}

        {/* Custom markup injected */}
        {children}

        {/* Action control buttons */}
        {(textButton || textCancel) && (
          <div className="flex items-center gap-3 pt-2">
            {textCancel && (
              <ButtonOutLine
                label={textCancel}
                onClick={onClose}
                className="flex-1"
              />
            )}
            {textButton && (
              <ButtonCustom
                isDelete={isDelete}
                label={textButton}
                onClick={onSubmit}
                className="flex-1"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
