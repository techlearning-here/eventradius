import { Card, CardContent } from '@/components/ui/card';

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormSection = ({ title, icon, children, className = '' }: FormSectionProps) => {
  return (
    <Card className={`mb-6 ${className}`}>
      <CardContent className="p-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          {icon}
          {title}
        </h4>
        {children}
      </CardContent>
    </Card>
  );
};
