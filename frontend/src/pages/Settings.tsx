import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { CITIES, CATEGORIES, AGE_RANGES, DISTANCE_OPTIONS } from '@/data/cities';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { MapPin, Check, Save, Megaphone, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import { apiClient } from '@/integrations/backend/api';

const Settings = () => {
  const { user, userProfile, hasOrganizerRole, hasUserRole, addOrganizerRole, addUserRole, updateUserProfile } = useAuthWithBackend();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ageRange, setAgeRange] = useState('');
  const [hasKids, setHasKids] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<typeof CITIES[0] | null>(null);
  const [distanceRange, setDistanceRange] = useState(25);
  
  // Onboarding preferences state
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends' | 'private'>('public');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Set profile data from backend
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setBio(userProfile.bio || '');
    }
    
    const fetchPrefs = async () => {
      try {
        const data = await apiClient.getUserPreferences();

        if (data && Object.keys(data).length > 0) {
          setAgeRange(data.age_range || '');
          setHasKids(data.has_kids || false);
          setInterests((data.interests as string[]) || []);
          setDistanceRange(data.distance_range || 25);
          
          // Load onboarding preferences
          setOnboardingCompleted(data.onboarding_completed || false);
          setNotificationsEnabled(data.notifications_enabled !== false);
          setEmailUpdates(data.email_updates !== false);
          setPrivacyLevel((data.privacy_level as 'public' | 'friends' | 'private') || 'public');
          
          if (data.city) {
            setCitySearch(data.city);
            const match = CITIES.find(c => `${c.name}, ${c.state}` === data.city);
            if (match) setSelectedCity(match);
          }
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
      setLoading(false);
    };
    fetchPrefs();
  }, [user, userProfile, navigate]);

  const handleAddOrganizer = async () => {
    const { error } = await addOrganizerRole();
    if (error) toast.error(getErrorMessage(error));
    else {
      toast.success('You can now post events. Switch to Organize in the nav.');
      navigate('/organizer');
    }
  };

  const handleAddUserProfile = async () => {
    const { error } = await addUserRole();
    if (error) toast.error(getErrorMessage(error));
    else {
      toast.success('Discovery preferences enabled.');
      navigate('/onboarding');
    }
  };

  const filteredCities = citySearch.length > 0 && !selectedCity
    ? CITIES.filter(c => `${c.name}, ${c.state}`.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 8)
    : [];

  const toggleInterest = (id: string) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update user profile via backend API
      const { error: profileError } = await updateUserProfile({
        full_name: fullName || undefined,
        bio: bio || undefined,
      });

      if (profileError) throw profileError;

      // Update preferences via backend API
      await apiClient.updateUserPreferences({
        age_range: ageRange || null,
        has_kids: hasKids,
        interests,
        city: selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : null,
        latitude: selectedCity?.lat || null,
        longitude: selectedCity?.lng || null,
        distance_range: distanceRange,
        
        // Save onboarding preferences
        onboarding_completed: onboardingCompleted,
        notifications_enabled: notificationsEnabled,
        email_updates: emailUpdates,
        privacy_level: privacyLevel,
      });

      toast.success('Profile and preferences updated!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Settings" description="Update your event discovery preferences" />
      <Navbar />
      <div className="max-w-2xl mx-auto pt-28 pb-16 px-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Settings & Preferences</h1>

        {!hasOrganizerRole && (
          <section className="mb-10 p-4 border border-border bg-muted/30">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> Post events
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Add organizer access to create and manage events (you keep discovery preferences).
            </p>
            <button
              type="button"
              onClick={handleAddOrganizer}
              className="text-xs font-medium uppercase px-4 py-2 border border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Enable organizer
            </button>
          </section>
        )}

        {!hasUserRole && (
          <section className="mb-10 p-4 border border-border bg-muted/30">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Discover events
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Add a discovery profile with location and interests (you can still organize events).
            </p>
            <button
              type="button"
              onClick={handleAddUserProfile}
              className="text-xs font-medium uppercase px-4 py-2 border border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Enable discovery
            </button>
          </section>
        )}

        {hasUserRole && (
          <>
        {/* Profile Section */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          
          {/* Full Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground"
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
              className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground resize-none"
            />
          </div>
        </section>

        {/* Age */}
        <section className="mb-8">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3">Age Range</label>
          <div className="grid grid-cols-3 gap-2">
            {AGE_RANGES.map(range => (
              <button key={range} onClick={() => setAgeRange(range)}
                className={`py-2.5 text-sm border transition-colors ${ageRange === range ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                {range}
              </button>
            ))}
          </div>
        </section>

        {/* Kids */}
        <section className="mb-8">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3">Have Kids?</label>
          <div className="flex gap-2">
            {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
              <button key={opt.label} onClick={() => setHasKids(opt.value)}
                className={`flex-1 py-2.5 text-sm border transition-colors ${hasKids === opt.value ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Interests */}
        <section className="mb-8">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3">Interests</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => toggleInterest(cat.id)}
                className={`py-3 px-4 text-left border flex items-center gap-3 transition-colors ${interests.includes(cat.id) ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                <span>{cat.emoji}</span>
                <span className="text-sm font-medium">{cat.label}</span>
                {interests.includes(cat.id) && <Check className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </section>

        {/* City */}
        <section className="mb-8">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3">City</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={citySearch}
              onChange={e => { setCitySearch(e.target.value); setSelectedCity(null); }}
              placeholder="Search for your city..."
              className="w-full border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-foreground" />
            {filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border border-border border-t-0 z-10 max-h-48 overflow-y-auto">
                {filteredCities.map(city => (
                  <button key={`${city.name}-${city.state}`}
                    onClick={() => { setSelectedCity(city); setCitySearch(`${city.name}, ${city.state}`); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors">
                    {city.name}, {city.state}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Onboarding Preferences */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Onboarding Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Onboarding Completed</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnboardingCompleted(true)}
                  className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                    onboardingCompleted 
                      ? 'border-foreground bg-foreground text-background' 
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setOnboardingCompleted(false)}
                  className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                    !onboardingCompleted 
                      ? 'border-foreground bg-foreground text-background' 
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 text-foreground"
                />
                Enable Notifications
              </label>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={(e) => setEmailUpdates(e.target.checked)}
                  className="w-4 h-4 text-foreground"
                />
                Email Updates
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Privacy Level</label>
              <select
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value as 'public' | 'friends' | 'private')}
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground"
              >
                <option value="public">Public - Everyone can see my profile</option>
                <option value="friends">Friends - Only friends can see my profile</option>
                <option value="private">Private - Only I can see my profile</option>
              </select>
            </div>
          </div>
        </section>

        {/* Distance */}
        <section className="mb-10">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3">Distance Range (miles)</label>
          <div className="flex gap-2">
            {DISTANCE_OPTIONS.map(d => (
              <button key={d} onClick={() => setDistanceRange(d)}
                className={`flex-1 py-2.5 text-sm border transition-colors ${distanceRange === d ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                {d} mi
              </button>
            ))}
          </div>
        </section>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 bg-foreground text-background font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile & Preferences'}
        </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
