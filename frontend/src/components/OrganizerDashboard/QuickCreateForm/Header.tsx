import { Sparkles, X } from 'lucide-react';

interface HeaderProps {
  isEditMode: boolean;
  onClose: () => void;
}

export const Header = ({ isEditMode, onClose }: HeaderProps) => (
  <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Quick Edit' : 'Quick Create'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEditMode ? 'Update key event details quickly' : 'Create an event in under 60 seconds'}
        </p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
    >
      <X className="w-5 h-5 text-gray-500" />
    </button>
  </div>
);
