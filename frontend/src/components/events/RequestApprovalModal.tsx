import { useState } from 'react';
import { toast } from 'sonner';
import { X, User, Mail, Phone, FileText, Link2, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient } from '@/integrations/backend/client';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import type { Event, ApprovalRequestSubmit } from '@/integrations/backend/types';

interface RequestApprovalModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  requester_bio: string;
  requester_reason: string;
  requester_social_links: {
    linkedin: string;
    twitter: string;
    website: string;
    instagram: string;
  };
}

export const RequestApprovalModal = ({ event, isOpen, onClose, onSuccess }: RequestApprovalModalProps) => {
  const { user, userProfile } = useAuthWithBackend();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-fill with user data if available
  const [formData, setFormData] = useState<FormData>({
    requester_name: userProfile?.full_name || '',
    requester_email: userProfile?.email || user?.email || '',
    requester_phone: userProfile?.phone || '',
    requester_bio: '',
    requester_reason: '',
    requester_social_links: {
      linkedin: '',
      twitter: '',
      website: '',
      instagram: '',
    },
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.requester_name.trim() || formData.requester_name.length < 2) {
      newErrors.requester_name = 'Please enter your full name (at least 2 characters)';
    }

    if (!formData.requester_email.trim()) {
      newErrors.requester_email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requester_email)) {
      newErrors.requester_email = 'Please enter a valid email address';
    }

    // Phone is optional but validate format if provided
    if (formData.requester_phone && !/^\+?[\d\s\-()]{10,}$/.test(formData.requester_phone)) {
      newErrors.requester_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSocialLinkChange = (platform: keyof FormData['requester_social_links'], value: string) => {
    setFormData(prev => ({
      ...prev,
      requester_social_links: { ...prev.requester_social_links, [platform]: value }
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty social links
      const socialLinks = Object.entries(formData.requester_social_links)
        .filter(([, value]) => value.trim())
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const requestData: ApprovalRequestSubmit = {
        requester_name: formData.requester_name.trim(),
        requester_email: formData.requester_email.trim(),
        requester_phone: formData.requester_phone.trim() || undefined,
        requester_bio: formData.requester_bio.trim() || undefined,
        requester_reason: formData.requester_reason.trim() || undefined,
        requester_social_links: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      };

      await apiClient.submitApprovalRequest(event.id, requestData);

      setIsSuccess(true);
      toast.success('Request submitted successfully!', {
        description: 'The organizer will review your request and get back to you.',
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setIsSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error submitting approval request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request';
      toast.error('Failed to submit request', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Request Submitted!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your request to join "{event.title}" has been submitted. The organizer will review it and get back to you soon.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <CardHeader className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b p-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Request to Join
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {event.title}
              </CardDescription>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {event.approval_instructions && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-medium">Note from organizer:</span> {event.approval_instructions}
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Required Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.requester_name}
                onChange={(e) => handleInputChange('requester_name', e.target.value)}
                className={errors.requester_name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.requester_name && (
                <p className="text-xs text-red-500">{errors.requester_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.requester_email}
                onChange={(e) => handleInputChange('requester_email', e.target.value)}
                className={errors.requester_email ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.requester_email && (
                <p className="text-xs text-red-500">{errors.requester_email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Phone Number <span className="text-gray-400">(Optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.requester_phone}
                onChange={(e) => handleInputChange('requester_phone', e.target.value)}
                className={errors.requester_phone ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.requester_phone && (
                <p className="text-xs text-red-500">{errors.requester_phone}</p>
              )}
            </div>
          </div>

          {/* Optional Fields Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Optional Information</span>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Short Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={formData.requester_bio}
                onChange={(e) => handleInputChange('requester_bio', e.target.value)}
                rows={3}
                className="resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Why do you want to attend?
              </Label>
              <Textarea
                id="reason"
                placeholder="What interests you about this event?"
                value={formData.requester_reason}
                onChange={(e) => handleInputChange('requester_reason', e.target.value)}
                rows={3}
                className="resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Link2 className="w-4 h-4 text-gray-500" />
                Social Links
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="LinkedIn URL"
                  value={formData.requester_social_links.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Twitter/X Handle"
                  value={formData.requester_social_links.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Website URL"
                  value={formData.requester_social_links.website}
                  onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Instagram Handle"
                  value={formData.requester_social_links.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Request
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestApprovalModal;
