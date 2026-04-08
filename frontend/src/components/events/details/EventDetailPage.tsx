import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Info, Users, MessageSquare } from 'lucide-react';
import { apiClient } from '@/integrations/backend/api';
import { Navbar } from '../../layout/Navbar';
import { SEOHead } from '../../layout/SEOHead';

// Import all the individual event detail components
import { EventMeta } from '../EventMeta';
import { EventHeader } from '../EventHeader';
import { EventDescription } from '../EventDescription';
import { EventLocation } from '../EventLocation';
import { EventParticipation } from '../EventParticipation';
import { EventRegistration } from '../EventRegistration';
import { EventChat } from '../EventChat';
import { EventCountdown } from '../EventCountdown';
import { AuthSheet } from '../../auth/AuthSheet';

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  category?: string;
  max_participants?: number;
  is_public: boolean;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  current_participants?: number;
  is_paid_event?: boolean;
  ticket_pricing_description?: string;
  ticketing_website?: string;
  timezone?: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  // Event contact info from ContactInfo step
  event_contact_email?: string;
  event_contact_phone?: string;
  event_contact_phone_country_code?: string;
  // Legacy fields for compatibility
  creator?: string;
  date?: string;
  time?: string;
  address?: string;
  background_image_url?: string;
  target_date?: string;
  event_type?: string;
  event_status?: string;
  created_by?: string;
}

