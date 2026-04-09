import { useState } from 'react';
import { Eye, Edit, CheckCircle, AlertCircle, Clock, MapPin, Users, Calendar, Globe, Mail, ExternalLink, Sparkles, RefreshCw, Accessibility, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type EventFormData } from './EventWizard';

interface ReviewSectionProps {
  formData: EventFormData;
  onEdit: (stepId: string) => void;
  onPublish: () => void;
  isPublishing: boolean;
  onAgreedToTermsChange?: (agreed: boolean) => void;
}

export const ReviewSection = ({ formData, onEdit, onPublish, isPublishing, onAgreedToTermsChange }: ReviewSectionProps) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleAgreedToTermsChange = (checked: boolean) => {
    setAgreedToTerms(checked);
    onAgreedToTermsChange?.(checked);
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      'online': 'Online Event',
      'in_person': 'In-Person Event',
      'hybrid': 'Hybrid Event',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPrivacyLabel = (privacy: string) => {
    const labels = {
      'public': 'Public',
      'private': 'Private',
      'unlisted': 'Unlisted',
    };
    return labels[privacy as keyof typeof labels] || privacy;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getValidationStatus = () => {
    const issues = [];

    if (!formData.title.trim()) issues.push('Event title is required');
    if (!formData.description.trim()) issues.push('Event description is required');
    if (!formData.start_time) issues.push('Start date and time are required');
    if (!formData.end_time) issues.push('End date and time are required');
    if (formData.event_type === 'online' && !formData.virtual_event_url.trim()) {
      issues.push('Virtual event URL is required for online events');
    }
    if (formData.event_type !== 'online' && !formData.location.trim()) {
      issues.push('Location is required for in-person events');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  };

  const validation = getValidationStatus();

  const reviewSections = [
    {
      id: 'basic-info',
      targetStepId: 'info',
      title: 'Basic Information',
      icon: Eye,
      content: (
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-lg">{formData.title || 'Untitled Event'}</h4>
            {formData.subtitle && <p className="text-gray-600">{formData.subtitle}</p>}
          </div>
          {formData.summary && (
            <div>
              <span className="text-sm font-medium text-gray-700">Summary:</span>
              <p className="text-sm text-gray-600">{formData.summary}</p>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-gray-700">Language:</span>
            <Badge variant="outline" className="ml-2">
              {formData.language.toUpperCase()}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      id: 'event-type',
      targetStepId: 'type',
      title: 'Event Type & Format',
      icon: Calendar,
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Type:</span>
            <Badge>{getEventTypeLabel(formData.event_type)}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Format:</span>
            <Badge variant="outline">{formData.event_format}</Badge>
          </div>
        </div>
      ),
    },
    {
      id: 'event-datetime',
      targetStepId: 'type',
      title: 'Date & Time',
      icon: Clock,
      content: (
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium">Start:</span>
            <div className="text-sm text-gray-600">
              {formatDate(formData.start_time)} at {formatTime(formData.start_time)}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium">End:</span>
            <div className="text-sm text-gray-600">
              {formatDate(formData.end_time)} at {formatTime(formData.end_time)}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium">Timezone:</span>
            <Badge variant="outline" className="ml-2">{formData.timezone}</Badge>
          </div>
          {formData.doors_open_time && (
            <div>
              <span className="text-sm font-medium">Doors Open:</span>
              <div className="text-sm text-gray-600">
                {formatDate(formData.doors_open_time)} at {formatTime(formData.doors_open_time)}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'event-location',
      targetStepId: 'type',
      title: 'Location',
      icon: MapPin,
      content: (
        <div className="space-y-2">
          {formData.event_type === 'online' ? (
            <div>
              <span className="text-sm font-medium">Virtual Event:</span>
              <div className="text-sm text-gray-600">{formData.virtual_event_url}</div>
              {formData.virtual_event_platform && (
                <Badge variant="outline" className="mt-1">
                  {formData.virtual_event_platform}
                </Badge>
              )}
            </div>
          ) : (
            <div>
              <span className="text-sm font-medium">Location:</span>
              <div className="text-sm text-gray-600">{formData.location}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'event-settings',
      targetStepId: 'contact',
      title: 'Category & Settings',
      icon: Users,
      content: (
        <div className="space-y-2">
          {formData.category && (
            <div>
              <span className="text-sm font-medium">Category:</span>
              <Badge className="ml-2">{formData.category}</Badge>
            </div>
          )}
          {formData.max_participants && (
            <div>
              <span className="text-sm font-medium">Max Participants:</span>
              <span className="text-sm text-gray-600 ml-2">{formData.max_participants}</span>
            </div>
          )}
          {formData.ticket_pricing_description && (
            <div>
              <span className="text-sm font-medium">Ticket Pricing:</span>
              <div className="text-sm text-gray-600 ml-2 mt-1 whitespace-pre-wrap">
                {formData.ticket_pricing_description}
              </div>
            </div>
          )}
          <div>
            <span className="text-sm font-medium">Privacy:</span>
            <Badge variant="outline" className="ml-2">
              {getPrivacyLabel(formData.event_privacy)}
            </Badge>
          </div>
          {formData.tags.length > 0 && (
            <div>
              <span className="text-sm font-medium">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'audience',
      targetStepId: 'demographics',
      title: 'Audience & Demographics',
      icon: Users,
      content: (
        <div className="space-y-3">
          {formData.age_categories && formData.age_categories.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Age Categories:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.age_categories.map((age, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {age.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {formData.gender_preference && formData.gender_preference !== 'all' && (
            <div>
              <span className="text-sm font-medium text-gray-700">Gender Preference:</span>
              <Badge variant="outline" className="ml-2">
                {formData.gender_preference.replace(/_/g, ' ')}
              </Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {formData.family_friendly && <Badge className="bg-green-100 text-green-800">Family Friendly</Badge>}
            {formData.senior_friendly && <Badge className="bg-blue-100 text-blue-800">Senior Friendly</Badge>}
            {formData.singles_friendly && <Badge className="bg-purple-100 text-purple-800">Singles Welcome</Badge>}
            {formData.couples_oriented && <Badge className="bg-pink-100 text-pink-800">Couples Oriented</Badge>}
          </div>
        </div>
      ),
    },
    {
      id: 'accessibility',
      targetStepId: 'accessibility',
      title: 'Accessibility',
      icon: Accessibility,
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {formData.wheelchair_accessible && <Badge className="bg-green-100 text-green-800">Wheelchair Accessible</Badge>}
            {formData.mobility_friendly && <Badge className="bg-blue-100 text-blue-800">Mobility Friendly</Badge>}
            {formData.hearing_accessible && <Badge className="bg-yellow-100 text-yellow-800">Hearing Accessible</Badge>}
            {formData.vision_accessible && <Badge className="bg-purple-100 text-purple-800">Vision Accessible</Badge>}
            {formData.sensory_friendly && <Badge className="bg-teal-100 text-teal-800">Sensory Friendly</Badge>}
            {formData.service_animals_allowed && <Badge className="bg-orange-100 text-orange-800">Service Animals Welcome</Badge>}
          </div>
          {formData.accessibility_notes && (
            <div>
              <span className="text-sm font-medium text-gray-700">Notes:</span>
              <p className="text-sm text-gray-600 mt-1">{formData.accessibility_notes}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'cultural',
      targetStepId: 'cultural',
      title: 'Cultural Context',
      icon: Globe,
      content: (
        <div className="space-y-3">
          {formData.religious_context && formData.religious_context.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Religious Context:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.religious_context.map((religion, index) => (
                  <Badge key={index} variant="outline" className="text-xs capitalize">
                    {religion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {formData.dietary_context && formData.dietary_context.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Dietary Context:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.dietary_context.map((diet, index) => (
                  <Badge key={index} variant="outline" className="text-xs capitalize">
                    {diet.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {formData.traditional_attire && formData.traditional_attire !== 'not_applicable' && (
            <div>
              <span className="text-sm font-medium text-gray-700">Traditional Attire:</span>
              <Badge variant="outline" className="ml-2 capitalize">
                {formData.traditional_attire.replace(/_/g, ' ')}
              </Badge>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'prerequisites',
      targetStepId: 'prerequisites',
      title: 'Prerequisites',
      icon: GraduationCap,
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Skill Level:</span>
            <Badge variant="outline" className="capitalize">
              {formData.skill_level?.replace(/_/g, ' ') || 'All Levels'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Prior Experience:</span>
            <Badge variant="outline" className="capitalize">
              {formData.prior_experience?.replace(/_/g, ' ') || 'None Required'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Physical Fitness:</span>
            <Badge variant="outline" className="capitalize">
              {formData.physical_fitness?.replace(/_/g, ' ') || 'Sedentary'}
            </Badge>
          </div>
          {formData.dress_code && formData.dress_code !== 'casual' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Dress Code:</span>
              <Badge variant="outline" className="capitalize">
                {formData.dress_code.replace(/_/g, ' ')}
              </Badge>
            </div>
          )}
          {formData.equipment_required && formData.equipment_required.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Equipment Required:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.equipment_required.map((eq, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {eq.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {formData.prerequisites_notes && (
            <div>
              <span className="text-sm font-medium text-gray-700">Notes:</span>
              <p className="text-sm text-gray-600 mt-1">{formData.prerequisites_notes}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'content-rating',
      targetStepId: 'content',
      title: 'Content & Intensity',
      icon: AlertCircle,
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Content Rating:</span>
            <Badge className="capitalize">
              {formData.content_rating?.replace(/_/g, ' ') || 'All Ages'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Alcohol:</span>
            <Badge variant="outline" className="capitalize">
              {formData.alcohol_served?.replace(/_/g, ' ') || 'No Alcohol'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Smoking:</span>
            <Badge variant="outline" className="capitalize">
              {formData.smoking_policy?.replace(/_/g, ' ') || 'Non Smoking'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Noise Level:</span>
            <Badge variant="outline" className="capitalize">
              {formData.noise_level?.replace(/_/g, ' ') || 'Moderate'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Physical Intensity:</span>
            <Badge variant="outline" className="capitalize">
              {formData.physical_intensity?.replace(/_/g, ' ') || 'None'}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.networking_focus && <Badge className="bg-blue-100 text-blue-800">Networking Focus</Badge>}
            {formData.social_mixer && <Badge className="bg-green-100 text-green-800">Social Mixer</Badge>}
            {formData.ice_breakers && <Badge className="bg-yellow-100 text-yellow-800">Ice Breakers</Badge>}
            {formData.group_activities && <Badge className="bg-purple-100 text-purple-800">Group Activities</Badge>}
            {formData.team_building && <Badge className="bg-pink-100 text-pink-800">Team Building</Badge>}
          </div>
        </div>
      ),
    },
  ];

  const additionalSections = [
    {
      title: 'Contact & Links',
      icon: Mail,
      content: (
        <div className="space-y-2">
          {formData.event_contact_email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{formData.event_contact_email}</span>
            </div>
          )}
          {formData.event_website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <a 
                href={formData.event_website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {formData.event_website}
              </a>
            </div>
          )}
          {formData.ticketing_website && (
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-gray-500" />
              <a 
                href={formData.ticketing_website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                External Ticketing
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Refund Policy',
      icon: RefreshCw,
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Refund Policy:</span>
            <Badge variant="outline">
              {formData.refund_policy === 'no_refunds' && 'No refunds'}
              {formData.refund_policy === 'refund_up_to_7_days' && 'Refunds up to 7 days before event'}
              {formData.refund_policy === 'refund_up_to_24_hours' && 'Refunds up to 24 hours before event'}
              {formData.refund_policy === 'refund_up_to_1_hour' && 'Refunds up to 1 hour before event'}
              {formData.refund_policy === 'custom' && 'Custom refund policy'}
            </Badge>
          </div>
          {formData.refund_policy === 'custom' && formData.custom_refund_policy && (
            <div className="text-sm text-gray-600 ml-6">
              {formData.custom_refund_policy}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Validation Status */}
      {!validation.isValid && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Please complete required fields</h4>
                <ul className="text-sm text-red-800 mt-2 space-y-1">
                  {validation.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Review Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {reviewSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(section.targetStepId)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                </div>
                {section.content}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      {(formData.event_contact_email || formData.event_website || formData.ticketing_website || formData.refund_policy) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Additional Information</h3>
            <div className="space-y-4">
              {additionalSections.map((section, index) => {
                const hasContent = 
                  (section.title === 'Contact & Links' && (formData.event_contact_email || formData.event_website || formData.ticketing_website)) ||
                  (section.title === 'Refund Policy' && formData.refund_policy);
                
                if (!hasContent) return null;
                
                return (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-3">
                      <section.icon className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium">{section.title}</h4>
                    </div>
                    {section.content}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold">Event Preview</h3>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="space-y-4">
              {formData.image_url && (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Event Image</span>
                </div>
              )}
              <h2 className="text-2xl font-bold">{formData.title || 'Event Title'}</h2>
              {formData.subtitle && (
                <p className="text-lg text-gray-600">{formData.subtitle}</p>
              )}
              <p className="text-gray-700">{formData.description || 'Event description will appear here...'}</p>
              
              <div className="flex flex-wrap gap-2 pt-4">
                <Badge>{getEventTypeLabel(formData.event_type)}</Badge>
                {formData.category && <Badge variant="outline">{formData.category}</Badge>}
                <Badge variant="outline">{getPrivacyLabel(formData.event_privacy)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => handleAgreedToTermsChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the EventRadius Terms of Service and Community Guidelines.
              I understand that I am responsible for the accuracy of the information
              provided and that false or misleading information may result in event removal.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Ready to Publish!</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Your event will be immediately visible to attendees</li>
                <li>• You can edit event details at any time</li>
                <li>• Attendees will receive confirmation emails upon registration</li>
                <li>• You'll have access to analytics and attendee management tools</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
