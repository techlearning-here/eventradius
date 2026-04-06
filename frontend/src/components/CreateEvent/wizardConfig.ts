export const WIZARD_SECTIONS = [
  {
    id: 'basic',
    title: 'Basic Event Details',
    description: 'Essential information for your event',
    subSteps: [
      { id: 'info', title: 'Event Info', description: 'Title, description and image' },
      { id: 'type', title: 'Type & Format', description: 'Event type and format' },
      { id: 'datetime', title: 'Date & Location', description: 'Schedule and venue' },
      { id: 'contact', title: 'Contact Info', description: 'Phone and email for attendees' },
      { id: 'review', title: 'Review & Publish', description: 'Review your event and publish' }
    ]
  }
] as const;
