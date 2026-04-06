import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  className = '',
}) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-foreground rounded focus:outline-none"
      />
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
};
