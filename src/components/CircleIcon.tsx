import React, { ReactNode } from 'react';
import { Stack } from '@mui/material';

type CircleIconProps = {
  icon: ReactNode;
  color?: string;
  className?: string;
};

export const CircleIcon = ({ icon, color = '#2563eb', className = '' }: CircleIconProps) => {
  return (
    <Stack
      className={`w-8 h-8 rounded-full text-white relative flex-shrink-0 ${className}`}
      style={{ backgroundColor: color }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="flex items-center justify-center">
        {icon}
      </div>
    </Stack>
  );
};
