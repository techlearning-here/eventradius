import type { Event } from '@/integrations/backend/api';

/**
 * Comprehensive Dummy Events showcasing all new attribute combinations
 */
export const dummyEvents: Record<string, Event> = {
  // Family-Friendly: All Ages, Fully Accessible
  'demo-family-all-ages': {
    id: 'demo-family-all-ages',
    title: 'Community Arts & Crafts Festival',
    subtitle: 'A Creative Family Experience',
    summary: 'Join us for a day of creativity, fun, and artistic expression for the whole family!',
    description: 'A fun-filled family arts and crafts workshop for all ages! Activities include canvas painting, clay sculpture, seasonal crafts, and collaborative family art projects. All materials provided.',
    location: 'Community Arts Center, 123 Main Street, San Francisco, CA 94102',
    start_time: '2026-07-15T10:00:00Z',
    end_time: '2026-07-15T12:00:00Z',
    timezone: 'America/Los_Angeles',
    image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop',
    category: 'art',
    max_participants: 25,
    is_public: true,
    organizer_id: 'organizer-001',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-07T08:00:00Z',
    current_participants: 18,
    is_paid_event: false,
    // Event Wizard - Tags
    tags: ['family', 'arts', 'crafts', 'creative', 'all-ages'],
    // Event Wizard - Venue Details
    venue_building_name: 'Community Arts Center',
    venue_street: '123 Main Street',
    venue_city: 'San Francisco',
    venue_state: 'CA',
    venue_zip_code: '94102',
    venue_country: 'USA',
    // Event Wizard - Timing
    doors_open_time: '2026-07-15T09:30:00Z',
    registration_start_time: '2026-06-15T00:00:00Z',
    registration_end_time: '2026-07-14T23:59:00Z',
    // Event Wizard - Virtual Event (hybrid option)
    virtual_event_url: 'https://zoom.us/j/example123',
    virtual_event_platform: 'Zoom',
    event_password: 'Crafts2026',
    // Event Wizard - Additional
    age_restriction: 'all_ages',
    accessibility_options: 'Wheelchair accessible, hearing assistance available',
    event_format: 'single',
    event_privacy: 'public',
    custom_refund_policy: 'Full refund available up to 24 hours before the event',
    // Audience & Demographics
    age_categories: ['kids', 'teens', 'adults', 'seniors'],
    gender_preference: 'all',
    family_friendly: true,
    senior_friendly: true,
    singles_friendly: false,
    couples_oriented: false,
    // Accessibility - FULLY ACCESSIBLE
    wheelchair_accessible: true,
    mobility_friendly: true,
    hearing_accessible: true,
    vision_accessible: true,
    sensory_friendly: false,
    service_animals_allowed: true,
    accessibility_notes: 'Fully accessible venue with ramps, accessible restrooms, sign language interpreter available.',
    // Cultural Context
    religious_context: [],
    dietary_context: ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher'],
    traditional_attire: 'not_applicable',
    // Prerequisites
    skill_level: 'all_levels',
    prior_experience: 'none_required',
    physical_fitness: 'sedentary',
    equipment_required: [],
    dress_code: 'casual',
    prerequisites_notes: 'No prior experience needed. All materials provided.',
    // Content & Intensity
    content_rating: 'all_ages',
    alcohol_served: 'no_alcohol',
    smoking_policy: 'non_smoking',
    noise_level: 'quiet',
    physical_intensity: 'none',
    // Social Features
    networking_focus: false,
    social_mixer: false,
    ice_breakers: false,
    group_activities: true,
    team_building: false,
    // Language
    primary_language: 'english',
    secondary_languages: ['spanish'],
    interpretation_available: true,
    sign_language_interpreter: true,
    // Type & Format
    event_type: 'in_person',
    format: 'interactive_workshop',
    sub_category: 'arts_crafts',
    // Pricing
    refund_policy: 'full_refund_24h',
    group_discounts: true
  },

  // Seniors Only: Quiet, Social, Low Mobility
  'demo-seniors-social': {
    id: 'demo-seniors-social',
    title: 'Senior Social Tea & Bridge Club',
    description: 'A relaxing afternoon of socializing, tea, and bridge games designed specifically for seniors. Enjoy friendly competition and make new connections.',
    location: 'Senior Community Center, 789 Oak Street, San Francisco, CA 94102',
    start_time: '2026-07-20T14:00:00Z',
    end_time: '2026-07-20T16:30:00Z',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    category: 'party',
    max_participants: 60,
    is_public: true,
    organizer_id: 'organizer-002',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-07T08:00:00Z',
    current_participants: 42,
    is_paid_event: true,
    // ticket_pricing_description: '$15 per person includes tea and refreshments',
    ticketing_website: 'https://www.eventbrite.com/senior-center-events',
    // creator: 'Senior Community Center',
    // status: 'published',
    // Audience - SENIORS ONLY
    age_categories: ['seniors', '60_plus'],
    gender_preference: 'all',
    family_friendly: false,
    senior_friendly: true,
    singles_friendly: true,
    couples_oriented: false,
    // Accessibility
    wheelchair_accessible: true,
    mobility_friendly: true,
    hearing_accessible: true,
    vision_accessible: true,
    sensory_friendly: true,
    service_animals_allowed: true,
    accessibility_notes: 'Wheelchair accessible. Hearing assistance devices available. Large print materials provided.',
    // Cultural
    religious_context: [],
    dietary_context: ['diabetic_friendly', 'low_sodium', 'soft_foods'],
    traditional_attire: 'not_applicable',
    // Prerequisites
    skill_level: 'beginner',
    prior_experience: 'none_required',
    physical_fitness: 'sedentary',
    equipment_required: [],
    dress_code: 'smart_casual',
    prerequisites_notes: 'No bridge experience required. Instruction available for beginners.',
    // Content
    content_rating: 'all_ages',
    alcohol_served: 'no_alcohol',
    smoking_policy: 'non_smoking',
    noise_level: 'quiet',
    physical_intensity: 'none',
    // Social
    networking_focus: true,
    social_mixer: true,
    ice_breakers: true,
    group_activities: true,
    team_building: false,
    // Language
    primary_language: 'english',
    secondary_languages: [],
    interpretation_available: false,
    sign_language_interpreter: false,
    // Type & Format
    event_type: 'in_person',
    format: 'social_meetup',
    sub_category: 'card_games',
    // Pricing
    refund_policy: 'no_refund',
    group_discounts: false
  },

  // Kids Only: Sensory-Friendly, Educational
  'demo-kids-sensory': {
    id: 'demo-kids-sensory',
    title: 'Sensory-Friendly Kids Story Time',
    description: 'A calm, sensory-friendly story time designed for children with sensory sensitivities. Quiet environment, dimmed lights, and flexible seating.',
    location: 'Quiet Reading Room, Public Library, 987 Book Street, San Francisco, CA 94107',
    start_time: '2026-07-18T10:00:00Z',
    end_time: '2026-07-18T11:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e4f8db7?w=800&h=400&fit=crop',
    category: 'education',
    max_participants: 12,
    is_public: true,
    organizer_id: 'organizer-003',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-07T08:00:00Z',
    current_participants: 8,
    is_paid_event: false,
    // ticket_pricing_description: 'Free sensory-friendly story time',
    // ticketing_website: '',
    // creator: 'Public Library',
    // status: 'published',
    // Audience - KIDS ONLY
    age_categories: ['kids'],
    gender_preference: 'all',
    family_friendly: true,
    senior_friendly: false,
    singles_friendly: false,
    couples_oriented: false,
    // Accessibility - SENSORY FRIENDLY
    wheelchair_accessible: true,
    mobility_friendly: true,
    hearing_accessible: true,
    vision_accessible: true,
    sensory_friendly: true,
    service_animals_allowed: true,
    accessibility_notes: 'Sensory-friendly environment: dimmed lights, quiet tones, flexible seating, fidget toys available. Quiet exit available.',
    // Cultural
    religious_context: [],
    dietary_context: ['allergy_friendly'],
    traditional_attire: 'not_applicable',
    // Prerequisites
    skill_level: 'all_levels',
    prior_experience: 'none_required',
    physical_fitness: 'sedentary',
    equipment_required: [],
    dress_code: 'casual',
    prerequisites_notes: 'Parent/caregiver must accompany child. Noise-canceling headphones welcome.',
    // Content
    content_rating: 'all_ages',
    alcohol_served: 'no_alcohol',
    smoking_policy: 'non_smoking',
    noise_level: 'quiet',
    physical_intensity: 'none',
    // Social
    networking_focus: false,
    social_mixer: false,
    ice_breakers: false,
    group_activities: false,
    team_building: false,
    // Language
    primary_language: 'english',
    secondary_languages: ['spanish'],
    interpretation_available: true,
    sign_language_interpreter: false,
    // Type & Format
    event_type: 'in_person',
    format: 'performance_show',
    sub_category: 'storytelling',
    // Pricing
    refund_policy: 'full_refund_24h',
    group_discounts: true
  },

  // Adults Only: Networking, Professional, Alcohol Served
  'demo-adults-networking': {
    id: 'demo-adults-networking',
    title: 'Tech Professionals Networking Mixer',
    description: 'An evening networking event for tech professionals to connect, share ideas, and build relationships. Drinks and appetizers provided.',
    location: 'Rooftop Lounge, 456 Market Street, San Francisco, CA 94103',
    start_time: '2026-07-22T18:00:00Z',
    end_time: '2026-07-22T21:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop',
    category: 'business',
    max_participants: 80,
    is_public: true,
    organizer_id: 'organizer-004',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-07T08:00:00Z',
    current_participants: 56,
    is_paid_event: true,
    // ticket_pricing_description: '$25 includes drinks and appetizers',
    ticketing_website: 'https://www.eventbrite.com/tech-networking',
    // creator: 'SF Tech Network',
    // status: 'published',
    // Audience - ADULTS ONLY
    age_categories: ['adults'],
    gender_preference: 'all',
    family_friendly: false,
    senior_friendly: false,
    singles_friendly: true,
    couples_oriented: false,
    // Accessibility
    wheelchair_accessible: true,
    mobility_friendly: true,
    hearing_accessible: true,
    vision_accessible: true,
    sensory_friendly: false,
    service_animals_allowed: false,
    accessibility_notes: 'Elevator access to rooftop. Quiet conversation areas available away from music.',
    // Cultural
    religious_context: [],
    dietary_context: ['vegetarian', 'vegan', 'gluten_free'],
    traditional_attire: 'not_applicable',
    // Prerequisites
    skill_level: 'intermediate',
    prior_experience: 'some_preferred',
    physical_fitness: 'sedentary',
    equipment_required: ['business_cards'],
    dress_code: 'business_casual',
    prerequisites_notes: 'Business cards recommended. Tech industry background preferred but not required.',
    // Content - ADULT ORIENTED
    content_rating: 'adult_supervision',
    alcohol_served: 'bar_available',
    smoking_policy: 'outdoor_only',
    noise_level: 'loud',
    physical_intensity: 'none',
    // Social - NETWORKING FOCUS
    networking_focus: true,
    social_mixer: true,
    ice_breakers: true,
    group_activities: false,
    team_building: false,
    // Language
    primary_language: 'english',
    secondary_languages: ['spanish', 'chinese_mandarin'],
    interpretation_available: true,
    sign_language_interpreter: false,
    // Type & Format
    event_type: 'in_person',
    format: 'networking_mixer',
    sub_category: 'tech_professionals',
    // Pricing
    refund_policy: 'no_refund',
    group_discounts: false
  },

  // Religious/Cultural: Hindu Festival with Traditional Attire
  'demo-cultural-festival': {
    id: 'demo-cultural-festival',
    title: 'Diwali Festival Celebration',
    description: 'Join us for a vibrant Diwali celebration featuring traditional Indian music, dance performances, cultural workshops, and authentic Indian cuisine.',
    location: 'Community Cultural Center, 789 Festival Way, San Francisco, CA 94104',
    start_time: '2026-11-14T16:00:00Z',
    end_time: '2026-11-14T22:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=400&fit=crop',
    category: 'festival',
    max_participants: 200,
    is_public: true,
    organizer_id: 'organizer-005',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-07T08:00:00Z',
    current_participants: 145,
    is_paid_event: false,
    // ticket_pricing_description: 'Free community festival!',
    // ticketing_website: '',
    // creator: 'Indian Cultural Association',
    // status: 'published',
    // Audience - ALL WELCOME
    age_categories: ['kids', 'teens', 'adults', 'seniors'],
    gender_preference: 'all',
    family_friendly: true,
    senior_friendly: true,
    singles_friendly: true,
    couples_oriented: true,
    // Accessibility
    wheelchair_accessible: true,
    mobility_friendly: true,
    hearing_accessible: true,
    vision_accessible: true,
    sensory_friendly: false,
    service_animals_allowed: true,
    accessibility_notes: 'Cultural center is fully accessible. Seating available for all performances.',
    // Cultural - HINDU FESTIVAL
    religious_context: ['hindu'],
    dietary_context: ['vegetarian', 'vegan', 'halal', 'kosher', 'jain'],
    traditional_attire: 'encouraged',
    // Prerequisites
    skill_level: 'all_levels',
    prior_experience: 'none_required',
    physical_fitness: 'sedentary',
    equipment_required: [],
    dress_code: 'traditional',
    prerequisites_notes: 'Traditional Indian attire encouraged but not required. All are welcome to celebrate.',
    // Content
    content_rating: 'all_ages',
    alcohol_served: 'no_alcohol',
    smoking_policy: 'non_smoking',
    noise_level: 'moderate',
    physical_intensity: 'none',
    // Social
    networking_focus: false,
    social_mixer: true,
    ice_breakers: false,
    group_activities: true,
    team_building: false,
    // Language
    primary_language: 'hindi',
    secondary_languages: ['english', 'tamil', 'telugu'],
    interpretation_available: true,
    sign_language_interpreter: false,
    // Type & Format
    event_type: 'in_person',
    format: 'cultural_festival',
    sub_category: 'religious_celebration',
    // Pricing
    refund_policy: 'full_refund_24h',
    group_discounts: true
  },

  // High Intensity: Sports/Fitness Event
  'demo-sports-intensive': {
    id: 'demo-sports-intensive',
    title: 'Beach Volleyball Tournament',
    description: 'Competitive beach volleyball tournament for intermediate to advanced players. Teams of 4, round-robin format with prizes for winners.',
    location: 'Ocean Beach Volleyball Courts, San Francisco, CA 94121',
    start_time: '2026-07-25T09:00:00Z',
    end_time: '2026-07-25T17:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop',
    category: 'sports',
    max_participants: 48,
    is_public: true,
    organizer_id: 'organizer-006',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-07T08:00:00Z',
    current_participants: 32,
    is_paid_event: true,
    // ticket_pricing_description: '$40 per team (4 players)',
    ticketing_website: 'https://www.eventbrite.com/sf-volleyball-tournament',
    // creator: 'SF Beach Volleyball League',
    // status: 'published',
    // Audience - TEENS AND ADULTS, FIT
    age_categories: ['teens', 'adults'],
    gender_preference: 'all',
    family_friendly: false,
    senior_friendly: false,
    singles_friendly: true,
    couples_oriented: false,
    // Accessibility - LIMITED
    wheelchair_accessible: false,
    mobility_friendly: false,
    hearing_accessible: true,
    vision_accessible: true,
    sensory_friendly: false,
    service_animals_allowed: false,
    accessibility_notes: 'Beach terrain not suitable for wheelchairs. High physical activity required.',
    // Cultural
    religious_context: [],
    dietary_context: ['healthy_options'],
    traditional_attire: 'not_applicable',
    // Prerequisites - HIGH SKILL & FITNESS
    skill_level: 'advanced',
    prior_experience: 'required',
    physical_fitness: 'high',
    equipment_required: ['sports_shoes', 'athletic_wear', 'sunscreen', 'water_bottle'],
    dress_code: 'athletic_wear',
    prerequisites_notes: 'Intermediate to advanced volleyball skills required. Must be physically fit for sand play.',
    // Content - HIGH INTENSITY
    content_rating: 'teen_plus',
    alcohol_served: 'no_alcohol',
    smoking_policy: 'non_smoking',
    noise_level: 'loud',
    physical_intensity: 'high',
    // Social - TEAM BUILDING
    networking_focus: false,
    social_mixer: false,
    ice_breakers: false,
    group_activities: true,
    team_building: true,
    // Language
    primary_language: 'english',
    secondary_languages: ['spanish'],
    interpretation_available: false,
    sign_language_interpreter: false,
    // Type & Format
    event_type: 'in_person',
    format: 'tournament_competition',
    sub_category: 'beach_sports',
    // Pricing
    refund_policy: 'no_refund',
    group_discounts: true
  },

  // Virtual Event: Online Class with Equipment Requirements
  'demo-virtual-class': {
    id: 'demo-virtual-class',
    title: 'Online Family Cooking Masterclass',
    description: 'Learn to cook authentic Italian cuisine from the comfort of your home! Interactive virtual class with live instruction and Q&A.',
    location: 'Online via Zoom',
    start_time: '2026-07-28T17:00:00Z',
    end_time: '2026-07-28T19:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=400&fit=crop',
    category: 'food',
    max_participants: 20,
    is_public: true,
    organizer_id: 'organizer-007',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-07T08:00:00Z',
    current_participants: 16,
    is_paid_event: true,
    // ticket_pricing_description: '$35 per household',
    ticketing_website: 'https://www.eventbrite.com/italian-cooking-class',
    // creator: 'Italian Cooking Academy',
    // status: 'published',
    // Audience - FAMILY FRIENDLY
    age_categories: ['kids', 'teens', 'adults'],
    gender_preference: 'all',
    family_friendly: true,
    senior_friendly: true,
    singles_friendly: true,
    couples_oriented: true,
    // Accessibility - FULLY VIRTUAL
    wheelchair_accessible: true,
    mobility_friendly: true,
    hearing_accessible: true,
    vision_accessible: true,
    sensory_friendly: false,
    service_animals_allowed: false,
    accessibility_notes: 'Virtual event with closed captions available. Recipe provided in large print format.',
    // Cultural - ITALIAN CUISINE
    religious_context: [],
    dietary_context: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free'],
    traditional_attire: 'not_applicable',
    // Prerequisites - EQUIPMENT NEEDED
    skill_level: 'beginner',
    prior_experience: 'none_required',
    physical_fitness: 'sedentary',
    equipment_required: ['stable_internet', 'computer_or_tablet', 'kitchen_utensils', 'ingredients_list'],
    dress_code: 'casual',
    prerequisites_notes: 'Ingredient list sent 3 days prior. Basic kitchen equipment needed.',
    // Content
    content_rating: 'all_ages',
    alcohol_served: 'no_alcohol',
    smoking_policy: 'non_smoking',
    noise_level: 'moderate',
    physical_intensity: 'none',
    // Social - GROUP ACTIVITY
    networking_focus: false,
    social_mixer: false,
    ice_breakers: true,
    group_activities: true,
    team_building: false,
    // Language
    primary_language: 'english',
    secondary_languages: ['italian'],
    interpretation_available: false,
    sign_language_interpreter: false,
    // Type & Format
    event_type: 'online',
    format: 'interactive_class',
    sub_category: 'cooking_culinary',
    // Pricing
    refund_policy: 'full_refund_24h',
    group_discounts: true
  }
};

export const getDummyEvent = (eventId: string): Event | undefined => {
  return dummyEvents[eventId];
};

export const isDummyEvent = (eventId: string): boolean => {
  return eventId in dummyEvents;
};
