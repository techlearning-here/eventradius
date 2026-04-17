/**
 * Cover Image Configuration
 * 
 * This file defines the available cover images for event creation.
 * Images should be placed in: /public/cover-images/<category>/<filename>
 * 
 * All images are sourced from Unsplash (free commercial use, no attribution required)
 */

export interface CoverImage {
  id: string;
  url: string;
  category: CoverImageCategory;
  alt: string;
  tags: string[];
}

export type CoverImageCategory = 
  | 'general' 
  | 'social' 
  | 'professional' 
  | 'arts' 
  | 'cultural'
  | 'painting'
  | 'photography'
  | 'film'
  | 'literature'
  | 'sports' 
  | 'food' 
  | 'wellness' 
  | 'tech';

export const COVER_IMAGE_CATEGORIES: Record<CoverImageCategory, { 
  label: string; 
  description: string;
  color: string;
  recommendedFor: string[];
}> = {
  general: {
    label: 'General',
    description: 'Versatile images for any event type',
    color: 'bg-gray-100 text-gray-700',
    recommendedFor: ['meetup', 'gathering', 'community', 'social'],
  },
  social: {
    label: 'Social & Party',
    description: 'Parties, celebrations, and social events',
    color: 'bg-pink-100 text-pink-700',
    recommendedFor: ['party', 'celebration', 'birthday', 'nightlife', 'wedding'],
  },
  professional: {
    label: 'Professional',
    description: 'Business meetings, conferences, and networking',
    color: 'bg-blue-100 text-blue-700',
    recommendedFor: ['conference', 'meeting', 'networking', 'business', 'corporate', 'seminar'],
  },
  arts: {
    label: 'Arts & Culture',
    description: 'Concerts, exhibitions, and performances',
    color: 'bg-purple-100 text-purple-700',
    recommendedFor: ['concert', 'exhibition', 'art', 'music', 'theater', 'festival'],
  },
  sports: {
    label: 'Sports & Fitness',
    description: 'Athletic events and fitness activities',
    color: 'bg-green-100 text-green-700',
    recommendedFor: ['sports', 'fitness', 'workout', 'game', 'race', 'tournament'],
  },
  food: {
    label: 'Food & Dining',
    description: 'Dining events, tastings, and food experiences',
    color: 'bg-orange-100 text-orange-700',
    recommendedFor: ['dining', 'food', 'cooking', 'tasting', 'brunch', 'dinner'],
  },
  wellness: {
    label: 'Wellness',
    description: 'Health, meditation, yoga, and self-care',
    color: 'bg-teal-100 text-teal-700',
    recommendedFor: ['yoga', 'meditation', 'wellness', 'health', 'spa', 'mindfulness'],
  },
  tech: {
    label: 'Tech & Startup',
    description: 'Technology events, hackathons, and startup meetups',
    color: 'bg-indigo-100 text-indigo-700',
    recommendedFor: ['hackathon', 'tech', 'startup', 'workshop', 'coding', 'demo'],
  },
  cultural: {
    label: 'Cultural & Religious',
    description: 'Cultural celebrations, festivals, and religious events',
    color: 'bg-amber-100 text-amber-700',
    recommendedFor: ['cultural', 'religious', 'festival', 'temple', 'church', 'prayer', 'diwali', 'christmas', 'eid'],
  },
  painting: {
    label: 'Painting & Visual Arts',
    description: 'Art galleries, painting workshops, and visual arts',
    color: 'bg-rose-100 text-rose-700',
    recommendedFor: ['painting', 'art', 'drawing', 'sketching', 'visual arts', 'canvas'],
  },
  photography: {
    label: 'Photography',
    description: 'Photo walks, photography workshops, and camera events',
    color: 'bg-cyan-100 text-cyan-700',
    recommendedFor: ['photography', 'photo walk', 'camera', 'portrait', 'landscape', 'workshop'],
  },
  film: {
    label: 'Film & Cinema',
    description: 'Movie screenings, film festivals, and cinema events',
    color: 'bg-red-100 text-red-700',
    recommendedFor: ['film', 'movie', 'cinema', 'screening', 'documentary', 'film festival'],
  },
  literature: {
    label: 'Literature & Books',
    description: 'Book clubs, poetry readings, and literary events',
    color: 'bg-yellow-100 text-yellow-700',
    recommendedFor: ['book club', 'literature', 'poetry', 'reading', 'writing', 'author'],
  },
};

