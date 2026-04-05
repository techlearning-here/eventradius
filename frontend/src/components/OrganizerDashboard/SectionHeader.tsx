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
            className="flex items-center gap-2 px-5 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>
      )}
    </div>
  );
};
