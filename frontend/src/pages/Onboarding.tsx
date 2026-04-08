import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { CITIES, CATEGORIES, AGE_RANGES, DISTANCE_OPTIONS } from '@/data/cities';
import { SEOHead } from '@/components/SEOHead';
import { MapPin, ChevronRight, ChevronLeft, Check, Sparkles, Users, Calendar, Map, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import { apiClient } from '@/integrations/backend/api';

const Onboarding = () => {
  const { user, fetchOnboardingStatus } = useAuthWithBackend();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [ageRange, setAgeRange] = useState('');
  const [hasKids, setHasKids] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState<boolean | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<typeof CITIES[0] | null>(null);
  const [distanceRange, setDistanceRange] = useState(25);
  const [saving, setSaving] = useState(false);

  const filteredCities = citySearch.length > 0
    ? CITIES.filter(c => `${c.name}, ${c.state}`.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 8)
    : [];

  const toggleInterest = (id: string) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleComplete = async () => {
    if (!user || !selectedCity || interests.length === 0 || isOrganizer === null) {
      toast.error('Please complete all fields');
      return;
    }

    setSaving(true);
    try {
      const preferencesData = {
        age_range: ageRange || null,
        has_kids: hasKids,
        interests,
        city: `${selectedCity.name}, ${selectedCity.state}`,
        latitude: selectedCity.lat,
        longitude: selectedCity.lng,
        distance_range: distanceRange,
        onboarding_completed: true,
        is_organizer: isOrganizer,
      };
      
      console.log('🚀 Sending preferences to API:', preferencesData);
      console.log('🚀 is_organizer value being sent:', isOrganizer);
      
      await apiClient.updateUserPreferences(preferencesData);
      
      console.log('✅ Preferences updated successfully');

      await fetchOnboardingStatus(user.id);
      toast.success('Preferences saved!');

      // Redirect based on organizer status
      if (isOrganizer) {
        navigate('/create-event');
      } else {
        navigate('/discover');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Failed to save preferences');
    } finally {
      setSaving(false);
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

      <SEOHead title="Set Up Your Preferences" description="Tell us about your interests and location to discover events near you." />

      <div className="w-full max-w-lg relative z-10">
        {/* AI-themed progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white/70">Smart Setup</span>
            <span className="text-sm font-medium text-violet-400">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-violet-500/50"
              style={{ width: `${(step / 4) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
            {/* Progress nodes */}
            <div className="absolute inset-0 flex items-center">
              {[1, 2, 3, 4].map(node => (
                <div 
                  key={node}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    node <= step 
                      ? 'bg-violet-400 border-violet-300 shadow-lg shadow-violet-400/50' 
                      : 'bg-white/10 border-white/20'
                  }`}
                  style={{ left: `${((node - 1) / 3) * 100}%`, transform: 'translateX(-50%)' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step 1: Discover vs Post Events Choice */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 rounded-3xl mb-8 shadow-2xl shadow-violet-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                <Sparkles className="w-10 h-10 text-white relative z-10" />
              </div>
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
                Smart Discovery
              </h2>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                Let our smart system personalize your event experience
              </p>
            </div>

            <div className="grid gap-6 mb-10">
              <button
                onClick={() => setIsOrganizer(false)}
                className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 backdrop-blur-sm ${
                  isOrganizer === false
                    ? 'border-violet-400 bg-gradient-to-br from-violet-500/20 to-purple-500/10 shadow-2xl shadow-violet-500/30 scale-[1.03] border-opacity-100'
                    : 'border-white/20 bg-white/5 hover:border-violet-400/50 hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-transparent hover:shadow-xl hover:shadow-violet-500/20'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isOrganizer === false 
                      ? 'bg-gradient-to-br from-violet-500 to-cyan-500 shadow-xl shadow-violet-500/50' 
                      : 'bg-white/10 group-hover:bg-violet-500/20'
                  }`}>
                    <Users className={`w-8 h-8 transition-colors ${
                      isOrganizer === false ? 'text-white' : 'text-violet-400'
                    }`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-2xl mb-2 bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">Discover Events</div>
                    <div className="text-white/60 leading-relaxed">
                      Smart recommendations based on your preferences
                    </div>
                  </div>
                  {isOrganizer === false && (
                    <div className="w-8 h-8 rounded-full bg-violet-400 flex items-center justify-center shadow-lg shadow-violet-400/50">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setIsOrganizer(true)}
                className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 backdrop-blur-sm ${
                  isOrganizer === true
                    ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-violet-500/10 shadow-2xl shadow-cyan-500/30 scale-[1.03] border-opacity-100'
                    : 'border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-gradient-to-br hover:from-cyan-500/10 hover:to-transparent hover:shadow-xl hover:shadow-cyan-500/20'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isOrganizer === true 
                      ? 'bg-gradient-to-br from-cyan-500 to-violet-500 shadow-xl shadow-cyan-500/50' 
                      : 'bg-white/10 group-hover:bg-cyan-500/20'
                  }`}>
                    <Calendar className={`w-8 h-8 transition-colors ${
                      isOrganizer === true ? 'text-white' : 'text-cyan-400'
                    }`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-2xl mb-2 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">Create Events</div>
                    <div className="text-white/60 leading-relaxed">
                      Smart tools for successful event management
                    </div>
                  </div>
                  {isOrganizer === true && (
                    <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/50">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </button>
            </div>

            <button 
              onClick={() => setStep(2)} 
              disabled={isOrganizer === null}
              className="w-full py-5 bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 hover:from-violet-600 hover:via-purple-600 hover:to-cyan-600 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-violet-500/50 hover:shadow-3xl hover:shadow-violet-500/70 rounded-2xl backdrop-blur-sm border border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">Continue Setup</span>
              <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        )}

        {/* Step 2: Role-specific questions */}
        {step === 2 && (
          <div className="animate-fade-in">
            {isOrganizer === false ? (
              <>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-violet-500/25">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Tell us about yourself</h2>
                  <p className="text-white/60 text-lg">Help us find the perfect events for you</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4 text-violet-500" />
                      Age Range
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {AGE_RANGES.map(range => (
                        <button
                          key={range}
                          onClick={() => setAgeRange(range)}
                          className={`py-4 px-4 text-sm font-medium rounded-xl border-2 transition-all duration-300 ${
                            ageRange === range 
                              ? 'border-violet-500 bg-gradient-to-br from-violet-500/10 to-violet-500/5 text-violet-500 shadow-lg shadow-violet-500/20 scale-[1.02]' 
                              : 'border-white/20 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-violet-500" />
                      Do you have kids?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Yes, I have kids', value: true, icon: 'ð' },
                        { label: 'No kids', value: false, icon: 'ð' },
                      ].map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => setHasKids(opt.value)}
                          className={`py-4 px-4 text-sm font-medium rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                            hasKids === opt.value 
                              ? 'border-violet-500 bg-gradient-to-br from-violet-500/10 to-violet-500/5 text-violet-500 shadow-lg shadow-violet-500/20 scale-[1.02]' 
                              : 'border-white/20 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5'
                          }`}
                        >
                          <span className="text-lg">{opt.icon}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-3xl mb-8 shadow-2xl shadow-emerald-500/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                    <Calendar className="w-10 h-10 text-white relative z-10" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                    Event Creator Setup
                  </h2>
                  <p className="text-white/60 text-lg leading-relaxed font-light">
                    Configure your organizer profile for successful events
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Event Categories
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.slice(0, 6).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleInterest(cat.id)}
                        className={`group relative p-4 text-left rounded-2xl border-2 flex items-center gap-3 transition-all duration-500 backdrop-blur-sm ${
                          interests.includes(cat.id) 
                            ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 shadow-2xl shadow-emerald-500/30 scale-[1.03]' 
                            : 'border-white/20 bg-white/5 hover:border-emerald-400/50 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent hover:shadow-xl hover:shadow-emerald-500/20'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10 flex items-center gap-3 w-full">
                          <span className="text-3xl flex-shrink-0">{cat.emoji}</span>
                          <span className="text-sm font-medium text-white">{cat.label}</span>
                          {interests.includes(cat.id) && (
                            <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center ml-auto shadow-lg shadow-emerald-400/50">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Target Audience
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {AGE_RANGES.map(range => (
                      <button
                        key={range}
                        onClick={() => setAgeRange(range)}
                        className={`py-4 px-4 text-sm font-medium rounded-xl border-2 transition-all duration-500 backdrop-blur-sm ${
                          ageRange === range 
                            ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-300 shadow-lg shadow-emerald-500/30 scale-[1.03]' 
                            : 'border-white/20 bg-white/5 hover:border-emerald-400/50 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent hover:shadow-lg hover:shadow-emerald-500/20'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 mt-10">
              <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-foreground/20 text-sm font-medium uppercase tracking-wider hover:bg-foreground/5 transition-all duration-300 flex items-center justify-center gap-2 rounded-xl">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-teal-500 text-white font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:from-teal-500 hover:to-violet-500 transition-all duration-300 rounded-xl shadow-lg shadow-violet-500/25">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Role-specific content */}
        {step === 3 && (
          <div className="animate-fade-in">
            {isOrganizer === false ? (
              <>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-purple-500/25">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Your interests</h2>
                  <p className="text-white/60 text-lg">Select categories you're interested in</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8 max-h-96 overflow-y-auto pr-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleInterest(cat.id)}
                      className={`py-4 px-4 text-left rounded-xl border-2 flex items-center gap-3 transition-all duration-300 ${
                        interests.includes(cat.id) 
                          ? 'border-violet-500 bg-gradient-to-br from-violet-500/10 to-violet-500/5 shadow-lg shadow-violet-500/20 scale-[1.02]' 
                          : 'border-white/20 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                      {interests.includes(cat.id) && (
                        <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center ml-auto">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-foreground/20 text-sm font-medium uppercase tracking-wider hover:bg-foreground/5 transition-all duration-300 flex items-center justify-center gap-2 rounded-xl">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => setStep(4)} disabled={interests.length === 0} className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-teal-500 text-white font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:from-teal-500 hover:to-violet-500 transition-all duration-300 rounded-xl shadow-lg shadow-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 rounded-3xl mb-8 shadow-2xl shadow-amber-500/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                    <Sparkles className="w-10 h-10 text-white relative z-10" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent">
                    Event Preferences
                  </h2>
                  <p className="text-white/60 text-lg leading-relaxed font-light">
                    Fine-tune your event creation settings
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      More Event Types
                    </label>
                    <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
                      {CATEGORIES.slice(6).map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => toggleInterest(cat.id)}
                          className={`group relative p-4 text-left rounded-2xl border-2 flex items-center gap-3 transition-all duration-500 backdrop-blur-sm ${
                            interests.includes(cat.id) 
                              ? 'border-amber-400 bg-gradient-to-br from-amber-500/20 to-orange-500/10 shadow-2xl shadow-amber-500/30 scale-[1.03]' 
                              : 'border-white/20 bg-white/5 hover:border-amber-400/50 hover:bg-gradient-to-br hover:from-amber-500/10 hover:to-transparent hover:shadow-xl hover:shadow-amber-500/20'
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative z-10 flex items-center gap-3 w-full">
                            <span className="text-3xl flex-shrink-0">{cat.emoji}</span>
                            <span className="text-sm font-medium text-white">{cat.label}</span>
                            {interests.includes(cat.id) && (
                              <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center ml-auto shadow-lg shadow-amber-400/50">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-amber-400" />
                      Event Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'All Ages Welcome', value: true, icon: 'ð' },
                        { label: '18+ Only', value: false, icon: 'ð' },
                      ].map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => setHasKids(opt.value)}
                          className={`group relative p-4 rounded-2xl border-2 transition-all duration-500 flex items-center justify-center gap-3 backdrop-blur-sm ${
                            hasKids === opt.value 
                              ? 'border-amber-400 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-300 shadow-2xl shadow-amber-500/30 scale-[1.03]' 
                              : 'border-white/20 bg-white/5 hover:border-amber-400/50 hover:bg-gradient-to-br hover:from-amber-500/10 hover:to-transparent hover:shadow-xl hover:shadow-amber-500/20'
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative z-10 flex items-center gap-3">
                            <span className="text-2xl">{opt.icon}</span>
                            <span className="text-sm font-medium">{opt.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-white/20 text-sm font-medium uppercase tracking-wider hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2 rounded-xl backdrop-blur-sm">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => setStep(4)} className="flex-1 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 transition-all duration-500 rounded-xl shadow-2xl shadow-amber-500/50">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-6 shadow-lg shadow-teal-500/25">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Your location</h2>
              <p className="text-white/60 text-lg">Choose your city and preferred distance range</p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                  <Map className="w-4 h-4 text-violet-500" />
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={e => { setCitySearch(e.target.value); setSelectedCity(null); }}
                    placeholder="Search for your city..."
                    className="w-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-white/20 pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-violet-500 focus:bg-gradient-to-br focus:from-violet-500/20 focus:to-slate-800/80 text-white placeholder:text-white/60 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  />
                  {filteredCities.length > 0 && !selectedCity && (
                    <div className="absolute top-full left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-2 border-white/20 border-t-0 z-10 max-h-64 overflow-y-auto rounded-b-xl shadow-lg">
                      {filteredCities.map(city => (
                        <button
                          key={`${city.name}-${city.state}`}
                          onClick={() => { setSelectedCity(city); setCitySearch(`${city.name}, ${city.state}`); }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-violet-500/5 transition-colors flex items-center gap-3"
                        >
                          <MapPin className="w-4 h-4 text-violet-500" />
                          <div>
                            <div className="font-medium">{city.name}</div>
                            <div className="text-xs text-white/60">{city.state}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                  <Map className="w-4 h-4 text-violet-500" />
                  Distance Range (miles)
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {DISTANCE_OPTIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDistanceRange(d)}
                      className={`py-4 px-3 text-sm font-medium rounded-xl border-2 transition-all duration-300 ${
                        distanceRange === d 
                          ? 'border-violet-500 bg-gradient-to-br from-violet-500/10 to-violet-500/5 text-violet-500 shadow-lg shadow-violet-500/20 scale-[1.02]' 
                          : 'border-white/20 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5'
                      }`}
                    >
                      {d} mi
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setStep(3)} className="flex-1 py-4 border-2 border-foreground/20 text-sm font-medium uppercase tracking-wider hover:bg-foreground/5 transition-all duration-300 flex items-center justify-center gap-2 rounded-xl">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleComplete} 
                disabled={!selectedCity || saving} 
                className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-teal-500 text-white font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:from-teal-500 hover:to-violet-500 transition-all duration-300 rounded-xl shadow-lg shadow-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup <Star className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
