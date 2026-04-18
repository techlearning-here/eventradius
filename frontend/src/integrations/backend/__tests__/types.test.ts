import type { 
  Event, 
  EventCreate, 
  EventUpdate, 
  UserProfile,
  RefundPolicy,
} from '../types';

describe('Type definitions', () => {
  describe('Event type', () => {
    it('should have required fields', () => {
      const event: Event = {
        id: '123',
        title: 'Test Event',
        is_public: true,
        organizer_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(event.id).toBe('123');
      expect(event.title).toBe('Test Event');
      expect(event.is_public).toBe(true);
    });

    it('should support optional Quick Create fields', () => {
      const event: Event = {
        id: '123',
        title: 'Test Event',
        is_public: true,
        organizer_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ticket_price: 10.00,
        require_approval: true,
        enable_waitlist: true,
      };

      expect(event.ticket_price).toBe(10.00);
      expect(event.require_approval).toBe(true);
      expect(event.enable_waitlist).toBe(true);
    });

    it('should support optional Event Attributes', () => {
      const event: Event = {
        id: '123',
        title: 'Test Event',
        is_public: true,
        organizer_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        age_categories: ['adults', 'seniors'],
        family_friendly: true,
        wheelchair_accessible: true,
        primary_language: 'en',
        networking_focus: true,
      };

      expect(event.age_categories).toEqual(['adults', 'seniors']);
      expect(event.family_friendly).toBe(true);
      expect(event.wheelchair_accessible).toBe(true);
    });
  });

  describe('EventCreate type', () => {
    it('should allow creating event with minimal fields', () => {
      const create: EventCreate = {
        title: 'New Event',
      };

      expect(create.title).toBe('New Event');
    });

    it('should support all creation fields', () => {
      const create: EventCreate = {
        title: 'Full Event',
        description: 'Description',
        location: 'Location',
        category: 'Tech',
        max_participants: 100,
        is_public: true,
        ticket_price: 25.00,
        require_approval: false,
        enable_waitlist: true,
      };

      expect(create.ticket_price).toBe(25.00);
      expect(create.require_approval).toBe(false);
    });
  });

  describe('EventUpdate type', () => {
    it('should allow partial updates', () => {
      const update: EventUpdate = {
        title: 'Updated Title',
      };

      expect(update.title).toBe('Updated Title');
    });

    it('should allow updating Quick Create fields', () => {
      const update: EventUpdate = {
        ticket_price: 15.00,
        require_approval: true,
        enable_waitlist: false,
      };

      expect(update.ticket_price).toBe(15.00);
    });
  });

  describe('UserProfile type', () => {
    it('should have required fields', () => {
      const user: UserProfile = {
        user_id: 'user-1',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      expect(user.user_id).toBe('user-1');
      expect(user.email).toBe('test@example.com');
    });

    it('should support optional fields', () => {
      const user: UserProfile = {
        user_id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        bio: 'Test bio',
        phone: '+1234567890',
        created_at: new Date().toISOString(),
      };

      expect(user.full_name).toBe('Test User');
    });
  });

  describe('RefundPolicy type', () => {
    it('should accept valid refund policies', () => {
      const policies: RefundPolicy[] = [
        'no_refunds',
        'refund_up_to_7_days',
        'refund_up_to_24_hours',
        'refund_up_to_1_hour',
        'custom',
      ];

      expect(policies).toHaveLength(5);
    });
  });
});
