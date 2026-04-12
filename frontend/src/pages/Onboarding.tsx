import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthWithBackend, globalRequestResults } from '@/hooks/useAuthWithBackend';
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
  const [isOrganizer] = useState<boolean>(false); // Default to event discoverer
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
    if (!user || !selectedCity || interests.length === 0) {
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

      // Clear the cache to ensure fresh data on next fetch
      const cacheKey = `userPreferences-${user.id}`;
      globalRequestResults.delete(cacheKey);
      
      await fetchOnboardingStatus(user.id);
      toast.success('Preferences saved!');

      // Redirect based on organizer status
      if (isOrganizer) {
        navigate('/organizer');
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

      <div className="w-full max-w-lg relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm font-medium text-teal-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: About You */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-foreground">Tell us about yourself</h2>
                  <p className="text-muted-foreground">Help us find the perfect events for you</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-teal-600" />
                      Age Range
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {AGE_RANGES.map(range => (
                        <button
                          key={range}
                          onClick={() => setAgeRange(range)}
                          className={`py-3 px-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                            ageRange === range 
                              ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400' 
                              : 'border-border bg-card hover:border-teal-600/50'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-teal-600" />
                      Do you have kids?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Yes, I have kids', value: true },
                        { label: 'No kids', value: false },
                      ].map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => setHasKids(opt.value)}
                          className={`py-3 px-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                            hasKids === opt.value 
                              ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400' 
                              : 'border-border bg-card hover:border-teal-600/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold text-sm rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-colors flex items-center justify-center gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Your Interests */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Your interests</h2>
              <p className="text-muted-foreground">Select categories you're interested in</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 max-h-80 overflow-y-auto pr-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleInterest(cat.id)}
                  className={`p-3 text-left rounded-lg border-2 flex items-center gap-2 transition-all duration-200 ${
                    interests.includes(cat.id)
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/20'
                      : 'border-border bg-card hover:border-teal-600/50'
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  {interests.includes(cat.id) && (
                    <Check className="w-4 h-4 text-teal-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-border text-sm font-medium rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} disabled={interests.length === 0} className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold text-sm rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Your location</h2>
              <p className="text-muted-foreground">Choose your city and preferred distance range</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Map className="w-4 h-4 text-teal-600" />
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={e => { setCitySearch(e.target.value); setSelectedCity(null); }}
                    placeholder="Search for your city..."
                    className="w-full bg-card border-2 border-border pl-12 pr-4 py-3 text-sm rounded-lg focus:outline-none focus:border-teal-600 text-foreground placeholder:text-muted-foreground transition-colors"
                  />
                  {filteredCities.length > 0 && !selectedCity && (
                    <div className="absolute top-full left-0 right-0 bg-card border-2 border-border border-t-0 z-10 max-h-64 overflow-y-auto rounded-b-lg shadow-lg mt-1">
                      {filteredCities.map(city => (
                        <button
                          key={`${city.name}-${city.state}`}
                          onClick={() => { setSelectedCity(city); setCitySearch(`${city.name}, ${city.state}`); }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors flex items-center gap-3"
                        >
                          <MapPin className="w-4 h-4 text-teal-600" />
                          <div>
                            <div className="font-medium text-foreground">{city.name}</div>
                            <div className="text-xs text-muted-foreground">{city.state}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Map className="w-4 h-4 text-teal-600" />
                  Distance Range (miles)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DISTANCE_OPTIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDistanceRange(d)}
                      className={`py-3 px-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                        distanceRange === d 
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400' 
                          : 'border-border bg-card hover:border-teal-600/50'
                      }`}
                    >
                      {d} mi
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border-2 border-border text-sm font-medium rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleComplete} 
                disabled={!selectedCity || saving} 
                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold text-sm rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete <Star className="w-4 h-4" />
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
