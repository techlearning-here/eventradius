import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { apiClient } from '@/integrations/backend/api';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { AccountDetails } from '@/components/AccountDetails';
import { ArrowRight, Phone, Mail, CheckCircle, AlertCircle, MapPin, Building, Sparkles, Shield, Users } from 'lucide-react';
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
        // Note: phone_verified field may need to be added to the API interface
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
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl mb-6 shadow-lg shadow-teal-600/25">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-foreground">
                Contact Details
              </h2>
              <p className="text-muted-foreground text-lg">
                Let our smart system verify your organizer credentials
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-600" />
                  Phone Number <span className="text-teal-600">*</span>
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="+1"
                      value={formData.phone_country_code || '+1'}
                      onChange={handleCountryCodeChange}
                      className="w-24 px-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300"
                      maxLength={5}
                    />
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-600" />
                    <input
                      type="tel"
                      placeholder="Your phone number"
                      value={formData.phone || ''}
                      onChange={handlePhoneChange}
                      className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-600" />
                  Required for secure event communication and organizer verification
                </p>
              </div>

              <div className="bg-teal-50 dark:bg-teal-950/20 border-2 border-teal-200 dark:border-teal-800 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">Why Verification Matters</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Phone verification ensures organizer legitimacy, enables secure attendee communication, and helps maintain trust within the EventRadius community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl mb-6 shadow-lg shadow-teal-600/25">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-foreground">
                Business Information
              </h2>
              <p className="text-muted-foreground text-lg">
                Configure your organizer profile for successful events
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-600" />
                  Business/Organization Name
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-600" />
                  <input
                    type="text"
                    placeholder="Your business name"
                    value={formData.business_name}
                    onChange={(e) => updateFormData('business_name', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  Organization Type
                </label>
                <div className="relative">
                  <select
                    value={formData.business_type}
                    onChange={(e) => updateFormData('business_type', e.target.value)}
                    className="w-full px-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">Select organization type</option>
                    <option value="individual">Individual</option>
                    <option value="nonprofit">Non-profit Organization</option>
                    <option value="business">For-profit Business</option>
                    <option value="educational">Educational Institution</option>
                    <option value="government">Government Entity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  Business Address <span className="text-teal-600">*</span>
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-600" />
                    <input
                      type="text"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        className="w-full px-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="State/Province"
                        value={formData.state_province}
                        onChange={(e) => updateFormData('state_province', e.target.value)}
                        className="w-full px-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ZIP/PIN Code"
                        value={formData.zip_pin}
                        onChange={(e) => updateFormData('zip_pin', e.target.value)}
                        className="w-full px-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Country"
                        value={formData.country}
                        onChange={(e) => updateFormData('country', e.target.value)}
                        className="w-full px-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-600" />
                  Required for organizer verification and event location services
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Event Types <span className="text-teal-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleEventType(cat.id)}
                      className={`group relative p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all duration-300 ${
                        formData.event_types.includes(cat.id)
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/20 shadow-lg'
                          : 'border-border bg-card hover:border-teal-600/50 hover:shadow-md'
                      }`}
                    >
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                        <span className="text-sm font-medium text-foreground">{cat.label}</span>
                        {formData.event_types.includes(cat.id) && (
                          <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center ml-auto">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Organization Description
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Brief description of your organization and event vision"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-teal-600 focus:bg-background text-foreground font-medium placeholder:text-muted-foreground transition-all duration-300 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl mb-6 shadow-lg shadow-teal-600/25">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-foreground">
                Review & Complete
              </h2>
              <p className="text-muted-foreground text-lg">
                Finalize your organizer profile and start creating events
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-muted border border-border rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-foreground">
                  <Phone className="w-5 h-5 text-teal-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                    <Phone className="w-5 h-5 text-teal-600" />
                    <span className="text-foreground font-medium">{formData.phone_country_code} {formData.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                    <Mail className="w-5 h-5 text-teal-600" />
                    <span className="text-foreground font-medium">{user?.email || 'Not available'}</span>
                  </div>
                  {formData.address && (
                    <div className="flex items-start gap-3 p-3 bg-background rounded-xl">
                      <MapPin className="w-5 h-5 text-teal-600 mt-0.5" />
                      <div className="text-foreground font-medium">
                        <div>{formData.address}</div>
                        {formData.city && <div>{formData.city}, {formData.state_province} {formData.zip_pin}</div>}
                        {formData.country && <div>{formData.country}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(formData.business_name || formData.business_type || formData.description) && (
                <div className="bg-muted border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-foreground">
                    <Building className="w-5 h-5 text-teal-600" />
                    Business Details
                  </h3>
                  <div className="space-y-3">
                    {formData.business_name && (
                      <div className="p-3 bg-background rounded-xl">
                        <span className="text-teal-600 font-semibold">Name:</span> <span className="text-foreground font-medium">{formData.business_name}</span>
                      </div>
                    )}
                    {formData.business_type && (
                      <div className="p-3 bg-background rounded-xl">
                        <span className="text-teal-600 font-semibold">Type:</span> <span className="text-foreground font-medium">{formData.business_type}</span>
                      </div>
                    )}
                    {formData.description && (
                      <div className="p-3 bg-background rounded-xl">
                        <span className="text-teal-600 font-semibold">Description:</span> <span className="text-foreground font-medium">{formData.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.event_types.length > 0 && (
                <div className="bg-muted border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-foreground">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    Event Types
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {formData.event_types.map(typeId => {
                      const category = CATEGORIES.find(c => c.id === typeId);
                      return category ? (
                        <span key={typeId} className="px-3 py-2 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 text-sm text-foreground rounded-xl">
                          {category.emoji} {category.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="bg-teal-50 dark:bg-teal-950/20 border-2 border-teal-200 dark:border-teal-800 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2 text-lg">You're Almost Ready!</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Once you complete this process, you'll be able to create and manage events on EventRadius with full organizer privileges.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted border-2 border-border rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-5 h-5 text-teal-600 border-border rounded focus:ring-teal-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="terms-checkbox" className="font-bold text-foreground cursor-pointer text-lg mb-2 block">
                      Terms and Conditions
                    </label>
                    <p className="text-muted-foreground leading-relaxed">
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <SEOHead 
        title="Organizer Onboarding" 
        description="Complete your organizer profile to start publishing events" 
      />

      <div className="w-full max-w-4xl relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-teal-600">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-3 text-sm font-medium border-2 border-border rounded-xl hover:bg-muted transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading || (step === totalSteps && (!formData.phone || !formData.address || !formData.city || !formData.state_province || !formData.zip_pin || !formData.country || formData.event_types.length === 0 || !termsAccepted))}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-teal-600/25"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
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
