import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCardContainer } from '@/components/OrganizerDashboard/EventCardContainer';
import type { Event } from '@/integrations/backend/api';

describe('EventCardContainer Edit Dropdown', () => {
  const mockOnPreview = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnQuickEdit = vi.fn();
  const mockOnDetailedEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const mockEvent: Event = {
    id: 'test-event-123',
    title: 'Test Event',
    is_public: true,
    organizer_id: 'user-123',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Edit Button Behavior', () => {
    it('should show edit button with legacy onEdit handler only', () => {
      render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      const editButton = screen.getByTitle('Edit Options');
      expect(editButton).toBeInTheDocument();
      
      // Should not show dropdown chevron
      expect(screen.queryByTestId('chevron-down')).not.toBeInTheDocument();
    });

    it('should show dropdown when both quick and detailed edit handlers provided', () => {
      render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onQuickEdit={mockOnQuickEdit}
          onDetailedEdit={mockOnDetailedEdit}
          onDelete={mockOnDelete}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      const editButton = screen.getByTitle('Edit Options');
      expect(editButton).toBeInTheDocument();

      // Click to open dropdown
      fireEvent.click(editButton);

      // Should show dropdown options
      expect(screen.getByText('Quick Edit')).toBeInTheDocument();
      expect(screen.getByText('Detailed Edit')).toBeInTheDocument();
    });

    it('should trigger quick edit when clicking Quick Edit option', () => {
      render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onQuickEdit={mockOnQuickEdit}
          onDetailedEdit={mockOnDetailedEdit}
          onDelete={mockOnDelete}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      // Open dropdown
      const editButton = screen.getByTitle('Edit Options');
      fireEvent.click(editButton);

      // Click Quick Edit
      const quickEditOption = screen.getByText('Quick Edit');
      fireEvent.click(quickEditOption);

      expect(mockOnQuickEdit).toHaveBeenCalledTimes(1);
      expect(mockOnDetailedEdit).not.toHaveBeenCalled();
    });

    it('should trigger detailed edit when clicking Detailed Edit option', () => {
      render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onQuickEdit={mockOnQuickEdit}
          onDetailedEdit={mockOnDetailedEdit}
          onDelete={mockOnDelete}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      // Open dropdown
      const editButton = screen.getByTitle('Edit Options');
      fireEvent.click(editButton);

      // Click Detailed Edit
      const detailedEditOption = screen.getByText('Detailed Edit');
      fireEvent.click(detailedEditOption);

      expect(mockOnDetailedEdit).toHaveBeenCalledTimes(1);
      expect(mockOnQuickEdit).not.toHaveBeenCalled();
    });

    it('should close dropdown when clicking outside', () => {
      render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onQuickEdit={mockOnQuickEdit}
          onDetailedEdit={mockOnDetailedEdit}
          onDelete={mockOnDelete}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      // Open dropdown
      const editButton = screen.getByTitle('Edit Options');
      fireEvent.click(editButton);

      // Verify dropdown is open
      expect(screen.getByText('Quick Edit')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      // Dropdown should be closed
      expect(screen.queryByText('Quick Edit')).not.toBeInTheDocument();
    });
  });

  describe('Styling for Quick-Created Events', () => {
    it('should apply amber styling for quick-created events', () => {
      render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onQuickEdit={mockOnQuickEdit}
          onDetailedEdit={mockOnDetailedEdit}
          onDelete={mockOnDelete}
          isQuickCreated={true}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      const editButton = screen.getByTitle('Edit Options');
      expect(editButton).toHaveClass('text-amber-500');
    });

    it('should apply standard styling for regular events', () => {
      render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onQuickEdit={mockOnQuickEdit}
          onDetailedEdit={mockOnDetailedEdit}
          onDelete={mockOnDelete}
          isQuickCreated={false}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      const editButton = screen.getByTitle('Edit Options');
      expect(editButton).toHaveClass('text-muted-foreground');
    });

    it('should show Zap icon overlay for quick-created events', () => {
      const { container } = render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onQuickEdit={mockOnQuickEdit}
          onDetailedEdit={mockOnDetailedEdit}
          onDelete={mockOnDelete}
          isQuickCreated={true}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      // Zap icon should be present
      const zapIcon = container.querySelector('[class*="zap"]');
      expect(zapIcon).toBeInTheDocument();
    });
  });

  describe('Preview and Delete Buttons', () => {
    it('should trigger preview when clicking preview button', () => {
      render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onQuickEdit={mockOnQuickEdit}
          onDetailedEdit={mockOnDetailedEdit}
          onDelete={mockOnDelete}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      const previewButton = screen.getByTitle('Preview Event');
      fireEvent.click(previewButton);

      expect(mockOnPreview).toHaveBeenCalledTimes(1);
    });

    it('should trigger delete when clicking delete button', () => {
      render(
        <EventCardContainer
          onPreview={mockOnPreview}
          onQuickEdit={mockOnQuickEdit}
          onDetailedEdit={mockOnDetailedEdit}
          onDelete={mockOnDelete}
        >
          <div>Event Content</div>
        </EventCardContainer>
      );

      const deleteButton = screen.getByTitle('Delete Event');
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should not show buttons when handlers not provided', () => {
      render(
        <EventCardContainer>
          <div>Event Content</div>
        </EventCardContainer>
      );

      expect(screen.queryByTitle('Preview Event')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Delete Event')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Edit Options')).not.toBeInTheDocument();
    });
  });
});
