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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 rounded-3xl mb-8 shadow-2xl shadow-violet-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                <Phone className="w-10 h-10 text-white relative z-10" />
              </div>
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
                Contact Details
              </h2>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                Let our smart system verify your organizer credentials
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  Phone Number <span className="text-violet-400">*</span>
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="+1"
                      value={formData.phone_country_code || '+1'}
                      onChange={handleCountryCodeChange}
                      className="w-24 px-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300"
                      maxLength={5}
                    />
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                    <input
                      type="tel"
                      placeholder="Your phone number"
                      value={formData.phone || ''}
                      onChange={handlePhoneChange}
                      className="w-full pl-12 pr-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>
                <p className="text-sm text-white/60 mt-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  Required for secure event communication and organizer verification
                </p>
              </div>

              <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/10 border-2 border-violet-400/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Why Verification Matters</h4>
                    <p className="text-white/70 leading-relaxed">
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 rounded-3xl mb-8 shadow-2xl shadow-violet-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                <Building className="w-10 h-10 text-white relative z-10" />
              </div>
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
                Business Information
              </h2>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                Configure your organizer profile for successful events
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-violet-400" />
                  Business/Organization Name
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                  <input
                    type="text"
                    placeholder="Your business name"
                    value={formData.business_name}
                    onChange={(e) => updateFormData('business_name', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-400" />
                  Organization Type
                </label>
                <div className="relative">
                  <select
                    value={formData.business_type}
                    onChange={(e) => updateFormData('business_type', e.target.value)}
                    className="w-full px-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-800">Select organization type</option>
                    <option value="individual" className="bg-slate-800">Individual</option>
                    <option value="nonprofit" className="bg-slate-800">Non-profit Organization</option>
                    <option value="business" className="bg-slate-800">For-profit Business</option>
                    <option value="educational" className="bg-slate-800">Educational Institution</option>
                    <option value="government" className="bg-slate-800">Government Entity</option>
                    <option value="other" className="bg-slate-800">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  Business Address <span className="text-violet-400">*</span>
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                    <input
                      type="text"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        className="w-full px-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="State/Province"
                        value={formData.state_province}
                        onChange={(e) => updateFormData('state_province', e.target.value)}
                        className="w-full px-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300"
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
                        className="w-full px-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Country"
                        value={formData.country}
                        onChange={(e) => updateFormData('country', e.target.value)}
                        className="w-full px-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white/60 mt-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  Required for organizer verification and event location services
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Event Types <span className="text-violet-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleEventType(cat.id)}
                      className={`group relative p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all duration-500 backdrop-blur-sm ${
                        formData.event_types.includes(cat.id)
                          ? 'border-violet-400 bg-gradient-to-br from-violet-500/20 to-teal-500/10 shadow-2xl shadow-violet-500/30 scale-[1.03]'
                          : 'border-white/20 bg-white/5 hover:border-violet-400/50 hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-transparent hover:shadow-xl hover:shadow-violet-500/20'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                        <span className="text-sm font-medium text-white">{cat.label}</span>
                        {formData.event_types.includes(cat.id) && (
                          <div className="w-6 h-6 rounded-full bg-violet-400 flex items-center justify-center ml-auto shadow-lg shadow-violet-400/50">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Organization Description
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Brief description of your organization and event vision"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white font-medium placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 resize-none"
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 rounded-3xl mb-8 shadow-2xl shadow-violet-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                <CheckCircle className="w-10 h-10 text-white relative z-10" />
              </div>
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
                Review & Complete
              </h2>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                Finalize your organizer profile and start creating events
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-violet-400" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Phone className="w-5 h-5 text-violet-400" />
                    <span className="text-white font-medium">{formData.phone_country_code} {formData.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Mail className="w-5 h-5 text-violet-400" />
                    <span className="text-white font-medium">{user?.email || 'Not available'}</span>
                  </div>
                  {formData.address && (
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                      <MapPin className="w-5 h-5 text-violet-400 mt-0.5" />
                      <div className="text-white font-medium">
                        <div>{formData.address}</div>
                        {formData.city && <div>{formData.city}, {formData.state_province} {formData.zip_pin}</div>}
                        {formData.country && <div>{formData.country}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(formData.business_name || formData.business_type || formData.description) && (
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-violet-400" />
                    Business Details
                  </h3>
                  <div className="space-y-3">
                    {formData.business_name && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <span className="text-violet-400 font-semibold">Name:</span> <span className="text-white font-medium">{formData.business_name}</span>
                      </div>
                    )}
                    {formData.business_type && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <span className="text-violet-400 font-semibold">Type:</span> <span className="text-white font-medium">{formData.business_type}</span>
                      </div>
                    )}
                    {formData.description && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <span className="text-violet-400 font-semibold">Description:</span> <span className="text-white font-medium">{formData.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.event_types.length > 0 && (
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Event Types
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {formData.event_types.map(typeId => {
                      const category = CATEGORIES.find(c => c.id === typeId);
                      return category ? (
                        <span key={typeId} className="px-3 py-2 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 border border-cyan-400/30 text-sm rounded-xl backdrop-blur-sm">
                          {category.emoji} {category.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-violet-500/20 to-teal-500/10 border-2 border-violet-400/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-lg">You're Almost Ready!</h4>
                    <p className="text-white/80 leading-relaxed">
                      Once you complete this process, you'll be able to create and manage events on EventRadius with full organizer privileges.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 border-2 border-cyan-400/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 text-cyan-600 border-cyan-300 rounded focus:ring-cyan-500 opacity-0 absolute"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                      termsAccepted 
                        ? 'bg-cyan-400 border-cyan-400' 
                        : 'bg-white/10 border-white/30'
                    }`}>
                      {termsAccepted && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="terms-checkbox" className="font-bold text-white cursor-pointer text-lg mb-2 block">
                      Terms and Conditions
                    </label>
                    <p className="text-white/70 leading-relaxed">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* AI-themed background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
        
        {/* Floating AI elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Neural network lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <pattern id="neural-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 0 50 L 100 50 M 50 0 L 50 100" stroke="url(#ai-gradient)" strokeWidth="0.5" opacity="0.3" />
            <circle cx="50" cy="50" r="2" fill="url(#ai-gradient)" opacity="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>
      </div>

      <SEOHead 
        title="Organizer Onboarding" 
        description="Complete your organizer profile to start publishing events" 
      />

      <div className="w-full max-w-4xl relative z-10">
        {/* AI-themed progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white/70">Organizer Setup</span>
            <span className="text-sm font-medium text-violet-400">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="relative h-4 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-600/50">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-violet-500/50"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
            {/* Progress nodes */}
            <div className="absolute inset-0 flex items-center">
              {[1, 2, 3].map(node => (
                <div 
                  key={node}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    node <= step 
                      ? 'bg-violet-400 border-violet-300 shadow-lg shadow-violet-400/50' 
                      : 'bg-white/10 border-white/20'
                  }`}
                  style={{ left: `${((node - 1) / 2) * 100}%`, transform: 'translateX(-50%)' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-800/50 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-3 text-sm font-medium border-2 border-white/20 rounded-xl hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading || (step === totalSteps && (!formData.phone || !formData.address || !formData.city || !formData.state_province || !formData.zip_pin || !formData.country || formData.event_types.length === 0 || !termsAccepted))}
              className="px-8 py-3 bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:from-violet-600 hover:via-purple-600 hover:to-cyan-600 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/70"
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
