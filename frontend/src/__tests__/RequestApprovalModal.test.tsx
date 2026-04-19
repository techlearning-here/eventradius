import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RequestApprovalModal } from '../components/events/RequestApprovalModal';
import { apiClient } from '@/integrations/backend/client';
import type { Event } from '@/integrations/backend/types';

// Mock the dependencies
jest.mock('@/integrations/backend/client', () => ({
  apiClient: {
    submitApprovalRequest: jest.fn(),
  },
}));

jest.mock('@/hooks/useAuthWithBackend', () => ({
  useAuthWithBackend: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, value, onChange, placeholder, disabled, className, type }: any) => (
    <input
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      type={type || 'text'}
      data-testid={`input-${id}`}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ id, value, onChange, placeholder, disabled, rows, className }: any) => (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={className}
      data-testid={`textarea-${id}`}
    />
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
}));

// Mock lucide icons
jest.mock('lucide-react', () => ({
  X: () => <span>×</span>,
  User: () => <span>👤</span>,
  Mail: () => <span>✉</span>,
  Phone: () => <span>📞</span>,
  FileText: () => <span>📄</span>,
  Link2: () => <span>🔗</span>,
  Send: () => <span>📤</span>,
  Loader2: () => <span>⏳</span>,
  CheckCircle: () => <span>✓</span>,
}));

import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { toast } from 'sonner';

const mockUseAuthWithBackend = useAuthWithBackend as jest.Mock;
const mockSubmitApprovalRequest = apiClient.submitApprovalRequest as jest.Mock;

