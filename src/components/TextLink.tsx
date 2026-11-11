import React from 'react';
import { Link } from 'react-router-dom';

type TextLinkProps = {
  children?: React.ReactNode;
  to?: string;
  target?: string;
  className?: string;
};

export const TextLink = ({ children, to, target, className = '' }: TextLinkProps) => {
  const linkClasses = `text-xs md:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer ${className}`;

  if (to) {
    if (to.startsWith('http')) {
      return (
        <a href={to} target={target} rel="noopener noreferrer" className={linkClasses}>
          {children}
        </a>
      );
    }
    return (
      <Link to={to} target={target} className={linkClasses}>
        {children}
      </Link>
    );
  }

  return <span className={linkClasses}>{children}</span>;
};
