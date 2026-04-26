import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApprovalRequestCard } from '../components/OrganizerDashboard/ApprovalRequestCard';
import type { ApprovalRequestResponse } from '@/integrations/backend/types';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <span data-testid="user-icon">User</span>,
  Mail: () => <span data-testid="mail-icon">Mail</span>,
  Phone: () => <span data-testid="phone-icon">Phone</span>,
  Link2: () => <span data-testid="link-icon">Link</span>,
  ChevronDown: () => <span data-testid="chevron-down">▼</span>,
  ChevronUp: () => <span data-testid="chevron-up">▲</span>,
  Loader2: () => <span data-testid="loader">Loading...</span>,
  CheckCircle: () => <span data-testid="check-icon">✓</span>,
  XCircle: () => <span data-testid="x-icon">✗</span>,
  ListOrdered: () => <span data-testid="list-icon">☰</span>,
  Clock: () => <span data-testid="clock-icon">◷</span>,
}));

describe('ApprovalRequestCard', () => {
  const mockRequest: ApprovalRequestResponse = {
    id: 'req-123',
    event_id: 'event-456',
    user_id: 'user-789',
    approval_status: 'pending',
    requester_name: 'John Doe',
    requester_email: 'john@example.com',
    requester_phone: '+1 (555) 123-4567',
    requester_bio: 'Software developer interested in tech events',
    requester_reason: 'Want to learn about new technologies',
    requester_social_links: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
    is_waitlisted: false,
    waitlist_position: undefined,
    registered_at: '2024-01-15T10:30:00Z',
    approved_at: undefined,
    rejection_reason: undefined,
  };

  const mockOnToggleExpand = jest.fn();
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render requester name and email', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={false}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    test('should display pending status badge', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={false}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    test('should display approved status badge', () => {
      const approvedRequest = { ...mockRequest, approval_status: 'approved' as const };
      render(
        <ApprovalRequestCard
          request={approvedRequest}
          isExpanded={false}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    test('should display declined status badge', () => {
      const rejectedRequest = { ...mockRequest, approval_status: 'rejected' as const };
      render(
        <ApprovalRequestCard
          request={rejectedRequest}
          isExpanded={false}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('Declined')).toBeInTheDocument();
    });

    test('should display waitlisted status with position', () => {
      const waitlistedRequest = {
        ...mockRequest,
        approval_status: 'waitlisted' as const,
        waitlist_position: 3,
      };
      render(
        <ApprovalRequestCard
          request={waitlistedRequest}
          isExpanded={false}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('Waitlisted #3')).toBeInTheDocument();
    });

    test('should show first letter of name in avatar', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={false}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    test('should show ? for unknown name', () => {
      const unknownRequest = { ...mockRequest, requester_name: null };
      render(
        <ApprovalRequestCard
          request={unknownRequest}
          isExpanded={false}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('?')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse', () => {
    test('should call onToggleExpand when expand button is clicked', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={false}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      const expandButton = screen.getByText('▼').closest('button');
      fireEvent.click(expandButton!);

      expect(mockOnToggleExpand).toHaveBeenCalledTimes(1);
    });

    test('should show chevron up when expanded', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('▲')).toBeInTheDocument();
    });

    test('should show expanded details when expanded', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Software developer interested in tech events')).toBeInTheDocument();
      expect(screen.getByText('Want to learn about new technologies')).toBeInTheDocument();
    });

    test('should show social links when expanded', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('Social Links')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    test('should not show additional info section if no bio or reason', () => {
      const minimalRequest = {
        ...mockRequest,
        requester_bio: undefined,
        requester_reason: undefined,
      };
      render(
        <ApprovalRequestCard
          request={minimalRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.queryByText('Additional Information')).not.toBeInTheDocument();
    });

    test('should not show phone if not provided', () => {
      const noPhoneRequest = { ...mockRequest, requester_phone: undefined };
      const { container } = render(
        <ApprovalRequestCard
          request={noPhoneRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      // Phone icon should not be in the contact section
      const contactSection = screen.getByText('Contact Information').parentElement;
      expect(contactSection?.querySelector('[data-testid="phone-icon"]')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    test('should show action buttons for pending requests when expanded', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText('Decline')).toBeInTheDocument();
      expect(screen.getByText('Waitlist')).toBeInTheDocument();
      expect(screen.getByText('Approve')).toBeInTheDocument();
    });

    test('should not show action buttons for approved requests', () => {
      const approvedRequest = { ...mockRequest, approval_status: 'approved' as const };
      render(
        <ApprovalRequestCard
          request={approvedRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
      expect(screen.queryByText('Decline')).not.toBeInTheDocument();
    });

    test('should call onAction with reject when Decline is clicked', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      const declineButton = screen.getByText('Decline').closest('button');
      fireEvent.click(declineButton!);

      expect(mockOnAction).toHaveBeenCalledWith('req-123', 'reject');
    });

    test('should call onAction with approve when Approve is clicked', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      const approveButton = screen.getByText('Approve').closest('button');
      fireEvent.click(approveButton!);

      expect(mockOnAction).toHaveBeenCalledWith('req-123', 'approve');
    });

    test('should call onAction with waitlist when Waitlist is clicked', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      const waitlistButton = screen.getByText('Waitlist').closest('button');
      fireEvent.click(waitlistButton!);

      expect(mockOnAction).toHaveBeenCalledWith('req-123', 'waitlist');
    });

    test('should disable buttons when processing', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId="req-123"
        />
      );

      const buttons = [
        screen.getByText('Decline').closest('button'),
        screen.getByText('Waitlist').closest('button'),
        screen.getByText('Approve').closest('button'),
      ];

      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('should show loading spinner when processing this request', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId="req-123"
        />
      );

      expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
    });

    test('should not disable buttons when processing different request', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId="other-req"
        />
      );

      const declineButton = screen.getByText('Decline').closest('button');
      expect(declineButton).not.toBeDisabled();
    });
  });

  describe('Request Date', () => {
    test('should display formatted request date when expanded', () => {
      render(
        <ApprovalRequestCard
          request={mockRequest}
          isExpanded={true}
          onToggleExpand={mockOnToggleExpand}
          onAction={mockOnAction}
          processingId={null}
        />
      );

      expect(screen.getByText(/Requested:/)).toBeInTheDocument();
    });
  });
});
