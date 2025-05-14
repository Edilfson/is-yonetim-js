import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'default', children, ...props }) => {
  const className =
    variant === 'destructive'
      ? 'bg-red-500 text-white px-4 py-2 rounded'
      : 'bg-blue-500 text-white px-4 py-2 rounded';

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};