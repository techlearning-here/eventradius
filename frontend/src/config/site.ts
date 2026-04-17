/**
 * Site configuration
 * Uses Vite environment variables for easy customization
 */

export const SITE_CONFIG = {
  url: import.meta.env.VITE_SITE_URL || 'https://eventsradius.com',
  name: import.meta.env.VITE_SITE_NAME || 'EventsRadius',
  tagline: 'Making events discoverable',
} as const;

export const getEventShareUrl = (eventId: string): string => {
  return `${SITE_CONFIG.url}/event/${eventId}`;
};
