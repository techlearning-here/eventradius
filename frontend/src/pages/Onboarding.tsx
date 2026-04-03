import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { CITIES, CATEGORIES, AGE_RANGES, DISTANCE_OPTIONS } from '@/data/cities';
import { SEOHead } from '@/components/SEOHead';
import { MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react';
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
      await apiClient.updateUserPreferences({
        age_range: ageRange || null,
        has_kids: hasKids,
        interests,
        city: `${selectedCity.name}, ${selectedCity.state}`,
        latitude: selectedCity.lat,
        longitude: selectedCity.lng,
        distance_range: distanceRange,
        onboarding_completed: true,
        is_organizer: isOrganizer,
      });

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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <SEOHead title="Set Up Your Preferences" description="Tell us about your interests and location to discover events near you." />

      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 ${s <= step ? 'bg-[hsl(295,100%,73%)]' : 'bg-foreground/10'} transition-colors`} />
          ))}
        </div>

        {/* Step 1: Organizer Question */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-2">Are you an event organizer?</h2>
            <p className="text-foreground/50 mb-8 text-sm">This helps us customize your experience.</p>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => setIsOrganizer(true)}
                className={`w-full py-4 px-6 text-lg border-2 transition-all ${
                  isOrganizer === true 
                    ? 'border-[hsl(295,100%,73%)] bg-[hsl(295,100%,73%)]/10 text-[hsl(295,100%,73%)]' 
                    : 'border-foreground/20 hover:border-[hsl(295,100%,73%)] hover:bg-[hsl(295,100%,73%)]/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[hsl(295,100%,73%)]/20 flex items-center justify-center">
                    <span className="text-[hsl(295,100%,73%)]">🎯</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Yes, I create events</div>
                    <div className="text-sm opacity-75">Access event creation tools and analytics</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setIsOrganizer(false)}
                className={`w-full py-4 px-6 text-lg border-2 transition-all ${
                  isOrganizer === false 
                    ? 'border-[hsl(295,100%,73%)] bg-[hsl(295,100%,73%)]/10 text-[hsl(295,100%,73%)]' 
                    : 'border-foreground/20 hover:border-[hsl(295,100%,73%)] hover:bg-[hsl(295,100%,73%)]/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                    <span>👤</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">No, I discover events</div>
                    <div className="text-sm opacity-75">Browse and join events near me</div>
                  </div>
                </div>
              </button>
            </div>

            <button onClick={() => setStep(2)} className="w-full py-4 bg-[hsl(295,100%,73%)] text-foreground font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[hsl(295,100%,78%)] transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Demographics */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-2">About you</h2>
            <p className="text-foreground/50 mb-8 text-sm">Help us personalize your event feed.</p>

            <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-3">Age Range</label>
            <div className="grid grid-cols-3 gap-2 mb-8">
              {AGE_RANGES.map(range => (
                <button
                  key={range}
                  onClick={() => setAgeRange(range)}
                  className={`py-3 text-sm border transition-colors ${ageRange === range ? 'border-[hsl(295,100%,73%)] bg-[hsl(295,100%,73%)]/10 text-[hsl(295,100%,73%)]' : 'border-foreground/20 hover:border-foreground/40'}`}
                >
                  {range}
                </button>
              ))}
            </div>

            <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-3">Do you have kids?</label>
            <div className="flex gap-2 mb-8">
              {[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setHasKids(opt.value)}
                  className={`flex-1 py-3 text-sm border transition-colors ${hasKids === opt.value ? 'border-[hsl(295,100%,73%)] bg-[hsl(295,100%,73%)]/10 text-[hsl(295,100%,73%)]' : 'border-foreground/20 hover:border-foreground/40'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button onClick={() => setStep(3)} className="w-full py-4 bg-[hsl(295,100%,73%)] text-foreground font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[hsl(295,100%,78%)] transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-2">Your interests</h2>
            <p className="text-foreground/50 mb-8 text-sm">Select categories you're interested in.</p>

            <div className="grid grid-cols-2 gap-2 mb-8">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleInterest(cat.id)}
                  className={`py-3 px-4 text-left border flex items-center gap-3 transition-colors ${interests.includes(cat.id) ? 'border-[hsl(295,100%,73%)] bg-[hsl(295,100%,73%)]/10' : 'border-foreground/20 hover:border-foreground/40'}`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                  {interests.includes(cat.id) && <Check className="w-4 h-4 text-[hsl(295,100%,73%)] ml-auto" />}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 border border-foreground/20 text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(4)} disabled={interests.length === 0} className="flex-1 py-4 bg-[hsl(295,100%,73%)] text-foreground font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[hsl(295,100%,78%)] transition-colors disabled:opacity-40">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-2">Your location</h2>
            <p className="text-foreground/50 mb-8 text-sm">Choose your city and preferred distance range.</p>

            <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-3">City</label>
            <div className="relative mb-6">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type="text"
                value={citySearch}
                onChange={e => { setCitySearch(e.target.value); setSelectedCity(null); }}
                placeholder="Search for your city..."
                className="w-full bg-foreground/5 border border-foreground/20 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[hsl(295,100%,73%)] text-foreground placeholder:text-foreground/30"
              />
              {filteredCities.length > 0 && !selectedCity && (
                <div className="absolute top-full left-0 right-0 bg-background border border-foreground/20 border-t-0 z-10 max-h-48 overflow-y-auto">
                  {filteredCities.map(city => (
                    <button
                      key={`${city.name}-${city.state}`}
                      onClick={() => { setSelectedCity(city); setCitySearch(`${city.name}, ${city.state}`); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-foreground/5 transition-colors"
                    >
                      {city.name}, {city.state}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-3">Distance Range (miles)</label>
            <div className="flex gap-2 mb-8">
              {DISTANCE_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDistanceRange(d)}
                  className={`flex-1 py-3 text-sm border transition-colors ${distanceRange === d ? 'border-[hsl(295,100%,73%)] bg-[hsl(295,100%,73%)]/10 text-[hsl(295,100%,73%)]' : 'border-foreground/20 hover:border-foreground/40'}`}
                >
                  {d} mi
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 py-4 border border-foreground/20 text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleComplete} disabled={!selectedCity || saving} className="flex-1 py-4 bg-[hsl(295,100%,73%)] text-foreground font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[hsl(295,100%,78%)] transition-colors disabled:opacity-40">
                {saving ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
