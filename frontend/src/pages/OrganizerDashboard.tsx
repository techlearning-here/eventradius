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
import { Plus, Trash2, MapPin, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

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
  const [selectedEvent, setSelectedEvent] = useState<OrgEvent | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);

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
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<typeof CITIES[0] | null>(null);
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'organizer')) navigate('/');
  }, [authLoading, user, role, navigate]);

  useEffect(() => {
    if (user && role === 'organizer') fetchEvents();
  }, [user, role]);

  const fetchEvents = async () => {
    try {
      const events = await apiClient.getUserEvents();
      setEvents(events.created || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
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
    if (!user || !title.trim() || !description.trim() || !startDate || !startTime || !endTime || !address.trim() || !imageFile) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('event-images').upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(fileName);

      const targetDate = new Date(startDate);
      const [h, m] = startTime.split(':');
      targetDate.setHours(parseInt(h) || 0, parseInt(m) || 0);

      const { data: profile } = await apiClient.getCurrentUserProfile();

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        location: address.trim(),
        start_time: targetDate.toISOString(),
        end_time: new Date(targetDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        image_url: publicUrl,
        category,
        max_participants: null,
        is_public: true,
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
    setCitySearch(''); setSelectedCity(null); setAddress('');
    setImageFile(null); setImagePreview(null);
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
      <div className="max-w-5xl mx-auto pt-28 pb-16 px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Event Publisher</h1>
            <p className="text-muted-foreground text-sm">Create, edit, and manage your events</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShowForm(!showForm); setSelectedEvent(null); }}
              className="flex items-center gap-2 px-5 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity">
              {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Create Event</>}
            </button>
          </div>
        </div>

        {/* Create Event Form */}
        {showForm && (
          <div className="border border-border p-6 mb-10 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Create New Event</h2>

            {/* Event Type Selection */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Event Type</label>
              <div className="flex gap-3">
                <button onClick={() => setEventType('standard')}
                  className={`flex-1 p-4 border text-left transition-colors ${eventType === 'standard' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground'}`}>
                  <div className="text-sm font-semibold mb-1">Standard Event</div>
                  <div className="text-xs text-muted-foreground">Regular confirmed event, simple listing.</div>
                </button>
                <button onClick={() => setEventType('preview')}
                  className={`flex-1 p-4 border text-left transition-colors ${eventType === 'preview' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground'}`}>
                  <div className="text-sm font-semibold mb-1">Preview Event</div>
                  <div className="text-xs text-muted-foreground">Test interest first, confirm attendees, then convert.</div>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Event title" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Description *</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground resize-none" placeholder="Describe your event" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground">
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Price ($)</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="0 = Free" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={kidFriendly} onChange={e => setKidFriendly(e.target.checked)} className="w-4 h-4 accent-foreground" />
                  <span className="text-sm">Kid-friendly event</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={cn("w-full border border-border bg-background px-3 py-2.5 text-sm text-left focus:outline-none", !startDate && "text-muted-foreground")}>
                        {startDate ? format(startDate, 'PPP') : 'Select date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} className="pointer-events-auto" /></PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Start Time *</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">End Time *</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">City</label>
                  <div className="relative">
                    <input value={citySearch} onChange={e => { setCitySearch(e.target.value); setSelectedCity(null); }} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Search city" />
                    {filteredCities.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-background border border-border border-t-0 z-10 max-h-40 overflow-y-auto">
                        {filteredCities.map(city => (
                          <button key={`${city.name}-${city.state}`} onClick={() => { setSelectedCity(city); setCitySearch(`${city.name}, ${city.state}`); }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted">{city.name}, {city.state}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Address *</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="Full address" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Image *</label>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover mb-2" />}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
                </div>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="mt-6 w-full py-3 bg-foreground text-background font-semibold text-sm uppercase tracking-wider hover:opacity-90 disabled:opacity-40">
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        )}

        {/* Selected Event Detail (Preview management) */}
        {selectedEvent && (
          <div className="border border-border p-6 mb-10 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${STATUS_COLORS[selectedEvent.status] || 'bg-muted text-muted-foreground'}`}>
                Approval: {selectedEvent.status}
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-600">
                Type: {selectedEvent.event_type}
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-purple-500/20 text-purple-600">
                Status: {selectedEvent.event_status}
              </span>
            </div>

            {selectedEvent.admin_remark && (
              <div className="p-3 bg-muted mb-4 text-sm">
                <span className="font-medium">Admin Remark:</span> {selectedEvent.admin_remark}
              </div>
            )}

            {/* Participant lists */}
            <div className="space-y-3 mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Participants</h3>
              {['interested', 'going', 'not_going'].map(status => {
                const list = participants.filter(p => p.status === status);
                if (list.length === 0) return null;
                return (
                  <div key={status}>
                    <div className="text-xs font-medium capitalize mb-1">{status.replace('_', ' ')} ({list.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {list.map(p => (
                        <span key={p.user_id} className="text-[10px] px-2 py-0.5 border border-border">{p.profiles?.display_name || 'User'}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {participants.length === 0 && <p className="text-xs text-muted-foreground">No participants yet</p>}
            </div>

            {/* Convert button for preview events */}
            {selectedEvent.event_type === 'preview' && selectedEvent.event_status === 'collecting_interest' && (
              <button onClick={() => handleConvertToStandard(selectedEvent)}
                className="flex items-center gap-2 px-5 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider hover:opacity-90">
                <ArrowRight className="w-4 h-4" /> Confirm & Convert to Standard Event
              </button>
            )}
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No events yet. Create your first event!</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="border border-border group relative cursor-pointer"
                onClick={() => { setSelectedEvent(event); setShowForm(false); fetchParticipants(event.id); }}>
                <div className="aspect-[4/3] bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${event.background_image_url})` }} />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${STATUS_COLORS[event.status] || 'bg-muted text-muted-foreground'}`}>
                      {event.status}
                    </span>
                    {event.event_type === 'preview' && (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-600">preview</span>
                    )}
                    <span className="text-[10px] text-muted-foreground uppercase">{CATEGORIES.find(c => c.id === event.category)?.label || event.category}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-muted-foreground">{event.date} · {event.time}</p>
                  {event.city && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}</p>}
                  {event.admin_remark && (
                    <p className="text-xs text-muted-foreground mt-2 italic">Remark: {event.admin_remark}</p>
                  )}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                  className="absolute top-2 right-2 p-2 bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
