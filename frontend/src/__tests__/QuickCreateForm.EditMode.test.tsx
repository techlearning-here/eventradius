import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickCreateForm } from '@/components/OrganizerDashboard/QuickCreateForm';
import type { Event } from '@/integrations/backend/api';
import * as useEventsModule from '@/hooks/useEvents';

// Mock the hooks
vi.mock('@/hooks/useEvents', () => ({
  useEventActions: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('QuickCreateForm Edit Mode', () => {
  const mockCreateEvent = vi.fn();
  const mockUpdateEvent = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockEvent: Event = {
    id: 'test-event-123',
    title: 'Test Event',
    description: 'Test Description',
    start_time: '2024-12-20T10:00:00Z',
    end_time: '2024-12-20T12:00:00Z',
    location: 'Test Location',
    event_type: 'in_person',
    image_url: 'https://test-image.jpg',
    is_public: true,
    organizer_id: 'user-123',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    virtual_event_url: undefined
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useEventsModule.useEventActions as any).mockReturnValue({
      createEvent: mockCreateEvent,
      updateEvent: mockUpdateEvent
    });
  });

  describe('Create Mode', () => {
    it('should show "Quick Create" title when creating new event', () => {
      render(
        <QuickCreateForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Quick Create')).toBeInTheDocument();
      expect(screen.getByText('Create an event in under 60 seconds')).toBeInTheDocument();
    });

    it('should call createEvent when submitting new event', async () => {
      mockCreateEvent.mockResolvedValue({ id: 'new-event-123' });

      render(
        <QuickCreateForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in required fields
      fireEvent.change(screen.getByPlaceholderText(/enter event title/i), {
        target: { value: 'New Event Title' }
      });

      fireEvent.change(screen.getByPlaceholderText(/describe your event/i), {
        target: { value: 'Event Description' }
      });

      fireEvent.change(screen.getByPlaceholderText(/venue or address/i), {
        target: { value: 'Event Location' }
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create event/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateEvent).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Mode', () => {
    it('should show "Quick Edit" title when editing existing event', () => {
      render(
        <QuickCreateForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          editingEvent={mockEvent}
        />
      );

      expect(screen.getByText('Quick Edit')).toBeInTheDocument();
      expect(screen.getByText('Update key event details quickly')).toBeInTheDocument();
    });

    it('should pre-populate form with event data in edit mode', () => {
      render(
        <QuickCreateForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          editingEvent={mockEvent}
        />
      );

      // Check that form is pre-populated
      expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Location')).toBeInTheDocument();
    });

    it('should call updateEvent when submitting edited event', async () => {
      mockUpdateEvent.mockResolvedValue({ ...mockEvent, title: 'Updated Title' });

      render(
        <QuickCreateForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          editingEvent={mockEvent}
        />
      );

      // Update title
      const titleInput = screen.getByDisplayValue('Test Event');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /update event/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateEvent).toHaveBeenCalledWith(
          'test-event-123',
          expect.objectContaining({
            title: 'Updated Title',
            description: 'Test Description',
            location: 'Test Location',
            event_type: 'in_person'
          })
        );
      });
    });

    it('should not include default summary/tags when updating', async () => {
      mockUpdateEvent.mockResolvedValue(mockEvent);

      render(
        <QuickCreateForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          editingEvent={mockEvent}
        />
      );

      // Submit without changes
      const submitButton = screen.getByRole('button', { name: /update event/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const updateData = mockUpdateEvent.mock.calls[0][1];
        // Should not include quick-created tags or summary in update
        expect(updateData).not.toHaveProperty('tags');
        expect(updateData).not.toHaveProperty('summary');
        expect(updateData).not.toHaveProperty('status');
      });
    });
  });

  describe('Validation', () => {
    it('should show validation error when title is empty', async () => {
      render(
        <QuickCreateForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Try to submit without title
      const submitButton = screen.getByRole('button', { name: /create event/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateEvent).not.toHaveBeenCalled();
      });
    });

    it('should require start time in both create and edit modes', async () => {
      const { rerender } = render(
        <QuickCreateForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Test create mode
      const submitButton = screen.getByRole('button', { name: /create event/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateEvent).not.toHaveBeenCalled();
      });

      // Test edit mode
      rerender(
        <QuickCreateForm
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          editingEvent={mockEvent}
        />
      );

      const updateButton = screen.getByRole('button', { name: /update event/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateEvent).not.toHaveBeenCalled();
      });
    });
  });
});
