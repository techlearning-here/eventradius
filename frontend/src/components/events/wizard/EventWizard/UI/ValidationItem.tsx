import { CheckCircle, AlertCircle } from 'lucide-react';

interface ValidationItemProps {
  label: string;
  isValid: boolean;
  onEdit?: () => void;
  editLabel?: string;
}

export const ValidationItem = ({ label, isValid, onEdit, editLabel = 'Edit' }: ValidationItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        {isValid ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
        <span className={isValid ? 'text-green-700' : 'text-red-700'}>
          {label}
        </span>
      </div>
      {!isValid && onEdit && (
        <button
          onClick={onEdit}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          {editLabel}
        </button>
      )}
    </div>
  );
};
