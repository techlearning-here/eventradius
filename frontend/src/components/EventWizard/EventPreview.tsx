import { Eye, Calendar, Clock, MapPin, Users, Globe, Mail, ExternalLink, Tag, DollarSign, Video, Image, Ticket, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type EventFormData } from './EventWizard';

interface EventPreviewProps {
  formData: EventFormData;
  onClose: () => void;
}

export const EventPreview = ({ formData, onClose }: EventPreviewProps) => {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Eventbrite-style Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EventRadius</h1>
                  <span className="text-gray-500 dark:text-gray-400">by</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Your Name</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Event Content - Eventbrite Style */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900 shadow-lg">
        {/* Event Hero Section */}
        <div className="relative">
          {formData.image_url ? (
            <div className="h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <img 
                src={formData.image_url} 
                alt={formData.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
              <Image className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{formData.title || 'Untitled Event'}</h2>
                {formData.subtitle && (
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{formData.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info Card */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Event Type & Status */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Event Details</h3>
                      <div className="flex items-center space-x-3">
                        <Badge variant="default" className="text-sm">
                          {getEventTypeLabel(formData.event_type || '')}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          {formData.event_format || ''}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          {getPrivacyLabel(formData.event_privacy || '')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      {formData.is_paid_event && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Paid Event
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      Date & Time
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium w-24 text-gray-700 dark:text-gray-300">Start:</span>
                        <div className="text-gray-600 dark:text-gray-400">
                          <div>{formatDate(formData.start_time)}</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatTime(formData.start_time)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium w-24 text-gray-700 dark:text-gray-300">End:</span>
                        <div className="text-gray-600 dark:text-gray-400">
                          <div>{formatDate(formData.end_time)}</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatTime(formData.end_time)}</div>
                        </div>
                      </div>
                      {formData.timezone && (
                        <div className="flex items-center mt-2">
                          <span className="font-medium w-24 text-gray-700 dark:text-gray-300">Timezone:</span>
                          <Badge variant="outline" className="ml-2">{formData.timezone}</Badge>
                        </div>
                      )}
                      {formData.doors_open_time && (
                        <div className="flex items-center mt-2">
                          <span className="font-medium w-24 text-gray-700 dark:text-gray-300">Doors Open:</span>
                          <div className="text-gray-600 dark:text-gray-400">
                            <div>{formatDate(formData.doors_open_time)}</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatTime(formData.doors_open_time)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-red-500" />
                      Location
                    </h4>
                    <div className="space-y-3 text-sm">
                      {formData.event_type === 'online' ? (
                        <div>
                          <div className="flex items-center mb-2">
                            <Globe className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Virtual Event</span>
                          </div>
                          <a 
                            href={formData.virtual_event_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {formData.virtual_event_url}
                          </a>
                          {formData.virtual_event_platform && (
                            <div className="mt-2">
                              <Badge variant="outline">{formData.virtual_event_platform}</Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center mb-2">
                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Venue</span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">{formData.location}</div>
                          {formData.venue_address && (
                            <div className="text-gray-600 dark:text-gray-400 mt-1">{formData.venue_address}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Settings */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Tag className="w-5 h-5 mr-2 text-green-500" />
                      Event Settings
                    </h4>
                    <div className="space-y-3 text-sm">
                      {formData.category && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                          <Badge className="ml-2">{formData.category}</Badge>
                        </div>
                      )}
                      {formData.max_participants && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Max Participants:</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">{formData.max_participants}</span>
                        </div>
                      )}
                      {formData.language && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Language:</span>
                          <Badge variant="outline" className="ml-2">{formData.language?.toUpperCase()}</Badge>
                        </div>
                      )}
                      {formData.tags && formData.tags.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-2 ml-2">
                            {formData.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {/* Description Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Eye className="w-5 h-5 mr-2 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About this event</h3>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {formData.description || 'No description provided'}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Mail className="w-5 h-5 mr-2 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    {formData.event_contact_email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <a 
                          href={`mailto:${formData.event_contact_email}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {formData.event_contact_email}
                        </a>
                      </div>
                    )}
                    {formData.event_website && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <a 
                          href={formData.event_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {formData.event_website}
                        </a>
                      </div>
                    )}
                    {formData.ticketing_website && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <a 
                          href={formData.ticketing_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Get Tickets
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Virtual Event Details */}
              {formData.event_type === 'online' && formData.virtual_event_details && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Video className="w-5 h-5 mr-2 text-indigo-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Virtual Event Details</h3>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {formData.virtual_event_details}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ticket Information */}
              {formData.is_paid_event && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Information</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {formData.ticket_pricing_description && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Pricing:</span>
                          <div className="text-gray-600 dark:text-gray-400 ml-2 mt-1 whitespace-pre-wrap">
                            {formData.ticket_pricing_description}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              This is how your event will appear to attendees on EventRadius.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center text-gray-400 dark:text-gray-500">
                <Star className="w-4 h-4 mr-1" />
                <span>Professional Event Preview</span>
              </div>
              <div className="flex items-center text-gray-400 dark:text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                <span>Eventbrite-Style Display</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
