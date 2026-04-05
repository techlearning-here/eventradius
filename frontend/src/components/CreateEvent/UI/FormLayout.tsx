interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export const FormRow = ({ children, className = '' }: FormRowProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {children}
    </div>
  );
};

interface FormColProps {
  children: React.ReactNode;
  className?: string;
}

export const FormCol = ({ children, className = '' }: FormColProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
