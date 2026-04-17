import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareEventModal } from '../ShareEventModal';
import { SITE_CONFIG } from '@/config/site';
import { Event } from '../../EventDetail/types';

// Mock the useShare hook
const mockCopyLink = jest.fn<Promise<boolean>, []>();
const mockShareNative = jest.fn<Promise<boolean>, []>();
const mockShareToFacebook = jest.fn<void, []>();
const mockShareToWhatsApp = jest.fn<void, []>();
const mockShareToInstagram = jest.fn<Promise<boolean>, []>();
const mockShareViaEmail = jest.fn<void, []>();

jest.mock('@/hooks/useShareSimple', () => ({
  useShare: jest.fn(() => ({
    copyLink: mockCopyLink,
    shareNative: mockShareNative,
    shareToFacebook: mockShareToFacebook,
    shareToWhatsApp: mockShareToWhatsApp,
    shareToInstagram: mockShareToInstagram,
    shareViaEmail: mockShareViaEmail,
    isCopied: false,
    isNativeSupported: true,
  })),
}));

const mockEvent: Partial<Event> = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Annual Tech Conference',
  description: 'A great tech event about innovation',
  start_time: '2026-06-15T10:00:00Z',
  location: 'San Francisco, CA',
  category: 'technology',
};

const mockOnClose = jest.fn();

describe('ShareEventModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Share Event')).toBeInTheDocument();
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Send via Email')).toBeInTheDocument();
    expect(screen.getByText(`${SITE_CONFIG.name} · ${SITE_CONFIG.tagline}`)).toBeInTheDocument();
  });

  it('calls onClose when clicking the X button', () => {
    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop', () => {
    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const backdrop = screen.getByText('Share Event').closest('div[class*="fixed"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking modal content', () => {
    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const modalContent = screen.getByText('Share Event').closest('div[class*="bg-background"]');
    if (modalContent) {
      fireEvent.click(modalContent);
    }

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls copyLink when clicking Copy Link button', async () => {
    mockCopyLink.mockResolvedValueOnce(true);

    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy link/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockCopyLink).toHaveBeenCalledTimes(1);
    });
  });

  it('calls shareNative when clicking Share button (mobile)', async () => {
    mockShareNative.mockResolvedValueOnce(true);

    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const shareButton = screen.getByRole('button', { name: /^share$/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShareNative).toHaveBeenCalledTimes(1);
    });
  });

  it('calls shareToFacebook when clicking Facebook button', () => {
    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const facebookButton = screen.getByRole('button', { name: /facebook/i });
    fireEvent.click(facebookButton);

    expect(mockShareToFacebook).toHaveBeenCalledTimes(1);
  });

  it('calls shareToWhatsApp when clicking WhatsApp button', () => {
    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
    fireEvent.click(whatsappButton);

    expect(mockShareToWhatsApp).toHaveBeenCalledTimes(1);
  });

  it('calls shareToInstagram when clicking Instagram button', async () => {
    mockShareToInstagram.mockResolvedValueOnce(true);

    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const instagramButton = screen.getByRole('button', { name: /instagram/i });
    fireEvent.click(instagramButton);

    await waitFor(() => {
      expect(mockShareToInstagram).toHaveBeenCalledTimes(1);
    });
  });

  it('calls shareViaEmail when clicking Email button', () => {
    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const emailButton = screen.getByRole('button', { name: /email/i });
    fireEvent.click(emailButton);

    expect(mockShareViaEmail).toHaveBeenCalledTimes(1);
  });

  it('closes modal when pressing Escape key', () => {
    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('prevents body scroll when modal is open', () => {
    render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal is closed', () => {
    const { unmount } = render(
      <ShareEventModal
        event={mockEvent as Event}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });
});
