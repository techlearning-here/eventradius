import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
}) => {
  const baseClasses = "px-4 py-2 text-sm font-medium transition-colors";
  
  const variantClasses = {
    primary: "bg-foreground text-background hover:bg-foreground/80",
    secondary: "bg-muted text-muted-foreground hover:bg-muted/80",
    outline: "border border-foreground text-foreground hover:bg-foreground hover:text-background",
  };

  const buttonProps = {
    type,
    onClick,
    disabled,
    className: `${baseClasses} ${variantClasses[variant]} ${className}`,
  };

  return (
    <button {...buttonProps}>
      {children}
    </button>
  );
};
