import React from 'react';

interface QuickActionsProps {
  onShare?: () => void;
  onSave?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onShare, onSave }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button 
          onClick={onShare}
          className="w-full flex items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
          </svg>
          <span className="font-medium">Share Event</span>
        </button>
        <button 
          onClick={onSave}
          className="w-full flex items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="font-medium">Save Event</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
