import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { AuthSheet } from '@/components/AuthSheet';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Calendar, Users, Zap } from 'lucide-react';

const Landing = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'user' | 'organizer'>('user');
  const { user, role, hasOrganizerRole, setActiveRole } = useAuth();
  const navigate = useNavigate();

  const handleDiscover = () => {
    if (user) {
      void setActiveRole('user');
      navigate('/discover');
    } else {
      setAuthRole('user');
      setIsAuthOpen(true);
    }
  };

  const handlePostEvents = () => {
    if (user && hasOrganizerRole) {
      void setActiveRole('organizer');
      navigate('/organizer');
    } else if (user && !hasOrganizerRole) {
      navigate('/settings');
    } else {
      setAuthRole('organizer');
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-foreground text-primary-foreground">
      <SEOHead
        title="Event Pinger — Hyper-Local Event Discovery"
        description="Discover events near you based on your interests and location. Find kid-friendly activities, arts, sports, and community events within your preferred distance."
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[hsl(295,100%,73%)] rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Event Pinger</span>
        </div>
        {user ? (
          <button
            onClick={() => navigate(role === 'organizer' ? '/organizer' : role === 'admin' ? '/admin-dashboard' : '/discover')}
            className="text-xs font-medium uppercase tracking-wider border border-primary-foreground/30 px-4 py-2 hover:bg-primary-foreground/10 transition-colors"
          >
            Go to Dashboard
          </button>
        ) : (
          <button
            onClick={() => { setAuthRole('user'); setIsAuthOpen(true); }}
            className="text-xs font-medium uppercase tracking-wider border border-primary-foreground/30 px-4 py-2 hover:bg-primary-foreground/10 transition-colors"
          >
            Sign In
          </button>
        )}
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(295,100%,73%)] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[hsl(200,100%,60%)] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-primary-foreground/20 px-4 py-2 mb-8 text-xs uppercase tracking-widest">
            <MapPin className="w-3 h-3" />
            Hyper-Local Event Discovery
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
            Find events
            <br />
            <span className="text-[hsl(295,100%,73%)]">near you</span>
          </h1>

          <p className="text-base md:text-lg text-primary-foreground/60 max-w-2xl mx-auto mb-12">
            Discover local events filtered by your interests, demographics, and distance.
            See only what matters to you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDiscover}
              className="w-full sm:w-auto px-8 py-4 bg-[hsl(295,100%,73%)] text-foreground font-semibold text-sm uppercase tracking-wider hover:bg-[hsl(295,100%,78%)] transition-colors"
            >
              Discover Events
            </button>
            <button
              onClick={handlePostEvents}
              className="w-full sm:w-auto px-8 py-4 border border-primary-foreground/30 font-semibold text-sm uppercase tracking-wider hover:bg-primary-foreground/10 transition-colors"
            >
              Post Events
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 md:px-8 border-t border-primary-foreground/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: MapPin, title: 'Set Your Location', desc: 'Choose your city and how far you\'re willing to travel.' },
              { icon: Users, title: 'Pick Your Interests', desc: 'Select categories like sports, arts, family events, and more.' },
              { icon: Calendar, title: 'Discover & Go', desc: 'Browse events tailored to you and never miss what\'s happening nearby.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-6 border border-primary-foreground/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[hsl(295,100%,73%)]" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{title}</h3>
                <p className="text-primary-foreground/50 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-primary-foreground/10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to explore?</h2>
        <p className="text-primary-foreground/50 mb-10 max-w-lg mx-auto">
          Join Event Pinger today and start discovering events that match your lifestyle.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={handleDiscover} className="px-8 py-4 bg-[hsl(295,100%,73%)] text-foreground font-semibold text-sm uppercase tracking-wider hover:bg-[hsl(295,100%,78%)] transition-colors">
            Get Started Free
          </button>
          <button onClick={handlePostEvents} className="px-8 py-4 border border-primary-foreground/30 font-semibold text-sm uppercase tracking-wider hover:bg-primary-foreground/10 transition-colors">
            I'm an Organizer
          </button>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/30">
        © {new Date().getFullYear()} Event Pinger. All rights reserved.
      </footer>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultRole={authRole} />
    </div>
  );
};

export default Landing;
