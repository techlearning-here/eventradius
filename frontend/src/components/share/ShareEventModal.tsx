import React, { useEffect, useCallback } from 'react';
import { X, Link2, Mail, Smartphone, Check, Share2 } from 'lucide-react';
import { useShare } from '@/hooks/useShareSimple';
import { SITE_CONFIG } from '@/config/site';
import type { Event } from '@/components/EventDetail/types';

interface ShareEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareEventModal: React.FC<ShareEventModalProps> = ({ event, isOpen, onClose }) => {
  const {
    copyLink,
    shareNative,
    shareToFacebook,
    shareToWhatsApp,
    shareToInstagram,
    shareViaEmail,
    isCopied,
    isNativeSupported,
  } = useShare({
    eventId: event.id,
    eventTitle: event.title,
    eventDescription: event.description,
  });

  // Handle escape key
  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscapeKey]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Event
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Options */}
        <div className="px-6 py-4">
          {/* Quick Share - Primary Actions */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Copy Link */}
            <button
              onClick={copyLink}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                isCopied 
                  ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' 
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isCopied ? 'bg-green-100 dark:bg-green-900' : 'bg-primary/10'
              }`}>
                {isCopied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Link2 className="w-5 h-5" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">
                  {isCopied ? 'Copied!' : 'Copy Link'}
                </p>
              </div>
            </button>

            {/* Native Share (Mobile) */}
            {isNativeSupported && (
              <button
                onClick={shareNative}
                className="flex items-center gap-3 p-3 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Share</p>
                </div>
              </button>
            )}
          </div>

          {/* Social Share - Secondary Actions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Share to Social
            </p>
            <div className="grid grid-cols-3 gap-2">
              {/* Facebook */}
              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1877F2] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  {/* Official Facebook "f" logo */}
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-muted-foreground">Facebook</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={shareToWhatsApp}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-muted-foreground">WhatsApp</span>
              </button>

              {/* Instagram */}
              <button
                onClick={shareToInstagram}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-muted-foreground">Instagram</span>
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={shareViaEmail}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-sm">Send via Email</p>
                <p className="text-xs text-muted-foreground">Share with friends directly</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-muted/50 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            {SITE_CONFIG.name} · {SITE_CONFIG.tagline}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareEventModal;
