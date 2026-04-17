import { renderHook, act, waitFor } from '@testing-library/react';
import { useShare } from '../useShareSimple';
import { SITE_CONFIG } from '@/config/site';

// Mock clipboard API
type ClipboardMock = {
  writeText: jest.Mock<Promise<void>, [string]>;
};

const mockClipboard = {
  writeText: jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined),
} as ClipboardMock;

Object.assign(navigator, {
  clipboard: mockClipboard,
});

// Mock window.open
const mockWindowOpen = jest.fn<Window | null, [string | undefined, string | undefined, string | undefined]>();
window.open = mockWindowOpen;

// Mock window.location
let mockHref = '';
delete (window as any).location;
(window as any).location = {
  get href() { return mockHref; },
  set href(value: string) { mockHref = value; },
  origin: SITE_CONFIG.url,
};

// Mock navigator.share for native sharing
type NavigatorWithShare = Navigator & {
  share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
};

const mockNavigatorShare = jest.fn<Promise<void>, [{ title?: string; text?: string; url?: string }]>();
Object.assign(navigator, {
  share: mockNavigatorShare,
});

describe('useShare', () => {
  const mockEventId = '550e8400-e29b-41d4-a716-446655440000';
  const mockEventTitle = 'Annual Tech Conference';
  const mockEventDescription = 'A great tech event';
  // Use window.location.origin since that's what the hook uses when window is available
  const expectedShareUrl = `${(window as any).location.origin}/event/${mockEventId}`;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
        eventDescription: mockEventDescription,
      })
    );

    expect(result.current.isCopied).toBe(false);
    expect(result.current.isNativeSupported).toBe(true); // Because we mock navigator.share
  });

  it('should copy link to clipboard', async () => {
    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
      })
    );

    let copySuccess = false;
    await act(async () => {
      copySuccess = await result.current.copyLink();
    });

    expect(copySuccess).toBe(true);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedShareUrl);
    expect(result.current.isCopied).toBe(true);

    // Fast-forward 2 seconds to reset copied state
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.isCopied).toBe(false);
    });
  });

  it('should handle copy link failure', async () => {
    mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
      })
    );

    let copySuccess = false;
    await act(async () => {
      copySuccess = await result.current.copyLink();
    });

    expect(copySuccess).toBe(false);
    expect(result.current.isCopied).toBe(false);
  });

  it('should share to Facebook', () => {
    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
      })
    );

    act(() => {
      result.current.shareToFacebook();
    });

    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        expectedShareUrl
      )}`,
      '_blank',
      'width=550,height=420'
    );
  });

  it('should share to WhatsApp', () => {
    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
      })
    );

    act(() => {
      result.current.shareToWhatsApp();
    });

    const expectedText = encodeURIComponent(
      `Check out this event: ${mockEventTitle}\n\n${expectedShareUrl}`
    );
    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://wa.me/?text=${expectedText}`,
      '_blank',
      'width=550,height=420'
    );
  });

  it('should share to Instagram (copies link and opens Instagram)', async () => {
    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
      })
    );

    let shareSuccess = false;
    await act(async () => {
      shareSuccess = await result.current.shareToInstagram();
    });

    expect(shareSuccess).toBe(true);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedShareUrl);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://www.instagram.com/',
      '_blank',
      'width=550,height=420'
    );
    expect(result.current.isCopied).toBe(true);
  });

  it('should handle Instagram share failure', async () => {
    mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
      })
    );

    let shareSuccess = false;
    await act(async () => {
      shareSuccess = await result.current.shareToInstagram();
    });

    expect(shareSuccess).toBe(false);
  });

  it('should share via Email', () => {
    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
        eventDescription: mockEventDescription,
      })
    );

    act(() => {
      result.current.shareViaEmail();
    });

    const expectedSubject = encodeURIComponent(`Check out this event: ${mockEventTitle}`);
    const expectedBody = encodeURIComponent(
      `Hi!\n\nI thought you might be interested in this event:\n\n${mockEventTitle}\n\n${mockEventDescription}\n\nCheck it out here: ${expectedShareUrl}\n\nShared via ${SITE_CONFIG.name}`
    );
    expect(window.location.href).toBe(
      `mailto:?subject=${expectedSubject}&body=${expectedBody}`
    );
  });

  it('should share natively when available', async () => {
    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
        eventDescription: mockEventDescription,
      })
    );

    let shareSuccess = false;
    await act(async () => {
      shareSuccess = await result.current.shareNative();
    });

    expect(shareSuccess).toBe(true);
    expect(mockNavigatorShare).toHaveBeenCalledWith({
      title: mockEventTitle,
      text: mockEventDescription,
      url: expectedShareUrl,
    });
  });

  it('should handle native share not available', async () => {
    // Remove navigator.share temporarily
    const originalShare = (navigator as NavigatorWithShare).share;
    delete (navigator as NavigatorWithShare).share;

    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
      })
    );

    expect(result.current.isNativeSupported).toBe(false);

    let shareSuccess = false;
    await act(async () => {
      shareSuccess = await result.current.shareNative();
    });

    expect(shareSuccess).toBe(false);

    // Restore navigator.share
    (navigator as NavigatorWithShare).share = originalShare;
  });

  it('should handle native share cancellation', async () => {
    mockNavigatorShare.mockRejectedValueOnce(new Error('User cancelled'));

    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
      })
    );

    let shareSuccess = false;
    await act(async () => {
      shareSuccess = await result.current.shareNative();
    });

    expect(shareSuccess).toBe(false);
  });

  it('should use custom event URL if provided', async () => {
    const customUrl = 'https://custom.example.com/event/123';

    const { result } = renderHook(() =>
      useShare({
        eventId: mockEventId,
        eventTitle: mockEventTitle,
        eventUrl: customUrl,
      })
    );

    await act(async () => {
      await result.current.copyLink();
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith(customUrl);
  });
});
