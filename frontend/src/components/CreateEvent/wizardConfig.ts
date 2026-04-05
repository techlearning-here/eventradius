export const WIZARD_SECTIONS = [
  {
    id: 'basic',
    title: 'Basic Event Details',
    description: 'Essential information for your event',
    subSteps: [
      { id: 'info', title: 'Event Info', description: 'Title, description and image' },
      { id: 'type', title: 'Type & Format', description: 'Event type and format' },
      { id: 'datetime', title: 'Date & Location', description: 'Schedule and venue' },
      { id: 'contact', title: 'Contact Info', description: 'Phone and email for attendees' }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Options',
    description: 'Additional settings and features (optional)',
    subSteps: [
      { id: 'registration', title: 'Registration', description: 'Registration settings' },
      { id: 'ticketing', title: 'Ticketing', description: 'Ticket types and pricing' },
      { id: 'settings', title: 'Settings & Review', description: 'Policies and publishing' }
    ]
  }
] as const;
