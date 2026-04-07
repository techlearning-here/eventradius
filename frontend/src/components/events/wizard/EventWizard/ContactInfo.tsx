import { Phone, Mail, Globe, MessageCircle } from 'lucide-react';

interface ContactInfoProps {
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
  onContactPhoneChange?: (value: string) => void;
  onContactEmailChange?: (value: string) => void;
  onContactWebsiteChange?: (value: string) => void;
}

export const ContactInfo = ({ 
  contactPhone = '', 
  contactEmail = '',
  contactWebsite = '',
  onContactPhoneChange = () => {},
  onContactEmailChange = () => {},
  onContactWebsiteChange = () => {}
}: ContactInfoProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
      
      <div className="space-y-8">
        {/* Step 1: Contact Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Stay Connected</h3>
              <p className="text-sm text-gray-800">
                Provide ways for attendees to reach you
              </p>
              <p className="text-xs text-gray-700 mt-2">
                Adding contact information helps attendees feel confident about reaching out with questions or concerns about your event.
              </p>
            </div>
          </div>
        </div>
        {/* Step 2: Contact Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 2: Phone Number */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white" />
                <label className="block text-sm font-medium text-white">
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
              <p className="text-xs text-white">
                Optional - For attendee inquiries
              </p>
            </div>
            
            {/* Step 3: Email Address */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white" />
                <label className="block text-sm font-medium text-white">
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
              <p className="text-xs text-white">
                Optional - For general inquiries
              </p>
            </div>

            {/* Step 4: Website */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-white" />
                <label className="block text-sm font-medium text-white">
                  Event Website
                </label>
              </div>
              <input
                type="url"
                placeholder="https://your-event-website.com"
                className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={contactWebsite}
                onChange={(e) => onContactWebsiteChange(e.target.value)}
              />
              <p className="text-xs text-white">
                Optional - Your event's official website
              </p>
            </div>
          </div>

          {/* Step 4: Benefits Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">💡 Pro Tips</h4>
            <ul className="text-sm text-gray-800 space-y-1">
              {contactPhone && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Builds trust with potential attendees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Allows quick resolution of urgent questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Shows you're responsive and accessible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Ideal for day-of-event coordination</span>
                  </li>
                </>
              )}
              {contactEmail && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Professional communication channel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Perfect for detailed inquiries and documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Helps with last-minute changes and updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Creates a paper trail for important communications</span>
                  </li>
                </>
              )}
              {!contactPhone && !contactEmail && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">⚠️</span>
                    <span className="text-gray-800">Add at least one contact method for better attendee experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">💡</span>
                    <span className="text-gray-800">Phone is best for urgent matters, email for detailed questions</span>
                  </li>
                </>
              )}
              {contactPhone && contactEmail && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span className="font-medium">Excellent! Providing both contact options gives attendees flexibility</span>
                </li>
              )}
            </ul>
          </div>

          {/* Step 5: Privacy Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">ℹ️</span>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Privacy Notice</h4>
                <p className="text-sm text-gray-800">
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
