require('@testing-library/jest-dom');

// Mock site config for tests
jest.mock('@/config/site', () => ({
  SITE_CONFIG: {
    url: 'https://eventsradius.com',
    name: 'EventsRadius',
    tagline: 'Making events discoverable',
  },
  getEventShareUrl: jest.fn((eventId) => `https://eventsradius.com/event/${eventId}`),
}));
