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
            className="group relative flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:from-emerald-400 hover:to-teal-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <div className="relative flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span>Create Event</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
