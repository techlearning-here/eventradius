import { Globe, Mail, ExternalLink, Shield, RefreshCw } from 'lucide-react';

interface AdvancedSectionProps {
  eventWebsite: string;
  eventContactEmail: string;
  ticketingWebsite: string;
  refundPolicy: string;
  customRefundPolicy: string;
  onEventWebsiteChange: (value: string) => void;
  onEventContactEmailChange: (value: string) => void;
  onTicketingWebsiteChange: (value: string) => void;
  onRefundPolicyChange: (value: string) => void;
  onCustomRefundPolicyChange: (value: string) => void;
}

export const AdvancedSection = ({
  eventWebsite,
  eventContactEmail,
  ticketingWebsite,
  refundPolicy,
  customRefundPolicy,
  onEventWebsiteChange,
  onEventContactEmailChange,
  onTicketingWebsiteChange,
  onRefundPolicyChange,
  onCustomRefundPolicyChange,
}: AdvancedSectionProps) => {
  const refundPolicies = [
    { value: 'no_refunds', label: 'No refunds' },
    { value: 'refund_up_to_7_days', label: 'Refunds up to 7 days before event' },
    { value: 'refund_up_to_24_hours', label: 'Refunds up to 24 hours before event' },
    { value: 'refund_up_to_1_hour', label: 'Refunds up to 1 hour before event' },
    { value: 'custom', label: 'Custom refund policy' },
  ];

  return (
    <div className="space-y-8">
      {/* Event Website */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Event Website</h3>
        <p className="text-white mb-4">
          Provide a website for more information about your event
        </p>
        
        <div className="relative max-w-md">
          <Globe className="absolute left-3 top-1/2 text-gray-400 w-4 h-4 transform -translate-y-1/2" />
          <input
            type="url"
            placeholder="https://youreventwebsite.com"
            value={eventWebsite}
            onChange={(e) => onEventWebsiteChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Include https:// for a valid URL
        </p>
      </div>

      {/* Event Contact Email */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Event Contact Email</h3>
        <p className="text-white mb-4">
          Email address for event-specific inquiries
        </p>
        
        <div className="relative max-w-md">
          <Mail className="absolute left-3 top-1/2 text-gray-400 w-4 h-4 transform -translate-y-1/2" />
          <input
            type="email"
            placeholder="contact@yourevent.com"
            value={eventContactEmail}
            onChange={(e) => onEventContactEmailChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This will be displayed on the event page
        </p>
      </div>

      {/* Ticketing Website */}
      <div>
        <h3 className="text-lg font-semibold mb-4">External Ticketing</h3>
        <p className="text-white mb-4">
          Add your external ticketing platform if you're not using built-in ticketing
        </p>
        
        <div className="relative max-w-md">
          <ExternalLink className="absolute left-3 top-1/2 text-gray-400 w-4 h-4 transform -translate-y-1/2" />
          <input
            type="url"
            placeholder="https://ticketing-platform.com/event"
            value={ticketingWebsite}
            onChange={(e) => onTicketingWebsiteChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Leave blank to use EventRadius built-in ticketing
        </p>
      </div>

      {/* Refund Policy */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Refund Policy</h3>
        <p className="text-white mb-4">
          Set clear expectations for ticket refunds
        </p>
        
        <div className="max-w-md">
          <select
            value={refundPolicy}
            onChange={(e) => onRefundPolicyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {refundPolicies.map((policy) => (
              <option key={policy.value} value={policy.value}>
                {policy.label}
              </option>
            ))}
          </select>
        </div>

        {refundPolicy === 'custom' && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Custom Refund Policy
            </label>
            <textarea
              placeholder="Describe your custom refund policy..."
              value={customRefundPolicy}
              onChange={(e) => onCustomRefundPolicyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
            />
          </div>
        )}
      </div>

      {/* Additional Advanced Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Settings</h3>
        <p className="text-white mb-6">
          More advanced event management features
        </p>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium">Privacy & Security</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Advanced privacy controls and security features
            </p>
            <div className="text-sm text-gray-500">
              Coming soon: GDPR compliance, data export, privacy controls
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium">Automation</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Automated workflows and integrations
            </p>
            <div className="text-sm text-gray-500">
              Coming soon: Email automation, CRM integration, webhooks
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium">Internationalization</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Multi-language and multi-currency support
            </p>
            <div className="text-sm text-gray-500">
              Coming soon: Translated event pages, local payment methods
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2">⚙️ Advanced Tips</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• A clear refund policy reduces disputes and chargebacks</li>
          <li>• Provide multiple contact channels for better support</li>
          <li>• Link to detailed information for complex events</li>
          <li>• Consider legal requirements for your jurisdiction</li>
        </ul>
      </div>
    </div>
  );
};
