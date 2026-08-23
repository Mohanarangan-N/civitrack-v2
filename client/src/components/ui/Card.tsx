import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glass = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${glass ? 'card-glass' : 'card'} ${onClick ? 'cursor-pointer hover:border-accent/40 transition-all duration-300' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
