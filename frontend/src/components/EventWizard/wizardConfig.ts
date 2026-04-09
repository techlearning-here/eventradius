export const WIZARD_SECTIONS = [
  {
    id: 'basic',
    title: 'Basic Event Details',
    description: 'Essential information for your event',
    subSteps: [
      { id: 'info', title: 'Event Info', description: 'Title, description, language and image' },
      { id: 'type', title: 'Type & Format', description: 'Event type, format, schedule and venue' },
      { id: 'contact', title: 'Contact Info', description: 'Phone and email for attendees' }
    ]
  },
  {
    id: 'audience',
    title: 'Target Audience',
    description: 'Define who your event is for',
    subSteps: [
      { id: 'demographics', title: 'Demographics', description: 'Age groups, gender, family-friendly settings' },
      { id: 'accessibility', title: 'Accessibility', description: 'Accessibility features and accommodations' }
    ]
  },
  {
    id: 'context',
    title: 'Cultural Context & Requirements',
    description: 'Cultural context and prerequisites',
    subSteps: [
      { id: 'cultural', title: 'Cultural Context', description: 'Religious, cultural, and dietary context' },
      { id: 'prerequisites', title: 'Prerequisites', description: 'Skill level, equipment, and requirements' },
      { id: 'content', title: 'Content Rating', description: 'Age rating, policies, and intensity' }
    ]
  },
  {
    id: 'review',
    title: 'Review & Publish',
    description: 'Review your event and publish',
    subSteps: [
      { id: 'review', title: 'Review & Publish', description: 'Final review before publishing' }
    ]
  }
] as const;
