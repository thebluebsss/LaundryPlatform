import React from 'react';

type TextErrorProps = {
  errorText: string;
  className?: string;
};

export const TextError = ({ errorText, className = '' }: TextErrorProps) => {
  if (!errorText) return null;
  return (
    <p className={`text-[11px] text-rose-500 font-medium mt-1 ${className}`}>
      {errorText}
    </p>
  );
};
