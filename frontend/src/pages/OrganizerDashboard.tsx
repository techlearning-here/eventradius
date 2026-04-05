import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/integrations/backend/api';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { Navbar } from '@/components/Navbar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { SEOHead } from '@/components/SEOHead';
import { CATEGORIES, CITIES } from '@/data/cities';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn, getErrorMessage } from '@/lib/utils';
import { Plus, Trash2, MapPin, X, ArrowRight, Maximize2, Minimize2, CalendarDays, Users, Settings, BarChart3, FileText, CreditCard, HelpCircle, LogOut, Home, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
];

interface OrgEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  event_type: string;
  event_status: string;
  admin_remark: string | null;
  background_image_url: string;
  category: string;
  city: string | null;
}

interface ParticipantRow {
  user_id: string;
  status: string;
  profiles: { display_name: string | null } | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600',
  approved: 'bg-green-500/20 text-green-600',
  rejected: 'bg-destructive/20 text-red-600',
  deactivated: 'bg-muted text-muted-foreground',
};

const OrganizerDashboard = () => {
  const { user, role, loading: authLoading } = useAuthWithBackend();
  const navigate = useNavigate();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<OrgEvent | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState('events');
  const [sidebarIconized, setSidebarIconized] = useState(false);

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'events', label: 'My Events', icon: CalendarDays, description: 'Manage your events' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'View performance metrics' },
    { id: 'attendees', label: 'Attendees', icon: Users, description: 'Manage participant lists' },
    { id: 'promotions', label: 'Promotions', icon: Megaphone, description: 'Marketing tools' },
    { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Payment & subscription' },
    { id: 'resources', label: 'Resources', icon: FileText, description: 'Guides & documentation' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Account preferences' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, description: 'Get assistance' },
  ];

  const totalWizardSteps = 9;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('community');
  const [kidFriendly, setKidFriendly] = useState(false);
  const [price, setPrice] = useState('');
  const [eventType, setEventType] = useState<'standard' | 'preview'>('standard');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<typeof CITIES[0] | null>(null);
  const [address, setAddress] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [country, setCountry] = useState('');
  const [zipPin, setZipPin] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New fields for enhanced wizard
  const [subtitle, setSubtitle] = useState('');
  const [summary, setSummary] = useState('');
  const [language, setLanguage] = useState('en');
  const [event_type, setEventType_new] = useState<'online' | 'in_person' | 'hybrid'>('in_person');
  const [event_format, setEventFormat] = useState<'single' | 'recurring' | 'multi_date'>('single');
  const [event_privacy, setEventPrivacy] = useState<'public' | 'private' | 'unlisted'>('public');
  const [event_timezone, setEventTimezone] = useState('UTC');
  const [doors_open_time, setDoorsOpenTime] = useState('');
  const [registration_start_time, setRegistrationStartTime] = useState('');
  const [registration_end_time, setRegistrationEndTime] = useState('');
  const [virtual_event_url, setVirtualEventUrl] = useState('');
  const [virtual_event_platform, setVirtualEventPlatform] = useState('');
  const [event_password, setEventPassword] = useState('');
  const [age_restriction, setAgeRestriction] = useState('');
  const [accessibility_options, setAccessibilityOptions] = useState('');
  const [event_website, setEventWebsite] = useState('');
  const [event_contact_email, setEventContactEmail] = useState('');
  const [ticketing_website, setTicketingWebsite] = useState('');
  const [refund_policy, setRefundPolicy] = useState<'no_refunds' | 'refund_up_to_7_days' | 'refund_up_to_24_hours' | 'refund_up_to_1_hour' | 'custom'>('no_refunds');
  const [custom_refund_policy, setCustomRefundPolicy] = useState('');
  const [ticket_pricing_description, setTicketPricingDescription] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'organizer')) navigate('/');
  }, [authLoading, user, role, navigate]);

  useEffect(() => {
    if (user && role === 'organizer') fetchEvents();
  }, [user, role]);

  // ESC key listener to exit fullscreen
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isFullscreen]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const events = await apiClient.getUserEvents();
      setEvents(events.created || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId: string) => {
    try {
      // For now, we'll skip participants fetching since backend endpoint doesn't exist yet
      // TODO: Implement getEventParticipants in backend API
      console.log('Participants fetching not implemented yet for event:', eventId);
      setParticipants([]);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    }
  };

  const filteredCities = citySearch.length > 0 && !selectedCity
    ? CITIES.filter(c => `${c.name}, ${c.state}`.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 6)
    : [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { toast.error('Please upload JPG, PNG, or WebP'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user || !title.trim() || !description.trim() || !startDate || !startTime || !endTime || !address.trim() || !country.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      let publicUrl = null;
      
      // Only upload image if one is provided - using backend API instead of direct Supabase
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const result = await response.json();
        publicUrl = result.publicUrl;
      }

      const targetDate = new Date(startDate);
      const [h, m] = startTime.split(':');
      targetDate.setHours(parseInt(h) || 0, parseInt(m) || 0);

      const { data: profile } = await apiClient.getCurrentUserProfile();

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        location: `${address.trim()}, ${stateProvince ? stateProvince + ', ' : ''}${citySearch ? citySearch + ', ' : ''}${zipPin ? zipPin + ', ' : ''}${country.trim()}`,
        start_time: targetDate.toISOString(),
        end_time: (() => {
          const [endH, endM] = endTime.split(':');
          const endDate = new Date(startDate);
          endDate.setHours(parseInt(endH) || 0, parseInt(endM) || 0);
          return endDate.toISOString();
        })(),
        timezone,
        image_url: publicUrl,
        category,
        max_participants: null,
        is_public: true,
        price: price ? parseFloat(price) : null,
        kid_friendly: kidFriendly,
        event_type: eventType,
      };

      await apiClient.createEvent(eventData);
      toast.success('Event submitted for approval!');
      setShowForm(false);
      resetForm();
      fetchEvents();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('community'); setKidFriendly(false);
    setPrice(''); setEventType('standard'); setStartDate(undefined); setStartTime(''); setEndTime('');
    setTimezone('UTC'); setCitySearch(''); setSelectedCity(null); setAddress('');
    setStateProvince(''); setCountry(''); setZipPin('');
    setImageFile(null); setImagePreview(null); setTermsAccepted(false);
    setWizardStep(1);
  };

  const handleWizardNext = () => {
    if (wizardStep < totalWizardSteps) {
      setWizardStep(wizardStep + 1);
    }
  };

  const handleWizardBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  const handleWizardSubmit = async () => {
    await handleSubmit();
  };

  const renderWizardStep = () => {
  switch (wizardStep) {
    case 1:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Step 1: Basic Info</h3>
            <p className="text-muted-foreground text-sm mb-6">Tell us about your event</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Event Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Give your event a catchy title" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Subtitle</label>
              <input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Optional subtitle" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Summary</label>
              <input value={summary} onChange={e => setSummary(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Brief summary" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground resize-none" placeholder="Describe what makes your event special" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Step 2: Event Type & Format</h3>
            <p className="text-muted-foreground text-sm mb-6">Choose how your event will be delivered</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Event Type *</label>
              <select value={event_type} onChange={e => setEventType_new(e.target.value as any)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground">
                <option value="">Select event type</option>
                <option value="in_person">In-Person Event</option>
                <option value="online">Online Event</option>
                <option value="hybrid">Hybrid Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Event Format *</label>
              <select value={event_format} onChange={e => setEventFormat(e.target.value as any)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground">
                <option value="">Select format</option>
                <option value="single">Single Event</option>
                <option value="recurring">Recurring Event</option>
                <option value="multi_date">Multi-Day Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Privacy</label>
              <select value={event_privacy} onChange={e => setEventPrivacy(e.target.value as any)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground">
                <option value="public">Public Event</option>
                <option value="private">Private Event</option>
                <option value="unlisted">Unlisted Event</option>
              </select>
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Step 3: Date & Time</h3>
            <p className="text-muted-foreground text-sm mb-6">When will your event take place?</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Start Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn("w-full border border-border bg-background px-3 py-2.5 text-sm text-left focus:outline-none focus:border-foreground", !startDate && "text-muted-foreground")}>
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Start Time *</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">End Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn("w-full border border-border bg-background px-3 py-2.5 text-sm text-left focus:outline-none focus:border-foreground", !startDate && "text-muted-foreground")}>
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">End Time *</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Timezone</label>
              <select value={event_timezone} onChange={e => setEventTimezone(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground">
                {COMMON_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Doors Open Time</label>
              <input type="time" value={doors_open_time} onChange={e => setDoorsOpenTime(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Registration Start</label>
                <input type="datetime-local" value={registration_start_time} onChange={e => setRegistrationStartTime(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Registration End</label>
                <input type="datetime-local" value={registration_end_time} onChange={e => setRegistrationEndTime(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" />
              </div>
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Step 4: Location</h3>
            <p className="text-muted-foreground text-sm mb-6">Where will your event take place?</p>
          </div>

          {event_type === 'online' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Virtual Event URL *</label>
                <input type="url" value={virtual_event_url} onChange={e => setVirtualEventUrl(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="https://zoom.us/..." />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Platform</label>
                <input value={virtual_event_platform} onChange={e => setVirtualEventPlatform(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Zoom, Teams, etc." />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Address *</label>
                <input value={address} onChange={e => setAddress(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Street address" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">City</label>
                  <input value={citySearch} onChange={e => setCitySearch(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="City" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">State/Province</label>
                  <input value={stateProvince} onChange={e => setStateProvince(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="State" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Country *</label>
                  <input value={country} onChange={e => setCountry(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Country" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">ZIP/Postal Code</label>
                  <input value={zipPin} onChange={e => setZipPin(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="ZIP code" />
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Step 5: Category & Settings</h3>
            <p className="text-muted-foreground text-sm mb-6">Event categorization and pricing</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Ticket Pricing Description</label>
              <textarea value={ticket_pricing_description} onChange={e => setTicketPricingDescription(e.target.value)} rows={4} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground resize-none" placeholder="Describe your pricing structure (e.g., Adults: $25, Students: $15, Children: Free)" />
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={kidFriendly} onChange={e => setKidFriendly(e.target.checked)} className="w-4 h-4 accent-foreground" />
                <span className="text-sm">Kid Friendly Event</span>
              </label>
            </div>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Step 6: Ticketing</h3>
            <p className="text-muted-foreground text-sm mb-6">External ticketing setup</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">External Ticketing Website</label>
              <input type="url" value={ticketing_website} onChange={e => setTicketingWebsite(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="https://eventbrite.com/..." />
            </div>
          </div>
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Step 7: Registration Settings</h3>
            <p className="text-muted-foreground text-sm mb-6">Registration and accessibility options</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Event Password</label>
              <input type="password" value={event_password} onChange={e => setEventPassword(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Optional password for private events" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Age Restriction</label>
              <input value={age_restriction} onChange={e => setAgeRestriction(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="e.g., 18+, 21+, All ages" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Accessibility Options</label>
              <textarea value={accessibility_options} onChange={e => setAccessibilityOptions(e.target.value)} rows={3} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground resize-none" placeholder="Describe accessibility features" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Event Contact Email</label>
              <input type="email" value={event_contact_email} onChange={e => setEventContactEmail(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="contact@event.com" />
            </div>
          </div>
        </div>
      );

    case 8:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Step 8: Advanced Options</h3>
            <p className="text-muted-foreground text-sm mb-6">Additional settings and links</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Event Website</label>
              <input type="url" value={event_website} onChange={e => setEventWebsite(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="https://myevent.com" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Refund Policy</label>
              <select value={refund_policy} onChange={e => setRefundPolicy(e.target.value as any)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground">
                <option value="no_refunds">No refunds</option>
                <option value="refund_up_to_7_days">Refunds up to 7 days before event</option>
                <option value="refund_up_to_24_hours">Refunds up to 24 hours before event</option>
                <option value="refund_up_to_1_hour">Refunds up to 1 hour before event</option>
                <option value="custom">Custom refund policy</option>
              </select>
            </div>
            {refund_policy === 'custom' && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Custom Refund Policy</label>
                <textarea value={custom_refund_policy} onChange={e => setCustomRefundPolicy(e.target.value)} rows={3} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground resize-none" placeholder="Describe your custom refund policy" />
              </div>
            )}
          </div>
        </div>
      );

    case 9:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 9: Event Image & Terms</h3>
              <p className="text-muted-foreground text-sm mb-6">Add an event image (optional) and agree to terms</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Event Image (Optional)</label>
                {imagePreview && (
                  <div className="mb-4">
                    <img src={imagePreview} alt="Event preview" className="w-full h-48 object-cover rounded-lg" />
                    <button 
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="mt-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Remove image
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-foreground file:text-background hover:file:bg-foreground/90"
                />
                <p className="text-xs text-muted-foreground mt-2">Upload JPG, PNG, or WebP (max 5MB) - Optional for now</p>
              </div>
              
              <div className="border-l-4 border-amber-200 bg-amber-50 p-4 rounded-r-lg">
                <p className="text-sm font-medium text-amber-800 mb-2">Terms & Conditions</p>
                <p className="text-sm text-amber-700 mb-3">
                  By submitting this event, you confirm that:
                </p>
                <ul className="text-sm text-amber-700 mt-2 ml-4 list-disc space-y-1">
                  <li>All event information provided is accurate and complete</li>
                  <li>I have the right to create this event and use any uploaded images</li>
                  <li>The event complies with all applicable laws and regulations</li>
                  <li>I am responsible for managing attendees and event logistics</li>
                  <li>EventRadius reserves the right to approve or reject any event submission</li>
                </ul>
              </div>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={termsAccepted} 
                  onChange={e => setTermsAccepted(e.target.checked)} 
                  className="w-4 h-4 accent-foreground mt-0.5" 
                />
                <span className="text-sm text-muted-foreground">
                  I have read and agree to the terms and conditions above
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await apiClient.deleteEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to delete event');
    }
  };

  const handleConvertToStandard = async (event: OrgEvent) => {
    if (!confirm('Confirm & convert this Preview Event to a Standard Event? All participants and messages will be kept.')) return;
    try {
      await apiClient.updateEvent(event.id, {
        status: 'approved'
      });
      toast.success('Event converted to standard');
      fetchEvents();
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to convert event');
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Event Publisher - Manage Events" description="Create, edit, and manage your events" />
      <Navbar />
      <RoleSwitcher />
      <div className="flex">
        {/* Left Sidebar */}
        <div className={`bg-black border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out pt-12 ${
          sidebarIconized ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4 pt-12">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-6">
              {!sidebarIconized && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm text-white">Event Publisher</h2>
                    <p className="text-xs text-gray-400">Organizer Dashboard</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarIconized(!sidebarIconized)}
                className="p-2 rounded-lg hover:bg-gray-800 text-white transition-colors"
                title={sidebarIconized ? "Expand sidebar" : "Iconize sidebar"}
              >
                {sidebarIconized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-black border border-blue-200'
                        : 'text-white hover:bg-gray-800 hover:text-white'
                    }`}
                    title={sidebarIconized ? `${item.label} - ${item.description}` : ''}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarIconized && (
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${isActive ? 'text-black' : 'text-white'}`}>{item.label}</div>
                        <div className={`text-xs truncate ${isActive ? 'text-black' : 'text-white'}`}>{item.description}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  // Handle logout
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                title={sidebarIconized ? "Logout" : ""}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {!sidebarIconized && <div className="text-sm font-medium">Logout</div>}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="max-w-5xl pt-28 pb-16 px-4 md:px-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {activeSection === 'events' && 'My Events'}
                  {activeSection === 'analytics' && 'Analytics'}
                  {activeSection === 'attendees' && 'Attendees'}
                  {activeSection === 'promotions' && 'Promotions'}
                  {activeSection === 'billing' && 'Billing'}
                  {activeSection === 'resources' && 'Resources'}
                  {activeSection === 'settings' && 'Settings'}
                  {activeSection === 'help' && 'Help & Support'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {activeSection === 'events' && 'Create, edit, and manage your events'}
                  {activeSection === 'analytics' && 'Track your event performance and metrics'}
                  {activeSection === 'attendees' && 'View and manage participant information'}
                  {activeSection === 'promotions' && 'Promote your events and reach more attendees'}
                  {activeSection === 'billing' && 'Manage your subscription and payments'}
                  {activeSection === 'resources' && 'Access guides and documentation'}
                  {activeSection === 'settings' && 'Manage your account preferences'}
                  {activeSection === 'help' && 'Get help and support'}
                </p>
              </div>
              {activeSection === 'events' && (
                <div className="flex gap-3">
                  <button onClick={() => { setShowForm(!showForm); setSelectedEvent(null); }}
                    className="flex items-center gap-2 px-5 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity">
                    {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Create Event</>}
                  </button>
                </div>
              )}
            </div>
            {activeSection === 'events' && (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="relative flex flex-col gap-2 p-4 bg-background border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${event.status === 'preview' ? 'bg-blue-500/20 text-blue-600' : 'bg-destructive/20 text-destructive-foreground'}`}>
                        {event.status === 'preview' ? 'preview' : 'cancelled'}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">{CATEGORIES.find(c => c.id === event.category)?.label || event.category}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{event.date} · {event.time}</p>
                    {event.city && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}</p>}
                    {event.admin_remark && (
                      <p className="text-xs text-muted-foreground mt-2 italic">Remark: {event.admin_remark}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
