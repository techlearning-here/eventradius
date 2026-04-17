import { useState, useCallback, useEffect } from 'react';
import { SITE_CONFIG, getEventShareUrl } from '@/config/site';

export interface ShareOptions {
  eventId: string;
  eventTitle: string;
  eventDescription?: string;
  eventUrl?: string;
}

export interface UseShareReturn {
  copyLink: () => Promise<boolean>;
  shareNative: () => Promise<boolean>;
  shareToFacebook: () => void;
  shareToWhatsApp: () => void;
  shareToInstagram: () => Promise<boolean>;
  shareViaEmail: () => void;
  isCopied: boolean;
  isNativeSupported: boolean;
}

export function useShare(options: ShareOptions): UseShareReturn {
  const [isCopied, setIsCopied] = useState(false);
  const [isNativeSupported, setIsNativeSupported] = useState(false);

  // Check if Web Share API is supported
  useEffect(() => {
    setIsNativeSupported(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Build the event URL
  const shareUrl = options.eventUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/event/${options.eventId}`
      : getEventShareUrl(options.eventId));

  // Copy link to clipboard
  const copyLink = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
      
      return true;
    } catch (err) {
      console.error('Failed to copy link:', err);
      return false;
    }
  }, [shareUrl]);

  // Native Web Share API (mobile)
  const shareNative = useCallback(async (): Promise<boolean> => {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share({
        title: options.eventTitle,
        text: options.eventDescription || `Check out this event: ${options.eventTitle}`,
        url: shareUrl,
      });
      
      return true;
    } catch (err) {
      // User cancelled or share failed
      return false;
    }
  }, [shareUrl, options.eventTitle, options.eventDescription]);

  // Share to Facebook
  const shareToFacebook = useCallback(() => {
    const url = encodeURIComponent(shareUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  }, [shareUrl]);

  // Share to WhatsApp
  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`Check out this event: ${options.eventTitle}\n\n${shareUrl}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    
    window.open(whatsappUrl, '_blank', 'width=550,height=420');
  }, [shareUrl, options.eventTitle]);

  // Share to Instagram (copies link and opens Instagram)
  const shareToInstagram = useCallback(async (): Promise<boolean> => {
    try {
      // Copy link to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
      
      // Open Instagram web
      window.open('https://www.instagram.com/', '_blank');
      
      return true;
    } catch (err) {
      console.error('Failed to copy for Instagram:', err);
      return false;
    }
  }, [shareUrl]);

  // Share via Email
  const shareViaEmail = useCallback(() => {
    const subject = encodeURIComponent(`Check out this event: ${options.eventTitle}`);
    const body = encodeURIComponent(
      `Hi!\n\nI thought you might be interested in this event:\n\n${options.eventTitle}\n\n${options.eventDescription || ''}\n\nCheck it out here: ${shareUrl}\n\nShared via ${SITE_CONFIG.name}`
    );
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;
  }, [shareUrl, options.eventTitle, options.eventDescription]);

  return {
    copyLink,
    shareNative,
    shareToFacebook,
    shareToWhatsApp,
    shareToInstagram,
    shareViaEmail,
    isCopied,
    isNativeSupported,
  };
}