// Define all available cover images
export const COVER_IMAGES: CoverImage[] = [
  // General / Any Event
  { id: 'gen-1', url: '/cover-images/general/01-community.jpg', category: 'general', alt: 'Community gathering', tags: ['people', 'community', 'crowd'] },
  { id: 'gen-2', url: '/cover-images/general/02-audience.jpg', category: 'general', alt: 'Event audience', tags: ['crowd', 'audience', 'seated'] },
  { id: 'gen-3', url: '/cover-images/general/03-conference.jpg', category: 'general', alt: 'Conference room', tags: ['conference', 'room', 'indoor'] },
  { id: 'gen-4', url: '/cover-images/general/04-stage.jpg', category: 'general', alt: 'Stage event', tags: ['stage', 'lights', 'performance'] },
  { id: 'gen-5', url: '/cover-images/general/05-speaker.jpg', category: 'general', alt: 'Speaker presentation', tags: ['speaker', 'microphone', 'presentation'] },
  
  // Social / Party
  { id: 'soc-1', url: '/cover-images/social/01-party.jpg', category: 'social', alt: 'Party celebration', tags: ['party', 'dancing', 'night'] },
  { id: 'soc-2', url: '/cover-images/social/02-concert.jpg', category: 'social', alt: 'Concert crowd', tags: ['concert', 'crowd', 'music'] },
  { id: 'soc-3', url: '/cover-images/social/03-toast.jpg', category: 'social', alt: 'Friends toasting', tags: ['drinks', 'toast', 'friends'] },
  { id: 'soc-4', url: '/cover-images/social/04-wedding.jpg', category: 'social', alt: 'Wedding celebration', tags: ['wedding', 'dance', 'elegant'] },
  { id: 'soc-5', url: '/cover-images/social/05-festival.jpg', category: 'social', alt: 'Festival crowd', tags: ['festival', 'outdoor', 'crowd'] },
  
  // Professional / Business
  { id: 'prof-1', url: '/cover-images/professional/01-meeting.jpg', category: 'professional', alt: 'Business meeting', tags: ['meeting', 'office', 'team'] },
  { id: 'prof-2', url: '/cover-images/professional/02-handshake.jpg', category: 'professional', alt: 'Professional handshake', tags: ['handshake', 'business', 'deal'] },
  { id: 'prof-3', url: '/cover-images/professional/03-workspace.jpg', category: 'professional', alt: 'Office workspace', tags: ['workspace', 'office', 'desk'] },
  { id: 'prof-4', url: '/cover-images/professional/04-team.jpg', category: 'professional', alt: 'Team collaboration', tags: ['team', 'collaboration', 'working'] },
  { id: 'prof-5', url: '/cover-images/professional/05-presentation.jpg', category: 'professional', alt: 'Business presentation', tags: ['presentation', 'whiteboard', 'meeting'] },
  
  // Arts / Culture
  { id: 'arts-1', url: '/cover-images/arts/01-gallery.jpg', category: 'arts', alt: 'Art gallery', tags: ['gallery', 'art', 'museum'] },
  { id: 'arts-2', url: '/cover-images/arts/02-music.jpg', category: 'arts', alt: 'Live music', tags: ['music', 'guitar', 'live'] },
  { id: 'arts-3', url: '/cover-images/arts/03-festival.jpg', category: 'arts', alt: 'Arts festival', tags: ['festival', 'crowd', 'outdoor'] },
  { id: 'arts-4', url: '/cover-images/arts/04-concert.jpg', category: 'arts', alt: 'Concert performance', tags: ['concert', 'stage', 'lights'] },
  { id: 'arts-5', url: '/cover-images/arts/05-performance.jpg', category: 'arts', alt: 'Stage performance', tags: ['performance', 'dance', 'theater'] },
  
  // Sports / Fitness
  { id: 'sports-1', url: '/cover-images/sports/01-yoga.jpg', category: 'sports', alt: 'Yoga class', tags: ['yoga', 'stretch', 'fitness'] },
  { id: 'sports-2', url: '/cover-images/sports/02-running.jpg', category: 'sports', alt: 'Running event', tags: ['running', 'race', 'athletic'] },
  { id: 'sports-3', url: '/cover-images/sports/03-fitness.jpg', category: 'sports', alt: 'Fitness workout', tags: ['fitness', 'workout', 'gym'] },
  { id: 'sports-4', url: '/cover-images/sports/04-athlete.jpg', category: 'sports', alt: 'Athlete training', tags: ['athlete', 'training', 'sport'] },
  { id: 'sports-5', url: '/cover-images/sports/05-gym.jpg', category: 'sports', alt: 'Gym workout', tags: ['gym', 'weights', 'fitness'] },
  { id: 'sports-6', url: '/cover-images/sports/06-basketball.jpg', category: 'sports', alt: 'Basketball indoor', tags: ['basketball', 'indoor', 'court', 'team'] },
  { id: 'sports-7', url: '/cover-images/sports/07-volleyball.jpg', category: 'sports', alt: 'Volleyball game', tags: ['volleyball', 'indoor', 'court', 'team'] },
  { id: 'sports-8', url: '/cover-images/sports/08-gym.jpg', category: 'sports', alt: 'Indoor gym', tags: ['gym', 'indoor', 'fitness', 'weights'] },
  
  // Food / Dining
  { id: 'food-1', url: '/cover-images/food/01-dinner.jpg', category: 'food', alt: 'Dinner party', tags: ['dinner', 'food', 'table'] },
  { id: 'food-2', url: '/cover-images/food/02-restaurant.jpg', category: 'food', alt: 'Restaurant dining', tags: ['restaurant', 'dining', 'interior'] },
  { id: 'food-3', url: '/cover-images/food/03-brunch.jpg', category: 'food', alt: 'Brunch gathering', tags: ['brunch', 'food', 'gathering'] },
  { id: 'food-4', url: '/cover-images/food/04-catering.jpg', category: 'food', alt: 'Catering event', tags: ['catering', 'buffet', 'food'] },
  { id: 'food-5', url: '/cover-images/food/05-drinks.jpg', category: 'food', alt: 'Drinks and cocktails', tags: ['drinks', 'cocktails', 'bar'] },
  
  // Wellness / Health
  { id: 'well-1', url: '/cover-images/wellness/01-meditation.jpg', category: 'wellness', alt: 'Meditation', tags: ['meditation', 'peace', 'calm'] },
  { id: 'well-2', url: '/cover-images/wellness/02-yoga.jpg', category: 'wellness', alt: 'Yoga wellness', tags: ['yoga', 'balance', 'health'] },
  { id: 'well-3', url: '/cover-images/wellness/03-wellness.jpg', category: 'wellness', alt: 'Wellness activity', tags: ['wellness', 'spa', 'relax'] },
  { id: 'well-4', url: '/cover-images/wellness/04-exercise.jpg', category: 'wellness', alt: 'Exercise class', tags: ['exercise', 'class', 'group'] },
  { id: 'well-5', url: '/cover-images/wellness/05-relax.jpg', category: 'wellness', alt: 'Relaxation', tags: ['relax', 'spa', 'peaceful'] },
  
  // Tech / Startup
  { id: 'tech-1', url: '/cover-images/tech/01-hackathon.jpg', category: 'tech', alt: 'Hackathon', tags: ['hackathon', 'coding', 'laptops'] },
  { id: 'tech-2', url: '/cover-images/tech/02-coworking.jpg', category: 'tech', alt: 'Coworking space', tags: ['coworking', 'office', 'modern'] },
  { id: 'tech-3', url: '/cover-images/tech/03-meeting.jpg', category: 'tech', alt: 'Tech meeting', tags: ['meeting', 'tech', 'discussion'] },
  { id: 'tech-4', url: '/cover-images/tech/04-team.jpg', category: 'tech', alt: 'Tech team', tags: ['team', 'tech', 'collaboration'] },
  { id: 'tech-5', url: '/cover-images/tech/05-office.jpg', category: 'tech', alt: 'Tech office', tags: ['office', 'startup', 'modern'] },
  
  // Cultural & Religious
  { id: 'cultural-1', url: '/cover-images/cultural/01-celebration.jpg', category: 'cultural', alt: 'Cultural celebration', tags: ['celebration', 'festival', 'traditional'] },
  { id: 'cultural-2', url: '/cover-images/cultural/02-temple.jpg', category: 'cultural', alt: 'Temple ceremony', tags: ['temple', 'prayer', 'spiritual'] },
  { id: 'cultural-3', url: '/cover-images/cultural/03-festival.jpg', category: 'cultural', alt: 'Cultural festival', tags: ['festival', 'colors', 'traditional'] },
  { id: 'cultural-4', url: '/cover-images/cultural/04-prayer.jpg', category: 'cultural', alt: 'Group prayer', tags: ['prayer', 'community', 'spiritual'] },
  { id: 'cultural-5', url: '/cover-images/cultural/05-ritual.jpg', category: 'cultural', alt: 'Traditional ritual', tags: ['ritual', 'tradition', 'ceremony'] },
  
  // Painting & Visual Arts
  { id: 'painting-1', url: '/cover-images/painting/01-canvas.jpg', category: 'painting', alt: 'Artist canvas', tags: ['canvas', 'painting', 'art'] },
  { id: 'painting-2', url: '/cover-images/painting/02-brushes.jpg', category: 'painting', alt: 'Paint brushes', tags: ['brushes', 'paints', 'art supplies'] },
  { id: 'painting-3', url: '/cover-images/painting/03-gallery.jpg', category: 'painting', alt: 'Art gallery', tags: ['gallery', 'artwork', 'exhibition'] },
  { id: 'painting-4', url: '/cover-images/painting/04-studio.jpg', category: 'painting', alt: 'Art studio', tags: ['studio', 'artist', 'creative'] },
  { id: 'painting-5', url: '/cover-images/painting/05-workshop.jpg', category: 'painting', alt: 'Painting workshop', tags: ['workshop', 'class', 'learning'] },
  
  // Photography
  { id: 'photo-1', url: '/cover-images/photography/01-camera.jpg', category: 'photography', alt: 'Camera', tags: ['camera', 'lens', 'equipment'] },
  { id: 'photo-2', url: '/cover-images/photography/02-landscape.jpg', category: 'photography', alt: 'Landscape photo', tags: ['landscape', 'nature', 'scenic'] },
  { id: 'photo-3', url: '/cover-images/photography/03-portrait.jpg', category: 'photography', alt: 'Portrait photography', tags: ['portrait', 'people', 'studio'] },
  { id: 'photo-4', url: '/cover-images/photography/04-walk.jpg', category: 'photography', alt: 'Photo walk', tags: ['walk', 'street', 'urban'] },
  { id: 'photo-5', url: '/cover-images/photography/05-editing.jpg', category: 'photography', alt: 'Photo editing', tags: ['editing', 'computer', 'digital'] },
  
  // Film & Cinema
  { id: 'film-1', url: '/cover-images/film/01-cinema.jpg', category: 'film', alt: 'Cinema hall', tags: ['cinema', 'theater', 'seats'] },
  { id: 'film-2', url: '/cover-images/film/02-camera.jpg', category: 'film', alt: 'Film camera', tags: ['camera', 'film', 'recording'] },
  { id: 'film-3', url: '/cover-images/film/03-screening.jpg', category: 'film', alt: 'Movie screening', tags: ['screening', 'audience', 'viewing'] },
  { id: 'film-4', url: '/cover-images/film/04-festival.jpg', category: 'film', alt: 'Film festival', tags: ['festival', 'red carpet', 'premiere'] },
  { id: 'film-5', url: '/cover-images/film/05-clapperboard.jpg', category: 'film', alt: 'Clapperboard', tags: ['clapperboard', 'production', 'action'] },
  
  // Literature & Books
  { id: 'lit-1', url: '/cover-images/literature/01-library.jpg', category: 'literature', alt: 'Library', tags: ['library', 'books', 'reading'] },
  { id: 'lit-2', url: '/cover-images/literature/02-reading.jpg', category: 'literature', alt: 'Person reading', tags: ['reading', 'book', 'quiet'] },
  { id: 'lit-3', url: '/cover-images/literature/03-bookclub.jpg', category: 'literature', alt: 'Book club', tags: ['club', 'discussion', 'group'] },
  { id: 'lit-4', url: '/cover-images/literature/04-poetry.jpg', category: 'literature', alt: 'Poetry reading', tags: ['poetry', 'mic', 'performance'] },
  { id: 'lit-5', url: '/cover-images/literature/05-writing.jpg', category: 'literature', alt: 'Writing workshop', tags: ['writing', 'notebook', 'creative'] },
];

