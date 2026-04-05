import { Phone, Mail, MessageCircle } from 'lucide-react';

interface ContactInfoProps {
  contactPhone?: string;
  contactEmail?: string;
  onContactPhoneChange?: (value: string) => void;
  onContactEmailChange?: (value: string) => void;
}

export const ContactInfo = ({ 
  contactPhone = '', 
  contactEmail = '',
  onContactPhoneChange = () => {},
  onContactEmailChange = () => {}
}: ContactInfoProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
      
      <div className="space-y-8">
        {/* Contact Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Stay Connected</h3>
              <p className="text-sm text-blue-700">Provide ways for attendees to reach you</p>
            </div>
          </div>
          <p className="text-sm text-blue-700">
            Adding contact information helps attendees feel confident about reaching out with questions or concerns about your event.
          </p>
        </div>

        {/* Contact Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <label className="block text-sm font-medium text-gray-700">
                  Contact Phone Number
                </label>
              </div>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={contactPhone}
                onChange={(e) => onContactPhoneChange(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Optional - For attendee inquiries and urgent matters
              </p>
            </div>
            
            {/* Email Address */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <label className="block text-sm font-medium text-gray-700">
                  Contact Email Address
                </label>
              </div>
              <input
                type="email"
                placeholder="contact@your-event.com"
                className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={contactEmail}
                onChange={(e) => onContactEmailChange(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Optional - For general inquiries and event information
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Why provide contact information?</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Builds trust with potential attendees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Allows quick resolution of questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Shows you're responsive and accessible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Helps with last-minute changes or updates</span>
              </li>
            </ul>
          </div>

          {/* Privacy Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">ℹ️</span>
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Privacy Notice</h4>
                <p className="text-sm text-yellow-700">
                  Contact information will be displayed on your event page. Only share what you're comfortable making public.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
