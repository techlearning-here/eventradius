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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
          <p className="text-gray-600 font-medium">Help attendees reach you with questions</p>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Step 1: Contact Overview */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Stay Connected</h3>
              <p className="text-sm text-gray-600 font-medium">
                Provide ways for attendees to reach you
              </p>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Adding contact information helps attendees feel confident about reaching out with questions or concerns about your event.
              </p>
            </div>
          </div>
        </div>
        {/* Step 2: Contact Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 2: Phone Number */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                  <Phone className="w-5 h-5" />
                </div>
                <label className="block text-base font-bold text-gray-900">
                  Contact Phone
                </label>
              </div>
              <div className="relative group">
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full text-gray-900 text-base leading-relaxed focus:outline-none bg-white border-2 border-gray-200 rounded-xl p-4 placeholder:text-gray-400 group-hover:border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 shadow-sm"
                  value={contactPhone}
                  onChange={(e) => onContactPhoneChange(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  📞
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Optional - For attendee inquiries
              </p>
            </div>
            
            {/* Step 3: Email Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Mail className="w-5 h-5" />
                </div>
                <label className="block text-base font-bold text-gray-900">
                  Contact Email
                </label>
              </div>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="contact@your-event.com"
                  className="w-full text-gray-900 text-base leading-relaxed focus:outline-none bg-white border-2 border-gray-200 rounded-xl p-4 placeholder:text-gray-400 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                  value={contactEmail}
                  onChange={(e) => onContactEmailChange(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ✉️
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Optional - For general inquiries
              </p>
            </div>
          </div>

          {/* Step 4: Benefits Section */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                💡
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Pro Tips</h4>
            </div>
            <ul className="space-y-3">
              {contactPhone && (
                <>
                  <li className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    <span className="text-gray-700 font-medium">Builds trust with potential attendees</span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    <span className="text-gray-700 font-medium">Allows quick resolution of urgent questions</span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    <span className="text-gray-700 font-medium">Ideal for day-of-event coordination</span>
                  </li>
                </>
              )}
              {contactEmail && (
                <>
                  <li className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    <span className="text-gray-700 font-medium">Professional communication channel</span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    <span className="text-gray-700 font-medium">Perfect for detailed inquiries and documentation</span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    <span className="text-gray-700 font-medium">Creates a paper trail for communications</span>
                  </li>
                </>
              )}
              {!contactPhone && !contactEmail && (
                <>
                  <li className="flex items-start gap-3 bg-white/80 p-3 rounded-xl border border-amber-200">
                    <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
                    <span className="text-gray-700 font-medium">Add at least one contact method for better attendee experience</span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                    <span className="text-amber-500 text-lg flex-shrink-0">💡</span>
                    <span className="text-gray-600">Phone is best for urgent matters, email for detailed questions</span>
                  </li>
                </>
              )}
              {contactPhone && contactEmail && (
                <li className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">★</span>
                  <span className="text-green-800 font-bold">Excellent! Providing both contact options gives attendees maximum flexibility</span>
                </li>
              )}
            </ul>
          </div>

          {/* Step 5: Privacy Notice */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🔒</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1 text-base">Privacy Notice</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
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