// Helper function to get images by category
export function getCoverImagesByCategory(category: CoverImageCategory): CoverImage[] {
  return COVER_IMAGES.filter(img => img.category === category);
}

// Helper function to get images for a specific event type
export function getRecommendedImagesForEvent(
  eventType: string, 
  eventCategory?: string
): CoverImage[] {
  // If we have a specific event category match, prioritize those images
  if (eventCategory) {
    const matchingCategory = Object.keys(COVER_IMAGE_CATEGORIES).find(key => 
      COVER_IMAGE_CATEGORIES[key as CoverImageCategory].recommendedFor.includes(eventCategory.toLowerCase())
    );
    
    if (matchingCategory) {
      return getCoverImagesByCategory(matchingCategory as CoverImageCategory);
    }
  }
  
  // Fallback to event type mapping
  const typeToCategory: Record<string, CoverImageCategory[]> = {
    'in_person': ['general', 'social', 'professional', 'arts', 'sports', 'food', 'wellness', 'tech'],
    'online': ['general', 'professional', 'tech', 'wellness'],
    'hybrid': ['general', 'professional', 'tech', 'arts'],
  };
  
  const categories = typeToCategory[eventType] || ['general'];
  return categories.flatMap(cat => getCoverImagesByCategory(cat));
}

// Get a default image if no image is selected
export function getDefaultCoverImage(): CoverImage {
  return COVER_IMAGES[0]; // Return first general image
}

// Get random image from a category
export function getRandomCoverImage(category?: CoverImageCategory): CoverImage {
  const images = category ? getCoverImagesByCategory(category) : COVER_IMAGES;
  return images[Math.floor(Math.random() * images.length)];
}

// Search images by tags
export function searchCoverImages(query: string): CoverImage[] {
  const lowercaseQuery = query.toLowerCase();
  return COVER_IMAGES.filter(img => 
    img.alt.toLowerCase().includes(lowercaseQuery) ||
    img.tags.some(tag => tag.includes(lowercaseQuery))
  );
}
