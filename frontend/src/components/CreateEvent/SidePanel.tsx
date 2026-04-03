import { ComponentType } from 'react';
import { FileText, Clock, MapPin, Settings, Eye, TrendingUp, Share2, Star, Users, Minimize2, Maximize2 } from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface SidePanelSection {
  id: string;
  label: string;
  icon: ComponentType<LucideProps>;
  description: string;
}

interface SidePanelProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMinimized?: boolean;
  onMinimizeToggle?: () => void;
}

const sidePanelSections: SidePanelSection[] = [
  {
    id: 'basic',
    label: 'Basic Info',
    icon: FileText,
    description: 'Event name, description, and image'
  },
  {
    id: 'datetime',
    label: 'Date & Time',
    icon: Clock,
    description: 'Schedule your event'
  },
  {
    id: 'location',
    label: 'Location',
    icon: MapPin,
    description: 'Where your event takes place'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: Settings,
    description: 'Additional settings and options'
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: Eye,
    description: 'See how your event will appear'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: TrendingUp,
    description: 'Track event performance'
  },
  {
    id: 'share',
    label: 'Share',
    icon: Share2,
    description: 'Promote your event'
  }
];

export const SidePanel = ({ activeSection, onSectionChange, isMinimized = false, onMinimizeToggle }: SidePanelProps) => {
  const ToggleIcon = isMinimized ? Maximize2 : Minimize2;

  return (
    <div className={`w-64 bg-black text-white p-4 min-h-screen border-r border-gray-200 transition-all duration-300 ${
      isMinimized ? 'w-16' : 'w-64'
    }`}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Event Creator
        </h3>
        
        {/* Minimize/Maximize Button */}
        <button
          onClick={onMinimizeToggle}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          title={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ToggleIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Section Navigation - Hidden when minimized */}
      {!isMinimized && (
        <nav className="space-y-1">
          {sidePanelSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${
                  isActive 
                    ? 'bg-white text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div>
                  <div className="text-sm font-medium">{section.label}</div>
                  <div className="text-xs text-gray-400">{section.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      )}
      
      {/* Bottom Actions - Always Visible */}
      <div className="mt-8 pt-4 border-t border-gray-700">
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
            <Star className="w-4 h-4 inline mr-2" />
            Templates
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
            <Users className="w-4 h-4 inline mr-2" />
            Collaborators
          </button>
        </div>
      </div>
    </div>
  );
};
