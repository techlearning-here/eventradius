import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationCard } from '../RegistrationCard';
import { apiClient } from '@/integrations/backend/api';

// Mock the apiClient
jest.mock('@/integrations/backend/api', () => ({
  apiClient: {
    getEventDeal: jest.fn(),
  },
}));

const mockFreeEvent = {
  id: 'free-event-id',
  title: 'Free Event',
  is_paid_event: false,
  is_public: true,
  location: 'Test Location',
  category: 'social',
  organizer_id: 'test-organizer',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockPaidEventNoDeal = {
  id: 'paid-event-id',
  title: 'Paid Event',
  is_paid_event: true,
  is_public: true,
  location: 'Test Location',
  category: 'social',
  ticketing_website: 'https://tickets.example.com',
  organizer_id: 'test-organizer',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockPaidEventWithDeal = {
  id: 'deal-event-id',
  title: 'Event with Deal',
  is_paid_event: true,
  is_public: true,
  location: 'Test Location',
  category: 'social',
  ticketing_website: 'https://tickets.example.com',
  organizer_id: 'test-organizer',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockPaidEventVenueOnly = {
  id: 'venue-event-id',
  title: 'Venue Only Event',
  is_paid_event: true,
  is_public: true,
  location: 'Test Venue',
  category: 'social',
  ticketing_website: null,
  organizer_id: 'test-organizer',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('RegistrationCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Free Events', () => {
    it('should show "Register for Free" heading', () => {
      render(<RegistrationCard event={mockFreeEvent} isRegistered={false} />);
      
      expect(screen.getByText('Register for Free')).toBeInTheDocument();
    });

    it('should show free event highlight', () => {
      render(<RegistrationCard event={mockFreeEvent} isRegistered={false} />);
      
      expect(screen.getByText('Free Event')).toBeInTheDocument();
      expect(screen.getByText('No registration fee required')).toBeInTheDocument();
    });

    it('should not call getEventDeal for free events', () => {
      render(<RegistrationCard event={mockFreeEvent} isRegistered={false} />);
      
      expect(apiClient.getEventDeal).not.toHaveBeenCalled();
    });
  });

  describe('Paid Events without Deals', () => {
    it('should show "Purchase Tickets" heading', () => {
      render(<RegistrationCard event={mockPaidEventNoDeal} isRegistered={false} />);
      
      expect(screen.getByText('Purchase Tickets')).toBeInTheDocument();
    });

    it('should show paid event info with ticketing link', async () => {
      (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
        has_active_deal: false,
      });
      
      render(<RegistrationCard event={mockPaidEventNoDeal} isRegistered={false} />);
      
      await waitFor(() => {
        expect(screen.getByText('Paid Event')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Purchase Tickets')).toBeInTheDocument();
      expect(screen.getByText('Visit Ticketing Site')).toBeInTheDocument();
    });

    it('should show "Pay at Venue" when no ticketing website', async () => {
      (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
        has_active_deal: false,
      });
      
      render(<RegistrationCard event={mockPaidEventVenueOnly} isRegistered={false} />);
      
      await waitFor(() => {
        expect(screen.getByText('Pay at Venue')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Visit Ticketing Site')).not.toBeInTheDocument();
    });
  });

  describe('Paid Events with Active Deals', () => {
    it('should show discount information', async () => {
      (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
        has_active_deal: true,
        discount_percent: 30,
        original_price: 100,
        discounted_price: 70,
        seats_remaining: 15,
        valid_until: '2026-05-15T23:59:59Z',
        code: 'SAVE30',
      });
      
      render(<RegistrationCard event={mockPaidEventWithDeal} isRegistered={false} />);
      
      await waitFor(() => {
        expect(screen.getByText('30% OFF')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Limited time offer!')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument(); // Original
      expect(screen.getByText('$70.00')).toBeInTheDocument(); // Discounted
      expect(screen.getByText('Save $30.00!')).toBeInTheDocument();
    });

    it('should show coupon code with copy button', async () => {
      (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
        has_active_deal: true,
        discount_percent: 25,
        original_price: 80,
        discounted_price: 60,
        code: 'SPRING25',
      });
      
      render(<RegistrationCard event={mockPaidEventWithDeal} isRegistered={false} />);
      
      await waitFor(() => {
        expect(screen.getByText('25% OFF')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Use code at checkout:')).toBeInTheDocument();
      expect(screen.getByText('SPRING25')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('should show seats remaining when limited', async () => {
      (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
        has_active_deal: true,
        discount_percent: 20,
        original_price: 50,
        discounted_price: 40,
        seats_remaining: 5,
      });
      
      render(<RegistrationCard event={mockPaidEventWithDeal} isRegistered={false} />);
      
      await waitFor(() => {
        expect(screen.getByText('Only 5 discounted tickets left!')).toBeInTheDocument();
      });
    });

    it('should show "Claim Discount & Purchase" when ticketing website exists', async () => {
      (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
        has_active_deal: true,
        discount_percent: 30,
        original_price: 100,
        discounted_price: 70,
        code: 'SAVE30',
      });
      
      render(<RegistrationCard event={mockPaidEventWithDeal} isRegistered={false} />);
      
      await waitFor(() => {
        expect(screen.getByText('Claim Discount & Purchase')).toBeInTheDocument();
      });
    });

    it('should show "Claim Discount - Pay at Venue" when no ticketing website', async () => {
      (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
        has_active_deal: true,
        discount_percent: 30,
        original_price: 100,
        discounted_price: 70,
        code: 'SAVE30',
      });
      
      render(<RegistrationCard event={mockPaidEventVenueOnly} isRegistered={false} />);
      
      await waitFor(() => {
        expect(screen.getByText('Claim Discount - Pay at Venue')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      (apiClient.getEventDeal as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch')
      );
      
      render(<RegistrationCard event={mockPaidEventNoDeal} isRegistered={false} />);
      
      await waitFor(() => {
        // Should show standard paid event UI
        expect(screen.getByText('Purchase Tickets')).toBeInTheDocument();
      });
    });
  });

  describe('Copy Coupon Code', () => {
    it('should copy code to clipboard when copy button clicked', async () => {
      const mockWriteText = jest.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });
      
      (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
        has_active_deal: true,
        discount_percent: 30,
        original_price: 100,
        discounted_price: 70,
        code: 'SAVE30',
      });
      
      render(<RegistrationCard event={mockPaidEventWithDeal} isRegistered={false} />);
      
      await waitFor(() => {
        expect(screen.getByText('SAVE30')).toBeInTheDocument();
      });
      
      const copyButton = screen.getByText('Copy');
      await userEvent.click(copyButton);
      
      expect(mockWriteText).toHaveBeenCalledWith('SAVE30');
    });
  });
});
