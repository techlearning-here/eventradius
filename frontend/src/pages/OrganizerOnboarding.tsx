import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { apiClient } from '@/integrations/backend/api';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { AccountDetails } from '@/components/AccountDetails';
import { ArrowRight, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  });

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
      }

      // Add organizer role to user
      await apiClient.addUserRole('organizer');
      
      // Set active role to organizer
      await setActiveRole('organizer');

      toast.success('Organizer onboarding completed successfully!');
      
      // Navigate to organizer dashboard
      navigate('/organizer');
    } catch (error) {
      console.error('Onboarding failed:', error);
      toast.error('Failed to complete organizer onboarding');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                    value={formData.phone_country_code}
                    onChange={(e) => updateFormData('phone_country_code', e.target.value)}
                    className="w-20 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)]"
                  />
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)]"
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
              <h2 className="text-2xl font-bold mb-2">Business Details</h2>
              <p className="text-muted-foreground">Tell us about your organization or business</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business/Organization Name</label>
                <input
                  type="text"
                  placeholder="Your business name"
                  value={formData.business_name}
                  onChange={(e) => updateFormData('business_name', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Type</label>
                <select
                  value={formData.business_type}
                  onChange={(e) => updateFormData('business_type', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)]"
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
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Brief description of your organization"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(295,100%,73%)]"
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
                </div>
              </div>

              {formData.business_name && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Business Details</h3>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {formData.business_name}</div>
                    {formData.business_type && (
                      <div><strong>Type:</strong> {formData.business_type}</div>
                    )}
                    {formData.description && (
                      <div><strong>Description:</strong> {formData.description}</div>
                    )}
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
              disabled={loading || (step === totalSteps && !formData.phone)}
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
