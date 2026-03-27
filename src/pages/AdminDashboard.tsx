import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { CATEGORIES } from '@/data/cities';
import { Check, X, Ban, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface AdminEvent {
  id: string;
  title: string;
  creator: string;
  date: string;
  status: string;
  category: string;
  city: string | null;
  created_by: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  role?: string;
}

const AdminDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'events' | 'users'>('events');
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/');
    }
  }, [authLoading, user, role]);

  useEffect(() => {
    if (user && role === 'admin') {
      fetchEvents();
      fetchUsers();
    }
  }, [user, role]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('id, title, creator, date, status, category, city, created_by')
      .order('target_date', { ascending: false });
    setEvents((data as AdminEvent[]) || []);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');

    const merged = (profiles || []).map(p => ({
      ...p,
      role: (roles || []).find(r => r.user_id === p.user_id)?.role || 'user',
    }));
    setUsers(merged);
  };

  const updateEventStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('events').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(`Event ${status}`); fetchEvents(); }
  };

  const filteredEvents = statusFilter === 'all' ? events : events.filter(e => e.status === statusFilter);

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Admin Dashboard" description="Manage platform events and users" />
      <Navbar />
      <div className="max-w-6xl mx-auto pt-28 pb-16 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-0 mb-8">
          {(['events', 'users'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider border transition-colors ${tab === t ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
              {t === 'events' ? `Events (${events.length})` : `Users (${users.length})`}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {tab === 'events' && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {['all', 'pending', 'approved', 'rejected', 'deactivated'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${statusFilter === s ? 'bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                  {s} {s !== 'all' && `(${events.filter(e => e.status === s).length})`}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left py-3 pr-4">Title</th>
                    <th className="text-left py-3 pr-4">Creator</th>
                    <th className="text-left py-3 pr-4">Category</th>
                    <th className="text-left py-3 pr-4">Date</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-right py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map(event => (
                    <tr key={event.id} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium">{event.title}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{event.creator}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{CATEGORIES.find(c => c.id === event.category)?.label || event.category}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{event.date}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${
                          event.status === 'approved' ? 'bg-green-500/20 text-green-600' :
                          event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                          event.status === 'rejected' ? 'bg-red-500/20 text-red-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {event.status !== 'approved' && (
                            <button onClick={() => updateEventStatus(event.id, 'approved')} title="Approve"
                              className="p-1.5 border border-border hover:bg-green-500/10 hover:border-green-500 transition-colors">
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          {event.status !== 'rejected' && (
                            <button onClick={() => updateEventStatus(event.id, 'rejected')} title="Reject"
                              className="p-1.5 border border-border hover:bg-red-500/10 hover:border-red-500 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          {event.status === 'approved' && (
                            <button onClick={() => updateEventStatus(event.id, 'deactivated')} title="Deactivate"
                              className="p-1.5 border border-border hover:bg-yellow-500/10 hover:border-yellow-500 transition-colors">
                              <Ban className="w-3 h-3" />
                            </button>
                          )}
                          <button onClick={() => navigate(`/event/${event.id}`)} title="View"
                            className="p-1.5 border border-border hover:bg-muted transition-colors">
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left py-3 pr-4">Name</th>
                  <th className="text-left py-3 pr-4">Role</th>
                  <th className="text-left py-3 pr-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium">{u.display_name || 'Unknown'}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-600' :
                        u.role === 'organizer' ? 'bg-blue-500/20 text-blue-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
