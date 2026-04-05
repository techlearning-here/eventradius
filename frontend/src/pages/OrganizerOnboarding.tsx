import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { apiClient } from '@/integrations/backend/api';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { AccountDetails } from '@/components/AccountDetails';
import { ArrowRight, Phone, Mail, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES } from '@/data/cities';

const OrganizerOnboarding = () => {
  const { user, setActiveRole } = useAuthWithBackend();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    phone_country_code: '',
    business_name: '',
    business_type: '',
    description: '',
    address: '',
    city: '',
    state_province: '',
    zip_pin: '',
    country: '',
    event_types: [] as string[],
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const totalSteps = 3;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update phone number if provided
      if (formData.phone) {
        await apiClient.updatePhoneNumber({
          phone: formData.phone,
          phone_country_code: formData.phone_country_code,
        });
        
        // For now, set phone verification to true by default
        // TODO: Later implement OTP validation and set to false until verified
        await apiClient.updateUserProfile({
          phone_verified: true
        });
      }

      // Save organizer details to user preferences
      await apiClient.updateUserPreferences({
        organizer_onboarding_completed: true,
        business_name: formData.business_name || null,
        business_type: formData.business_type || null,
        business_description: formData.description || null,
        business_address: formData.address || null,
        business_city: formData.city || null,
        business_state_province: formData.state_province || null,
        business_zip_pin: formData.zip_pin || null,
        business_country: formData.country || null,
        event_types: formData.event_types,
      });

      // Add organizer role to user
      await apiClient.addUserRole('organizer');
      
      // Set active role to organizer
      await setActiveRole('organizer');

      toast.success('Organizer onboarding completed successfully!');
      
      // Navigate to organizer dashboard after a short delay to ensure role state is updated
      setTimeout(() => {
        navigate('/organizer');
      }, 100);
    } catch (error) {
      console.error('Onboarding failed:', error);
      toast.error('Failed to complete organizer onboarding');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | string[]) => {
    console.log('Updating form data:', field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Phone input change:', value);
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Country code change:', value);
    setFormData(prev => ({ ...prev, phone_country_code: value }));
  };

  const toggleEventType = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      event_types: prev.event_types.includes(typeId)
        ? prev.event_types.filter(t => t !== typeId)
        : [...prev.event_types, typeId]
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
              <p className="text-muted-foreground">We need to verify your contact details for event publishing</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="+1"
                    value={formData.phone_country_code || '+1'}
                    onChange={handleCountryCodeChange}
                    className="w-20 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                    maxLength={5}
                  />
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={formData.phone || ''}
                    onChange={handlePhoneChange}
                    className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Required for event organizers to enable event communication</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Why we need this</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Phone verification helps us ensure event organizers are legitimate and enables secure communication with event attendees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Business & Event Details</h2>
              <p className="text-muted-foreground">Tell us about your organization and the events you plan to create</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business/Organization Name</label>
                <input
                  type="text"
                  placeholder="Your business name"
                  value={formData.business_name}
                  onChange={(e) => updateFormData('business_name', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Type</label>
                <select
                  value={formData.business_type}
                  onChange={(e) => updateFormData('business_type', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                >
                  <option value="">Select business type</option>
                  <option value="individual">Individual</option>
                  <option value="nonprofit">Non-profit Organization</option>
                  <option value="business">For-profit Business</option>
                  <option value="educational">Educational Institution</option>
                  <option value="government">Government Entity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Complete Address *</label>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State/Province"
                        value={formData.state_province}
                        onChange={(e) => updateFormData('state_province', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="ZIP/PIN Code"
                        value={formData.zip_pin}
                        onChange={(e) => updateFormData('zip_pin', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Country"
                        value={formData.country}
                        onChange={(e) => updateFormData('country', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">We need to capture your complete address for verification</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Types of Events You Plan to Create *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleEventType(cat.id)}
                      className={`p-3 border rounded-md text-left flex items-center gap-2 transition-colors ${
                        formData.event_types.includes(cat.id)
                          ? 'border-[hsl(295,100%,73%)] bg-[hsl(295,100%,73%)]/10'
                          : 'border-border hover:border-foreground'
                      }`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                      {formData.event_types.includes(cat.id) && (
                        <CheckCircle className="w-4 h-4 text-[hsl(295,100%,73%)] ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Brief description of your organization and event vision"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)] text-black"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
              <p className="text-muted-foreground">Please review your information before becoming an event organizer</p>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{formData.phone_country_code} {formData.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user?.email || 'Not available'}</span>
                  </div>
                  {formData.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div>{formData.address}</div>
                        {formData.city && <div>{formData.city}, {formData.state_province} {formData.zip_pin}</div>}
                        {formData.country && <div>{formData.country}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(formData.business_name || formData.business_type || formData.description) && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Business Details</h3>
                  <div className="space-y-2">
                    {formData.business_name && (
                      <div><strong>Name:</strong> {formData.business_name}</div>
                    )}
                    {formData.business_type && (
                      <div><strong>Type:</strong> {formData.business_type}</div>
                    )}
                    {formData.description && (
                      <div><strong>Description:</strong> {formData.description}</div>
                    )}
                  </div>
                </div>
              )}

              {formData.event_types.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Event Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.event_types.map(typeId => {
                      const category = CATEGORIES.find(c => c.id === typeId);
                      return category ? (
                        <span key={typeId} className="px-2 py-1 bg-muted text-sm rounded-md">
                          {category.emoji} {category.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">You're almost ready!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Once you complete this process, you'll be able to create and manage events on EventRadius.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  />
                  <div>
                    <label htmlFor="terms-checkbox" className="font-medium text-amber-900 cursor-pointer">
                      Terms and Conditions
                    </label>
                    <p className="text-sm text-amber-700 mt-1">
                      I agree to the EventRadius Terms of Service and Privacy Policy. I understand that as an event organizer, I am responsible for the accuracy of event information and compliance with applicable laws and regulations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Organizer Onboarding" 
        description="Complete your organizer profile to start publishing events" 
      />

      <Navbar />
      
      {user && (
        <div className="fixed top-8 right-4 md:right-8 z-[2000]">
          <AccountDetails />
        </div>
      )}

      {/* Debug section - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black text-white p-2 text-xs rounded z-50">
          Debug: phone="{formData.phone}" country="{formData.phone_country_code}"
        </div>
      )}

      <div className="pt-24 px-4 md:px-8 max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 <= step
                    ? 'bg-[hsl(295,100%,73%)] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    i + 1 < step ? 'bg-[hsl(295,100%,73%)]' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:border-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading || (step === totalSteps && (!formData.phone || !formData.address || !formData.city || !formData.state_province || !formData.zip_pin || !formData.country || formData.event_types.length === 0 || !termsAccepted))}
              className="px-6 py-2 bg-[hsl(295,100%,73%)] text-foreground font-medium rounded-md hover:bg-[hsl(295,100%,78%)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                'Processing...'
              ) : step === totalSteps ? (
                <>
                  Complete Setup
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerOnboarding;
