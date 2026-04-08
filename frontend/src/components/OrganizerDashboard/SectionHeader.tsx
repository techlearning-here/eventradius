import { Plus } from 'lucide-react';

interface SectionHeaderProps {
  activeSection: string;
  onCreateEvent?: () => void;
}

const sectionInfo = {
  events: {
    title: 'My Events',
    description: 'Create, edit, and manage your events',
    showCreateButton: true
  },
  analytics: {
    title: 'Analytics',
    description: 'Track your event performance and metrics',
    showCreateButton: false
  },
  attendees: {
    title: 'Attendees',
    description: 'View and manage participant information',
    showCreateButton: false
  },
  promotions: {
    title: 'Promotions',
    description: 'Promote your events and reach more attendees',
    showCreateButton: false
  },
  billing: {
    title: 'Billing',
    description: 'Manage your subscription and payments',
    showCreateButton: false
  },
  resources: {
    title: 'Resources',
    description: 'Access guides and documentation',
    showCreateButton: false
  },
  settings: {
    title: 'Settings',
    description: 'Manage your account preferences',
    showCreateButton: false
  },
  help: {
    title: 'Help & Support',
    description: 'Get help and support',
    showCreateButton: false
  },
  'recycle-bin': {
    title: 'Recycle Bin',
    description: 'Restore deleted events within 30 days',
    showCreateButton: false
  }
};

export const SectionHeader = ({ activeSection, onCreateEvent }: SectionHeaderProps) => {
  const currentSection = sectionInfo[activeSection as keyof typeof sectionInfo];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{currentSection?.title}</h1>
        <p className="text-muted-foreground text-sm">{currentSection?.description}</p>
      </div>
      {currentSection?.showCreateButton && onCreateEvent && (
        <div className="flex gap-3">
          <button
            onClick={onCreateEvent}
            className="group relative flex items-center gap-2 px-6 py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white font-semibold text-sm rounded-xl shadow-[0_4px_0_0_#047857,0_8px_16px_rgba(4,120,87,0.4)] hover:shadow-[0_2px_0_0_#047857,0_4px_8px_rgba(4,120,87,0.4)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all duration-150"
          >
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Plus className="w-4 h-4" />
            </div>
            <span>Create Event</span>
          </button>
        </div>
      )}
    </div>
  );
};
