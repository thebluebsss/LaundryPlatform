import React from 'react';

type TextEllipsisProps = {
  text: string;
  className?: string;
  line?: number;
};

export const TextEllipsis = ({ text, className = '', line = 1 }: TextEllipsisProps) => {
  const lineStyle: React.CSSProperties = {
    display: '-webkit-box',
    WebkitLineClamp: line,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  return (
    <span 
      title={text} 
      className={`${line === 1 ? 'truncate block' : ''} ${className}`}
      style={line > 1 ? lineStyle : undefined}
    >
      {text}
    </span>
  );
};
