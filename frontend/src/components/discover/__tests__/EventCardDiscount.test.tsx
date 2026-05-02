import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventCard } from '../EventCard';
import { apiClient } from '@/integrations/backend/api';

// Mock the apiClient
jest.mock('@/integrations/backend/api', () => ({
  apiClient: {
    getEventDeal: jest.fn(),
  },
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockEvent = {
  id: 'test-event-id',
  title: 'Test Event',
  description: 'Test Description',
  is_paid_event: true,
  is_public: true,
  start_time: '2026-05-15T19:00:00Z',
  location: 'Test Location',
  category: 'social',
  image_url: 'https://example.com/image.jpg',
  organizer_id: 'test-organizer',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('EventCard Discount Badge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not show discount badge for free events', async () => {
    const freeEvent = { ...mockEvent, is_paid_event: false };
    
    render(<EventCard event={freeEvent} />);
    
    // Should show FREE badge, not discount
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
    
    // Should not call getEventDeal for free events
    expect(apiClient.getEventDeal).not.toHaveBeenCalled();
  });

  it('should show PAID badge when no active deal exists', async () => {
    (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
      has_active_deal: false,
    });
    
    render(<EventCard event={mockEvent} />);
    
    await waitFor(() => {
      expect(screen.getByText('PAID')).toBeInTheDocument();
    });
    
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
  });

  it('should show discount badge when active deal exists', async () => {
    (apiClient.getEventDeal as jest.Mock).mockResolvedValue({
      has_active_deal: true,
      discount_percent: 30,
      original_price: 100,
      discounted_price: 70,
    });
    
    render(<EventCard event={mockEvent} />);
    
    await waitFor(() => {
      expect(screen.getByText('30% OFF')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('PAID')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    (apiClient.getEventDeal as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );
    
    render(<EventCard event={mockEvent} />);
    
    await waitFor(() => {
      // Should show PAID badge as fallback
      expect(screen.getByText('PAID')).toBeInTheDocument();
    });
    
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
  });

  it('should call getEventDeal with correct event ID', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(apiClient.getEventDeal).toHaveBeenCalledWith('test-event-id');
  });

  it('should render event title and basic info', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });
});
