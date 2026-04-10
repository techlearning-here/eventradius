import React from 'react';
import { ArrowLeft, Heart, Share2, Bookmark, LayoutGrid } from 'lucide-react';

interface EventDetailHeaderProps {
  category?: string;
  onClose: () => void;
}

export const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({ category, onClose }) => {
  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Section - Back & Category */}
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 p-2 rounded-xl hover:bg-muted"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted group-hover:bg-background transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
          
          <div className="h-6 w-px bg-border/60 hidden sm:block" />
          
          {category && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="hidden sm:inline text-sm font-medium text-foreground capitalize">
                {category}
              </span>
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1">
          <button 
            className="group p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200"
            title="Save event"
          >
            <Bookmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            className="group p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200"
            title="Favorite"
          >
            <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            className="group p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200"
            title="Share event"
          >
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailHeader;
