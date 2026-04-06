import React from 'react';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select';
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  className = '',
}) => {
  const baseClasses = "w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground placeholder:text-foreground/30";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const inputProps = {
    type,
    value,
    onChange: handleChange,
    placeholder,
    required,
    className: type === 'textarea' ? `${baseClasses} resize-none h-24` : baseClasses,
  };

  if (type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <textarea {...inputProps} />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input {...inputProps} />
    </div>
  );
};