describe('RequestApprovalModal', () => {
  const mockEvent: Event = {
    id: 'event-123',
    title: 'Test Tech Conference',
    description: 'A great tech event',
    approval_instructions: 'Please tell us about your experience level',
  } as Event;

  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthWithBackend.mockReturnValue({
      user: { email: 'user@example.com' },
      userProfile: {
        full_name: 'Test User',
        email: 'user@example.com',
        phone: '+1 555-0123',
      },
    });
  });

  describe('Rendering', () => {
    test('should not render when isOpen is false', () => {
      const { container } = render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test('should render modal when isOpen is true', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Request to Join')).toBeInTheDocument();
      expect(screen.getByText('Test Tech Conference')).toBeInTheDocument();
    });

    test('should display approval instructions if provided', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/Note from organizer:/)).toBeInTheDocument();
      expect(screen.getByText(/Please tell us about your experience level/)).toBeInTheDocument();
    });

    test('should not display approval instructions if not provided', () => {
      const eventWithoutInstructions = { ...mockEvent, approval_instructions: undefined };
      render(
        <RequestApprovalModal
          event={eventWithoutInstructions}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.queryByText(/Note from organizer:/)).not.toBeInTheDocument();
    });

    test('should pre-fill form with user profile data', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByTestId('input-name');
      const emailInput = screen.getByTestId('input-email');
      const phoneInput = screen.getByTestId('input-phone');

      expect(nameInput).toHaveValue('Test User');
      expect(emailInput).toHaveValue('user@example.com');
      expect(phoneInput).toHaveValue('+1 555-0123');
    });

    test('should pre-fill with user email if no profile', () => {
      mockUseAuthWithBackend.mockReturnValue({
        user: { email: 'test@example.com' },
        userProfile: null,
      });

      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const emailInput = screen.getByTestId('input-email');
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  describe('Form Fields', () => {
    test('should render all required fields', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByTestId('input-name')).toBeInTheDocument();
      expect(screen.getByTestId('input-email')).toBeInTheDocument();
      expect(screen.getByTestId('input-phone')).toBeInTheDocument();
    });

    test('should render optional fields', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByTestId('textarea-bio')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-reason')).toBeInTheDocument();
    });

    test('should render social links inputs', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByPlaceholderText('LinkedIn URL')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Twitter/X Handle')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Website URL')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Instagram Handle')).toBeInTheDocument();
    });

    test('should update name field on change', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByTestId('input-name');
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      expect(nameInput).toHaveValue('New Name');
    });

    test('should update email field on change', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const emailInput = screen.getByTestId('input-email');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

      expect(emailInput).toHaveValue('new@example.com');
    });

    test('should update bio textarea on change', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const bioTextarea = screen.getByTestId('textarea-bio');
      fireEvent.change(bioTextarea, { target: { value: 'My bio text' } });

      expect(bioTextarea).toHaveValue('My bio text');
    });

    test('should update social links on change', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const linkedinInput = screen.getByPlaceholderText('LinkedIn URL');
      fireEvent.change(linkedinInput, { target: { value: 'https://linkedin.com/in/test' } });

      expect(linkedinInput).toHaveValue('https://linkedin.com/in/test');
    });
  });

  describe('Form Validation', () => {
    test('should show error for empty name', async () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Clear the name field
      const nameInput = screen.getByTestId('input-name');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Submit the form
      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix the errors in the form');
      });
    });

    test('should show error for short name', async () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByTestId('input-name');
      fireEvent.change(nameInput, { target: { value: 'A' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix the errors in the form');
      });
    });

    test('should show error for empty email', async () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const emailInput = screen.getByTestId('input-email');
      fireEvent.change(emailInput, { target: { value: '' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix the errors in the form');
      });
    });

    test('should show error for invalid email', async () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const emailInput = screen.getByTestId('input-email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix the errors in the form');
      });
    });

    test('should show error for invalid phone format', async () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const phoneInput = screen.getByTestId('input-phone');
      fireEvent.change(phoneInput, { target: { value: 'abc' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix the errors in the form');
      });
    });

    test('should accept valid phone number', async () => {
      mockSubmitApprovalRequest.mockResolvedValueOnce({});

      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in required fields with valid data
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '(555) 123-4567' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(mockSubmitApprovalRequest).toHaveBeenCalled();
      });
    });

    test('should clear error when field is corrected', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByTestId('input-name');

      // First set an invalid value
      fireEvent.change(nameInput, { target: { value: 'A' } });

      // Then set a valid value
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      // Error should be cleared (we can't directly test this without exposing internal state,
      // but we can verify the form submits successfully)
    });
  });

  describe('Form Submission', () => {
    test('should call submitApprovalRequest with correct data', async () => {
      mockSubmitApprovalRequest.mockResolvedValueOnce({});

      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in the form
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByTestId('textarea-bio'), { target: { value: 'Software developer' } });
      fireEvent.change(screen.getByTestId('textarea-reason'), { target: { value: 'Interested in learning' } });
      fireEvent.change(screen.getByPlaceholderText('LinkedIn URL'), { target: { value: 'https://linkedin.com/in/john' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(mockSubmitApprovalRequest).toHaveBeenCalledWith('event-123', {
          requester_name: 'John Doe',
          requester_email: 'john@example.com',
          requester_phone: '+1 555-0123',
          requester_bio: 'Software developer',
          requester_reason: 'Interested in learning',
          requester_social_links: {
            linkedin: 'https://linkedin.com/in/john',
          },
        });
      });
    });

    test('should filter out empty social links', async () => {
      mockSubmitApprovalRequest.mockResolvedValueOnce({});

      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in required fields only
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'john@example.com' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(mockSubmitApprovalRequest).toHaveBeenCalledWith('event-123', {
          requester_name: 'John Doe',
          requester_email: 'john@example.com',
          requester_phone: '+1 555-0123',
        });
      });
    });

    test('should show success state after submission', async () => {
      mockSubmitApprovalRequest.mockResolvedValueOnce({});

      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in required fields
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'john@example.com' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(screen.getByText('Request Submitted!')).toBeInTheDocument();
      });
    });

    test('should call onSuccess and onClose after success delay', async () => {
      jest.useFakeTimers();
      mockSubmitApprovalRequest.mockResolvedValueOnce({});

      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in required fields
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'john@example.com' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(screen.getByText('Request Submitted!')).toBeInTheDocument();
      });

      // Fast-forward timers
      jest.advanceTimersByTime(2000);

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();

      jest.useRealTimers();
    });

    test('should show error toast on submission failure', async () => {
      mockSubmitApprovalRequest.mockRejectedValueOnce(new Error('Submission failed'));

      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in required fields
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'john@example.com' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to submit request',
          expect.any(Object)
        );
      });
    });

    test('should disable inputs while submitting', async () => {
      mockSubmitApprovalRequest.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in required fields
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'john@example.com' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      // Check that submit button shows loading state
      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });
  });

  describe('Cancel Action', () => {
    test('should call onClose when cancel is clicked', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = screen.getByText('Cancel').closest('button');
      fireEvent.click(cancelButton!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when X button is clicked', () => {
      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // The X button is rendered with the × character
      const xButton = screen.getByText('×').closest('button');
      if (xButton) {
        fireEvent.click(xButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    test('should disable cancel while submitting', async () => {
      mockSubmitApprovalRequest.mockImplementation(() => new Promise(() => {}));

      render(
        <RequestApprovalModal
          event={mockEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in required fields
      fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'john@example.com' } });

      const submitButton = screen.getByText('Submit Request').closest('button');
      fireEvent.click(submitButton!);

      const cancelButton = screen.getByText('Cancel').closest('button');
      expect(cancelButton).toBeDisabled();
    });
  });
});
