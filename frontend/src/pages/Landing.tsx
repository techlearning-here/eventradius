import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { AuthSheet } from '@/components/AuthSheet';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { MapPin, Calendar, Users, Zap } from 'lucide-react';

const Landing = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'user' | 'organizer'>('user');
  const { user, role, hasOrganizerRole, setActiveRole } = useAuthWithBackend();
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
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Event radius — Hyper-Local Event Discovery"
        description="Discover events near you based on your interests and location. Find kid-friendly activities, arts, sports, and community events within your preferred distance."
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ff6bff] rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Event radius</span>
        </div>
        {user ? (
          <button
            onClick={() => navigate(role === 'organizer' ? '/organizer' : role === 'admin' ? '/admin-dashboard' : '/discover')}
            className="text-xs font-medium uppercase tracking-wider border border-white/20 px-4 py-2 hover:bg-white/10 transition-colors text-foreground"
          >
            Go to Dashboard
          </button>
        ) : (
          <button
            onClick={() => { setAuthRole('user'); setIsAuthOpen(true); }}
            className="text-xs font-medium uppercase tracking-wider border border-white/20 px-4 py-2 hover:bg-white/10 transition-colors text-foreground"
          >
            Sign In
          </button>
        )}
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff6bff] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[hsl(200,100%,60%)] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 mb-8 text-xs uppercase tracking-widest text-foreground">
            <MapPin className="w-3 h-3" />
            Hyper-Local Event Discovery
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8 text-foreground">
            Find events
            <br />
            <span className="text-[#ff6bff]">near you</span>
          </h1>

          <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto mb-12">
            Discover local events filtered by your interests, demographics, and distance.
            See only what matters to you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDiscover}
              className="w-full sm:w-auto px-8 py-4 bg-[#ff6bff] text-black font-semibold text-sm uppercase tracking-wider hover:bg-[#e055ff] transition-colors"
            >
              Discover Events
            </button>
            <button
              onClick={handlePostEvents}
              className="w-full sm:w-auto px-8 py-4 border border-white/20 font-semibold text-sm uppercase tracking-wider hover:bg-white/10 transition-colors text-foreground"
            >
              Post Events
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 md:px-8 border-t border-primary-foreground/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-foreground">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: MapPin, title: 'Set Your Location', desc: 'Choose your city and how far you\'re willing to travel.' },
              { icon: Users, title: 'Pick Your Interests', desc: 'Select categories like sports, arts, family events, and more.' },
              { icon: Calendar, title: 'Discover & Go', desc: 'Browse events tailored to you and never miss what\'s happening nearby.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-6 border border-white/20 flex items-center justify-center rounded-lg">
                  <Icon className="w-6 h-6 text-[#ff6bff]" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{title}</h3>
                <p className="text-foreground/70 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-primary-foreground/10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Ready to explore?</h2>
        <p className="text-foreground/70 mb-10 max-w-lg mx-auto">
          Join Event radius today and start discovering events that match your lifestyle.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={handleDiscover} className="px-8 py-4 bg-[#ff6bff] text-black font-semibold text-sm uppercase tracking-wider hover:bg-[#e055ff] transition-colors">
            Get Started Free
          </button>
          <button onClick={handlePostEvents} className="px-8 py-4 border border-white/20 font-semibold text-sm uppercase tracking-wider hover:bg-white/10 transition-colors">
            I'm an Organizer
          </button>
        </div>
      </section>

      {/* Image Section above footer */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-lg">
            {/* Add your image here - replace with your actual image path */}
            <img src="/your-image.jpg" alt="Event radius" className="w-full h-auto object-cover" />
            
            {/* Fallback placeholder while you add your image - only shows if image doesn't load */}
            {/* <div className="absolute inset-0 w-full h-64 bg-gradient-to-br from-[#ff6bff]/20 to-[#200,100%,60%]/20 rounded-lg flex items-center justify-center">
              <span className="text-foreground/60 text-lg">Your Image Here</span>
            </div> */}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-primary-foreground/10 text-center text-xs text-foreground/30">
        © {new Date().getFullYear()} Event radius. All rights reserved.
      </footer>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultRole={authRole} />
    </div>
  );
};

export default Landing;