export const EventDetailOverlay: React.FC<{ eventId: string; isOpen: boolean; onClose: () => void }> = ({ eventId, isOpen, onClose }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy events for testing - family-oriented small to medium events
  const dummyEvents = {
    // Single Events - In Person
    'demo-single-free': {
      id: 'demo-single-free',
      title: 'Summer Arts & Crafts Workshop',
      description: 'Join us for a fun-filled family arts and crafts workshop! Perfect for parents and children to create beautiful memories together. We\'ll provide all materials and guidance for various craft projects including painting, clay modeling, and seasonal decorations.\n\nActivities:\n- Canvas painting for all ages\n- Clay sculpture making\n- Seasonal craft projects\n- Family collaborative art piece\n- Take-home craft kits\n\nWhat\'s Included:\n- All art supplies and materials\n- Professional art instructor guidance\n- Snacks and refreshments\n- Certificate of participation\n- Display of finished artwork\n\nPerfect for:\n- Families with children ages 5-12\n- Creative bonding time\n- Weekend family activities\n- Art enthusiasts of all levels',
      location: 'Community Arts Center, 123 Main Street, San Francisco, CA 94102',
      start_time: '2026-07-15T10:00:00Z',
      end_time: '2026-07-15T12:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop',
      background_image_url: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=600&fit=crop',
      category: 'art',
      max_participants: 25,
      is_public: true,
      organizer_id: 'organizer-001',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-07T08:00:00Z',
      current_participants: 18,
      timezone: 'America/Los_Angeles',
      organizer_email: 'hello@artscenter.org',
      organizer_phone: '+1 (415) 555-0001',
      organizer_website: 'https://artscenter.org',
      is_paid_event: false,
      ticket_pricing_description: 'Free family workshop!',
      ticketing_website: '',
      creator: 'Community Arts Center',
      date: 'July 15, 2026',
      time: '10:00 AM - 12:00 PM',
      address: 'Community Arts Center, 123 Main Street, San Francisco, CA 94102',
      target_date: '2026-07-15T10:00:00Z',
      event_type: 'in_person',
      event_status: 'published',
      event_contact_email: 'contact@artscenter.org',
      event_contact_phone: '(415) 555-1001',
      event_contact_phone_country_code: '+1'
    },
    
    'demo-single-paid': {
      id: 'demo-single-paid',
      title: 'Family Magic Show & Dinner',
      description: 'Experience an enchanting evening of magic and illusion perfect for the whole family! Professional magician combines comedy, audience participation, and astonishing tricks that will delight children and adults alike.\n\nShow Highlights:\n- Interactive magic tricks\n- Comedy and audience participation\n- Illusions and mind-reading\n- Special effects and surprises\n- Photo opportunities with magician\n\nDinner Menu:\n- Family-style buffet dinner\n- Kid-friendly options\n- Vegetarian and gluten-free choices\n- Dessert and beverages\n\nShow Features:\n- 90-minute performance\n- Suitable for ages 4+\n- Intimate theater setting\n- Meet & greet after show\n- Magic tricks for kids to learn',
      location: 'Magic Theater, 456 Entertainment Avenue, San Francisco, CA 94103',
      start_time: '2026-07-20T18:00:00Z',
      end_time: '2026-07-20T20:30:00Z',
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
      background_image_url: 'https://images.unsplash.com/photo-1516206578862-e7e0033b1f44?w=1200&h=600&fit=crop',
      category: 'party',
      max_participants: 60,
      is_public: true,
      organizer_id: 'organizer-002',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-07T08:00:00Z',
      current_participants: 42,
      timezone: 'America/Los_Angeles',
      organizer_email: 'info@magictheater.com',
      organizer_phone: '+1 (415) 555-0002',
      organizer_website: 'https://magictheater.com',
      is_paid_event: true,
      ticket_pricing_description: 'Adults: $25\nChildren (4-12): $15\nFamily Pack (2 adults + 2 kids): $70',
      ticketing_website: 'https://tickets.magictheater.com',
      creator: 'Magic Theater',
      date: 'July 20, 2026',
      time: '6:00 PM - 8:30 PM',
      address: 'Magic Theater, 456 Entertainment Avenue, San Francisco, CA 94103',
      target_date: '2026-07-20T18:00:00Z',
      event_type: 'in_person',
      event_status: 'published',
      event_contact_email: 'tickets@magictheater.com',
      event_contact_phone: '(415) 555-2002',
      event_contact_phone_country_code: '+1'
    },

    // Single Events - Online
    'demo-online-free': {
      id: 'demo-online-free',
      title: 'Virtual Story Time for Kids',
      description: 'Join our interactive virtual story time session designed for young children! Professional storyteller brings classic tales to life with animated storytelling, songs, and interactive elements that keep kids engaged.\n\nStory Time Features:\n- Classic children\'s stories\n- Interactive storytelling\n- Sing-along songs and rhymes\n- Virtual puppet show segments\n- Movement activities\n- Show and tell opportunities\n\nTechnical Requirements:\n- Stable internet connection\n- Computer or tablet with camera\n- Zoom meeting platform\n- Parent supervision recommended\n\nWhat to Expect:\n- 45-minute interactive session\n- Age-appropriate content (3-7 years)\n- Small group setting (max 15 families)\n- Printable activity sheets\n- Recording available for 48 hours',
      location: 'Online via Zoom',
      start_time: '2026-07-18T15:00:00Z',
      end_time: '2026-07-18T15:45:00Z',
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e4f8db7?w=800&h=400&fit=crop',
      background_image_url: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=1200&h=600&fit=crop',
      category: 'education',
      max_participants: 15,
      is_public: true,
      organizer_id: 'organizer-003',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-07T08:00:00Z',
      current_participants: 12,
      timezone: 'America/Los_Angeles',
      organizer_email: 'stories@kidstime.org',
      organizer_phone: '+1 (415) 555-0003',
      organizer_website: 'https://kidstime.org',
      is_paid_event: false,
      ticket_pricing_description: 'Free virtual story time!',
      ticketing_website: '',
      creator: 'Kids Story Time',
      date: 'July 18, 2026',
      time: '3:00 PM - 3:45 PM',
      address: 'Online via Zoom',
      target_date: '2026-07-18T15:00:00Z',
      event_type: 'online',
      event_status: 'published'
    },

    'demo-online-paid': {
      id: 'demo-online-paid',
      title: 'Online Family Cooking Class',
      description: 'Learn to cook delicious family meals together in our interactive online cooking class! Professional chef guides you step-by-step through preparing a complete meal that everyone will love.\n\nMenu This Week:\n- Homemade Pizza from Scratch\n- Garden Fresh Salad\n- Chocolate Chip Cookies\n- Family-Friendly Mocktails\n\nClass Features:\n- Live instruction with chef\n- Ingredient list sent in advance\n- Step-by-step cooking guidance\n- Q&A sessions throughout\n- Tips for cooking with kids\n- Recipe cards to keep\n\nWhat You\'ll Learn:\n- Basic cooking techniques\n- Kitchen safety tips\n- How to involve kids in cooking\n- Time-saving meal prep\n- Nutrition basics\n- Plating and presentation',
      location: 'Online via Zoom',
      start_time: '2026-07-22T17:00:00Z',
      end_time: '2026-07-22T19:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop',
      background_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop',
      category: 'food',
      max_participants: 20,
      is_public: true,
      organizer_id: 'organizer-004',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-07T08:00:00Z',
      current_participants: 16,
      timezone: 'America/Los_Angeles',
      organizer_email: 'cook@familykitchen.com',
      organizer_phone: '+1 (415) 555-0004',
      organizer_website: 'https://familykitchen.com',
      is_paid_event: true,
      ticket_pricing_description: 'Per Family: $35\nIncludes recipe cards and shopping list',
      ticketing_website: 'https://familykitchen.com/cooking-classes',
      creator: 'Family Kitchen Academy',
      date: 'July 22, 2026',
      time: '5:00 PM - 7:00 PM',
      address: 'Online via Zoom',
      target_date: '2026-07-22T17:00:00Z',
      event_type: 'online',
      event_status: 'published'
    },

    // Hybrid Events
    'demo-hybrid-free': {
      id: 'demo-hybrid-free',
      title: 'Community Wellness Day',
      description: 'Join us for a holistic wellness day focusing on family health and happiness! Both in-person and virtual participation options available.\n\nIn-Person Activities:\n- Yoga classes for all levels\n- Health screenings\n- Nutrition workshops\n- Meditation sessions\n- Kids fitness activities\n\nVirtual Components:\n- Live stream of main presentations\n- Interactive Q&A sessions\n- Virtual wellness consultations\n- Downloadable wellness resources\n- Online community support\n\nSchedule:\n- 9:00 AM: Opening meditation\n- 9:30 AM: Family yoga\n- 10:30 AM: Nutrition workshop\n- 11:30 AM: Health screenings\n- 12:30 PM: Lunch break\n- 1:30 PM: Kids fitness fun\n- 2:30 PM: Closing meditation',
      location: 'Wellness Center, 789 Health Street, San Francisco, CA 94104',
      start_time: '2026-07-25T09:00:00Z',
      end_time: '2026-07-25T15:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
      background_image_url: 'https://images.unsplash.com/photo-1506126617889-137e009812ef?w=1200&h=600&fit=crop',
      category: 'health',
      max_participants: 100,
      is_public: true,
      organizer_id: 'organizer-005',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-07T08:00:00Z',
      current_participants: 67,
      timezone: 'America/Los_Angeles',
      organizer_email: 'wellness@community.org',
      organizer_phone: '+1 (415) 555-0005',
      organizer_website: 'https://communitywellness.org',
      is_paid_event: false,
      ticket_pricing_description: 'Free community wellness event!',
      ticketing_website: '',
      creator: 'Community Wellness Center',
      date: 'July 25, 2026',
      time: '9:00 AM - 3:00 PM',
      address: 'Wellness Center, 789 Health Street, San Francisco, CA 94104',
      target_date: '2026-07-25T09:00:00Z',
      event_type: 'hybrid',
      event_status: 'published'
    },

    // Recurring Events
    'demo-recurring-free': {
      id: 'demo-recurring-free',
      title: 'Weekly Family Sports Day',
      description: 'Join our weekly family sports day! Every Saturday, families gather for fun, non-competitive sports activities that promote fitness and family bonding.\n\nWeekly Activities:\n- Soccer games and drills\n- Relay races\n- Obstacle courses\n- Team building games\n- Sports skills practice\n\nAge Groups:\n- Little athletes (3-6 years)\n- Junior players (7-10 years)\n- Youth teams (11-14 years)\n- Family challenges (all ages)\n\nWhat to Bring:\n- Comfortable athletic clothing\n- Water bottles\n- Sunscreen\n- Positive attitude!\n\nSchedule:\n- Every Saturday, 10:00 AM - 12:00 PM\n- Ongoing through summer\n- Drop-in format, no registration needed\n- Parent participation encouraged',
      location: 'Community Sports Field, 321 Recreation Drive, San Francisco, CA 94105',
      start_time: '2026-07-19T10:00:00Z',
      end_time: '2026-07-19T12:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
      background_image_url: 'https://images.unsplash.com/photo-1461896836838-8f82573e3d5e?w=1200&h=600&fit=crop',
      category: 'sports',
      max_participants: 40,
      is_public: true,
      organizer_id: 'organizer-006',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-07T08:00:00Z',
      current_participants: 28,
      timezone: 'America/Los_Angeles',
      organizer_email: 'sports@community.org',
      organizer_phone: '+1 (415) 555-0006',
      organizer_website: 'https://communitysports.org',
      is_paid_event: false,
      ticket_pricing_description: 'Free weekly family sports!',
      ticketing_website: '',
      creator: 'Community Sports League',
      date: 'July 19, 2026',
      time: '10:00 AM - 12:00 PM',
      address: 'Community Sports Field, 321 Recreation Drive, San Francisco, CA 94105',
      target_date: '2026-07-19T10:00:00Z',
      event_type: 'in_person',
      event_status: 'published'
    },

    'demo-recurring-paid': {
      id: 'demo-recurring-paid',
      title: 'Monthly Music & Movement Class',
      description: 'Discover the joy of music and movement in our monthly family music class! Perfect for toddlers, preschoolers, and their parents to explore rhythm, melody, and creative expression together.\n\nClass Activities:\n- Sing-along songs and rhymes\n- Instrument exploration\n- Movement and dance\n- Musical games\n- Rhythm activities\n- Parent-child bonding\n\nMonthly Themes:\n- July: Summer Songs\n- August: Animal Sounds\n- September: Autumn Rhythms\n- October: Halloween Beats\n\nClass Details:\n- Age-appropriate for 1-5 years\n- Parent participation required\n- Small class sizes (max 12 families)\n- Professional music instructor\n- Instruments provided\n\nSchedule:\n- First Saturday of each month\n- 10:00 AM - 11:00 AM\n- Ongoing enrollment',
      location: 'Music Studio, 654 Melody Lane, San Francisco, CA 94106',
      start_time: '2026-07-05T10:00:00Z',
      end_time: '2026-07-05T11:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
      background_image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=600&fit=crop',
      category: 'music',
      max_participants: 12,
      is_public: true,
      organizer_id: 'organizer-007',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-07T08:00:00Z',
      current_participants: 10,
      timezone: 'America/Los_Angeles',
      organizer_email: 'music@familytunes.com',
      organizer_phone: '+1 (415) 555-0007',
      organizer_website: 'https://familytunes.com',
      is_paid_event: true,
      ticket_pricing_description: 'Per Family: $20 per class\nMonthly Pass (4 classes): $70',
      ticketing_website: 'https://familytunes.com/register',
      creator: 'Family Tunes Music Studio',
      date: 'July 5, 2026',
      time: '10:00 AM - 11:00 AM',
      address: 'Music Studio, 654 Melody Lane, San Francisco, CA 94106',
      target_date: '2026-07-05T10:00:00Z',
      event_type: 'in_person',
      event_status: 'published'
    },

    // Multi-Date Events
    'demo-multi-date-free': {
      id: 'demo-multi-date-free',
      title: 'Summer Reading Program',
      description: 'Join our 3-week summer reading program designed to keep kids engaged with books and learning during summer break!\n\nProgram Structure:\nWeek 1: Adventure Stories\n- Story time sessions\n- Reading challenges\n- Craft activities\n- Book discussions\n\nWeek 2: Science & Discovery\n- Science story time\n- Simple experiments\n- Nature exploration\n- Discovery journals\n\nWeek 3: Creative Arts\n- Art-themed stories\n- Creative writing\n- Illustration workshop\n- Final celebration\n\nProgram Features:\n- Daily reading sessions\n- Weekly themes and activities\n- Reading logs and prizes\n- Family reading time\n- Final celebration party\n\nSchedule:\n- July 10-30, 2026\n- Monday-Friday, 10:00 AM - 12:00 PM\n- Ages 6-10\n- Free books and materials',
      location: 'Public Library, 987 Book Street, San Francisco, CA 94107',
      start_time: '2026-07-10T10:00:00Z',
      end_time: '2026-07-30T12:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
      background_image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e4f8db7?w=1200&h=600&fit=crop',
      category: 'education',
      max_participants: 30,
      is_public: true,
      organizer_id: 'organizer-008',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-07T08:00:00Z',
      current_participants: 24,
      timezone: 'America/Los_Angeles',
      organizer_email: 'reading@publiclibrary.org',
      organizer_phone: '+1 (415) 555-0008',
      organizer_website: 'https://publiclibrary.org',
      is_paid_event: false,
      ticket_pricing_description: 'Free summer reading program!',
      ticketing_website: '',
      creator: 'Public Library',
      date: 'July 10-30, 2026',
      time: '10:00 AM - 12:00 PM',
      address: 'Public Library, 987 Book Street, San Francisco, CA 94107',
      target_date: '2026-07-10T10:00:00Z',
      event_type: 'in_person',
      event_status: 'published'
    },

    'demo-multi-date-paid': {
      id: 'demo-multi-date-paid',
      title: 'Weekend Drama Workshop Series',
      description: 'Explore the world of theater in our comprehensive 4-weekend drama workshop series! Perfect for aspiring young actors and theater enthusiasts.\n\nWorkshop Schedule:\nWeekend 1: Introduction to Acting\n- Basic acting techniques\n- Voice and diction\n- Stage presence\n- Improvisation games\n\nWeekend 2: Character Development\n- Creating believable characters\n- Emotional expression\n- Physical comedy\n- Scene study\n\nWeekend 3: Performance Skills\n- Script analysis\n- Memorization techniques\n- Stage direction\n- Ensemble work\n\nWeekend 4: Final Showcase\n- Rehearsal and preparation\n- Costume and makeup basics\n- Final performance for families\n- Certificate ceremony\n\nProgram Features:\n- Professional theater instructor\n- Small group instruction\n- Individual attention\n- Performance opportunities\n- Family showcase on final day\n\nSchedule:\n- Four consecutive weekends\n- Saturday & Sunday, 1:00 PM - 4:00 PM\n- Ages 8-14\n- All experience levels welcome',
      location: 'Community Theater, 147 Stage Avenue, San Francisco, CA 94108',
      start_time: '2026-07-08T13:00:00Z',
      end_time: '2026-07-31T16:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1503095396547-807759245b35?w=800&h=400&fit=crop',
      background_image_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&h=600&fit=crop',
      category: 'art',
      max_participants: 15,
      is_public: true,
      organizer_id: 'organizer-009',
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-07T08:00:00Z',
      current_participants: 12,
      timezone: 'America/Los_Angeles',
      organizer_email: 'drama@communitytheater.org',
      organizer_phone: '+1 (415) 555-0009',
      organizer_website: 'https://communitytheater.org',
      is_paid_event: true,
      ticket_pricing_description: 'Full Workshop Series: $150\nIncludes all materials and final performance',
      ticketing_website: 'https://communitytheater.org/drama-workshop',
      creator: 'Community Theater',
      date: 'July 8-31, 2026',
      time: '1:00 PM - 4:00 PM',
      address: 'Community Theater, 147 Stage Avenue, San Francisco, CA 94108',
      target_date: '2026-07-08T13:00:00Z',
      event_type: 'in_person',
      event_status: 'published'
    }
  };

  const fetchEvent = useCallback(async () => {
    try {
      let data;
      
      // Use dummy event if eventId matches any demo event IDs
      if (dummyEvents[eventId as keyof typeof dummyEvents]) {
        data = dummyEvents[eventId as keyof typeof dummyEvents];
      } else {
        data = eventId
          ? await apiClient.getEvent(eventId)
          : await apiClient.getEvents({ limit: 1 }).then(events => events[0]);
      }

      if (data) {
        setEvent(data);
        setError(null);
      } else {
        setEvent(null);
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const checkRegistration = useCallback(async () => {
    if (!eventId) return;
    try {
      // Use backend API to check registration
      const registrations = await apiClient.getUserEvents();
      const isEventRegistered = registrations.participating.some(event => event.id === eventId);
      setIsRegistered(isEventRegistered);
    } catch (error) {
      console.error('Error checking registration:', error);
      setIsRegistered(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (isOpen) {
      fetchEvent();
      checkRegistration();
    }
  }, [eventId, isOpen, fetchEvent, checkRegistration]);

  const handleGetDirections = () => {
    if (event) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.address)}`, '_blank');
    }
  };

  // Show chat for events that have/had preview type or have messages
  const showChat = event && (event.event_type === 'preview' || event.event_status === 'collecting_interest');

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-background to-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-8xl max-h-[98vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            console.log('Close button clicked');
            e.preventDefault();
            e.stopPropagation();
            console.log('Calling onClose function');
            onClose();
            console.log('onClose called');
          }}
          className="absolute top-6 right-6 z-50 text-muted-foreground hover:text-foreground transition-all duration-200 p-3 rounded-2xl hover:bg-background/80 backdrop-blur-sm border border-transparent hover:border-border/50 group bg-background/50"
          title="Close event details"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title Bar */}
        <div className="bg-gradient-to-r from-background via-background/95 to-background border-b border-border/50 backdrop-blur-sm px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Events</span>
              </button>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="text-sm font-medium text-foreground capitalize px-2 py-1 bg-primary/10 text-primary rounded-md">{event?.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section with Background */}
        <div className="relative h-80 md:h-96 overflow-hidden">
          {/* Loading State for Hero Image */}
          {loading && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 animate-pulse z-10">
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-lg">Loading...</div>
              </div>
            </div>
          )}
          
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105 transition-all duration-700"
            style={{ 
              backgroundImage: event?.background_image_url 
                ? `url("${event.background_image_url}")` 
                : `url("https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=600&fit=crop")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          
          {/* Hero Content Container - Transparent */}
          <div className="absolute inset-0 z-20 flex items-end">
            <div className="w-full">
              <div className="p-8">
                <div className="max-w-3xl">
                  {/* Event Type Badge */}
                  {event?.event_type && (
                    <span className="inline-block px-4 py-2 bg-white/95 backdrop-blur-sm text-primary text-sm font-semibold rounded-full mb-4 border border-white/30 shadow-lg">
                      {event.event_type === 'in_person' ? 'In Person Event' : event.event_type}
                    </span>
                  )}
                  
                  {event?.is_public && (
                    <span className="px-4 py-2 bg-white/30 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/50 shadow-lg ml-4">
                      Public Event
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Title Section */}
        <div className="bg-background border-b border-border">
          <div className="p-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {event?.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-lg">
              <span className="font-medium">By {event?.creator || event?.organizer_email}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-foreground text-2xl">Loading...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h1 className="text-4xl font-medium mb-4">Error</h1>
              <p className="text-lg text-muted-foreground mb-8">{error}</p>
              <button onClick={onClose} className="px-6 py-3 bg-foreground text-background border border-foreground hover:opacity-90 transition-colors uppercase text-sm font-medium">
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Quick Info Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Date</div>
                  <div className="text-lg text-muted-foreground">
                    {event?.date || new Date(event?.start_time || event?.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Location</div>
                  <div className="text-lg text-muted-foreground">
                    {event?.location || event?.address}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Attendees & Category</div>
                  <div className="text-lg text-muted-foreground">
                    {event?.current_participants || 0} / {event?.max_participants || 'Unlimited'}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {event?.category || 'Event'} • {event?.is_public ? 'Public' : 'Private'}
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Section */}
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      About This Event
                    </h2>
                    <div className="prose prose-lg max-w-none">
                      {event.description?.split('\n').map((paragraph, index) => (
                        <p key={index} className="text-muted-foreground leading-relaxed mb-4 text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>

                  {/* Location Section */}
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Location & Venue
                    </h2>
                    <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Event Location</h3>
                          <p className="text-muted-foreground mb-4">{event.location || event.address}</p>
                          <button
                            onClick={handleGetDirections}
                            className="text-primary hover:text-primary/80 font-medium text-sm border-b border-primary/30 hover:border-primary/80 transition-colors"
                          >
                            Get Directions
                          </button>
                        </div>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-border">
                        <iframe
                          src={`https://www.google.com/maps?q=${encodeURIComponent(event.location || event.address)}&output=embed`}
                          className="w-full h-[300px] border-0"
                          loading="lazy"
                          title="Event location map"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Organizer Section */}
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Event Organizer
                    </h2>
                    <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{event.creator || 'Event Organizer'}</h3>
                          <p className="text-muted-foreground">Event Host</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Event Contact Phone from ContactInfo step */}
                        {event.event_contact_phone && (
                          <a 
                            href={`tel:${event.event_contact_phone_country_code || ''}${event.event_contact_phone}`}
                            className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Event Phone</p>
                              <p className="font-semibold text-gray-900">
                                {event.event_contact_phone_country_code || ''} {event.event_contact_phone}
                              </p>
                            </div>
                          </a>
                        )}
                        
                        {/* Event Contact Email from ContactInfo step */}
                        {event.event_contact_email && (
                          <a 
                            href={`mailto:${event.event_contact_email}`}
                            className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Event Email</p>
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{event.event_contact_email}</p>
                            </div>
                          </a>
                        )}
                        
                        {/* Organizer Email (fallback) */}
                        {!event.event_contact_email && event.organizer_email && (
                          <a 
                            href={`mailto:${event.organizer_email}`}
                            className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Organizer Email</p>
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{event.organizer_email}</p>
                            </div>
                          </a>
                        )}
                        
                        {/* Organizer Website */}
                        {event.organizer_website && (
                          <a 
                            href={event.organizer_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Website</p>
                              <p className="font-semibold text-gray-900 text-sm">{new URL(event.organizer_website).hostname.replace('www.', '')}</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column - Registration & Actions */}
                <div className="space-y-6">
                  {/* Registration Card */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {event.is_paid_event ? 'Purchase Tickets' : 'Register for Free'}
                    </h3>
                    
                    {/* Free Event Highlight */}
                    {!event.is_paid_event && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-green-600">Free Event</div>
                            <div className="text-sm text-muted-foreground">No registration fee required</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Paid Event Ticketing */}
                    {event.is_paid_event && (
                      <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-amber-600">Paid Event</div>
                            <div className="text-sm text-muted-foreground">Tickets available for purchase</div>
                          </div>
                        </div>
                        {event.ticket_pricing_description && (
                          <p className="text-sm text-muted-foreground mb-3">{event.ticket_pricing_description}</p>
                        )}
                      </div>
                    )}
                    
                    <EventParticipation eventId={event.id} />
                    
                    {/* External Ticketing Links for Paid Events */}
                    {event.is_paid_event && (
                      <div className="mt-4 space-y-2">
                        <button className="w-full flex items-center justify-center gap-2 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors font-medium">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Purchase Tickets
                        </button>
                        {event.ticketing_website && (
                          <a 
                            href={event.ticketing_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 p-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl transition-colors font-medium"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit Ticketing Site
                          </a>
                        )}
                      </div>
                    )}
                    
                    {event.max_participants && (
                      <div className="mt-4 p-3 bg-background/50 rounded-xl border border-border/50">
                        <div className="flex justify-between items-center text-muted-foreground text-sm mb-2">
                          <span>Spots Available</span>
                          <span className="font-semibold text-foreground">{event.max_participants - (event.current_participants || 0)}</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all duration-300"
                            style={{ width: `${((event.current_participants || 0) / event.max_participants) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                        </svg>
                        <span className="font-medium">Share Event</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span className="font-medium">Save Event</span>
                      </button>
                    </div>
                  </div>

                  {/* Event Stats */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Event Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Capacity</span>
                        <span className="font-semibold text-foreground">{event.max_participants || 'Unlimited'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Registered</span>
                        <span className="font-semibold text-foreground">{event.current_participants || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Event Type</span>
                        <span className="font-semibold text-foreground">{event.is_public ? 'Public' : 'Private'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat for preview events */}
              {showChat && (
                <div className="mt-8">
                  <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Event Discussion
                    </h3>
                    <EventChat eventId={event.id} eventCreatorId={event.created_by} eventStatus={event.event_status} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const EventDetailPage: React.FC<{ eventId?: string }> = ({ eventId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      const data = eventId || urlId
        ? await apiClient.getEvent(eventId || urlId)
        : await apiClient.getEvents({ limit: 1 }).then(events => events[0]);

      if (data) {
        setEvent(data);
        setError(null);
      } else {
        setError('Event not found');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching event:', error);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId || urlId]);

  const checkRegistration = useCallback(async () => {
    const currentId = eventId || urlId;
    if (!currentId) return;
    try {
      // Use backend API to check registration
      const registrations = await apiClient.getUserEvents();
      const isEventRegistered = registrations.participating.some(event => event.id === currentId);
      setIsRegistered(isEventRegistered);
    } catch (error) {
      console.error('Error checking registration:', error);
      setIsRegistered(false);
    }
  }, [eventId || urlId]);

  useEffect(() => {
    fetchEvent();
    checkRegistration();
  }, [eventId || urlId, fetchEvent, checkRegistration]);

  const handleGetDirections = () => {
    if (event) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.address)}`, '_blank');
    }
  };

  // Show chat for events that have/had preview type or have messages
  const showChat = event && (event.event_type === 'preview' || event.event_status === 'collecting_interest');

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-foreground text-2xl">Loading...</div>
    </div>;
  }

  if (notFound || !event) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background px-4">
        <SEOHead title="Event Not Found" description="The event you're looking for doesn't exist or has been removed." />
        <Navbar />
        <div className="text-center mt-20">
          <h1 className="text-4xl font-medium mb-4">Event Not Found</h1>
          <p className="text-lg text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/discover')}
            className="px-6 py-3 bg-foreground text-background border border-foreground hover:opacity-90 transition-colors uppercase text-sm font-medium">
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return <>
    <SEOHead
      title={event.title}
      description={event.description?.substring(0, 160)}
      image={event.background_image_url}
      keywords={`event, ${event.title}, ${event.address}, community event`}
    />
    <Navbar />
    
    <main className="flex h-screen justify-center items-start w-full relative bg-background mx-auto my-0 max-lg:flex-col max-lg:h-auto max-lg:flex-col max-lg:h-auto">
      <div className="flex flex-col justify-end items-start fixed h-screen w-[calc(100%-540px)] pl-[49px] pr-[590px] pt-[calc(100vh-97px)] pb-12 left-0 top-0 overflow-hidden max-lg:relative max-lg:w-full max-lg:h-[400px] max-lg:bg-cover max-lg:bg-center max-lg:pt-80 max-lg:pb-6 max-lg:px-4 max-lg:right-0 max-sm:h-[300px] max-sm:pt-60 max-sm:pb-6 max-sm:px-4" role="img" aria-label="Event background image">
        <div className="absolute inset-0 animate-[zoom-in_1.2s_ease-out_forwards]" style={{
          backgroundImage: event.background_image_url 
            ? `url("${event.background_image_url}")` 
            : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          backgroundSize: event.background_image_url ? 'cover' : 'auto',
          backgroundPosition: 'center'
        }}></div>
        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <EventCountdown targetDate={new Date(event.target_date)} />
        </div>
      </div>

      <aside className="flex w-[540px] flex-col justify-start items-start fixed h-screen box-border right-0 top-0 bg-background overflow-y-auto max-lg:relative max-lg:w-full max-lg:h-auto max-lg:right-auto max-lg:top-0 max-lg:overflow-y-visible">
        <div className="flex w-full flex-col items-start gap-10 relative p-10 pb-24 max-lg:w-full max-lg:px-4 max-lg:py-6 max-lg:pb-6 max-lg:gap-8 opacity-0 animate-fade-in [animation-delay:200ms]">
          {/* Event type badge */}
          {event.event_type === 'preview' && (
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-600 border border-blue-500/30">
              Preview Event · {event.event_status === 'collecting_interest' ? 'Collecting Interest' : event.event_status}
            </span>
          )}

          <div className="flex flex-col items-start gap-4 self-stretch relative">
            <EventMeta 
              date={event.date} 
              time={event.time} 
              timezone={event.timezone} 
              contact={{
                email: event.organizer_email,
                phone: event.organizer_phone,
                website: event.organizer_website
              }} 
            />
            <EventHeader title={event.title} creator={event.creator} />
          </div>

          <EventDescription description={event.description} />
          <EventLocation address={event.address} onGetDirections={handleGetDirections} />

          {/* Participation */}
          <EventParticipation eventId={event.id} onAuthRequired={() => setIsAuthOpen(true)} />

          {/* Chat for preview events */}
          {showChat && (
            <EventChat eventId={event.id} eventCreatorId={event.created_by} eventStatus={event.event_status} />
          )}
        </div>

        <div className="fixed bottom-0 right-0 w-[540px] bg-background py-6 border-t border-border max-lg:relative max-lg:w-full max-lg:py-6 max-lg:border-t-0">
          <div className="px-10 max-lg:px-4">
            <EventRegistration
              eventId={event.id}
              onRegister={checkRegistration}
              isRegistered={isRegistered}
              onAuthRequired={() => setIsAuthOpen(true)}
              targetDate={new Date(event.target_date)}
              className="opacity-0 animate-fade-in [animation-delay:400ms]"
            />
          </div>
        </div>
      </aside>
    </main>
    <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
  </>;
};
