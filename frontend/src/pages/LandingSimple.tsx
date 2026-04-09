import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { MapPin, Calendar, Users, Zap } from 'lucide-react';

const LandingSimple = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-foreground text-primary-foreground">
      <SEOHead
        title="Event Radius — Hyper-Local Event Discovery"
        description="Discover events near you based on your interests and location."
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[hsl(295,100%,73%)] rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Event Radius</span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="text-xs font-medium uppercase tracking-wider border border-primary-foreground/30 px-4 py-2 hover:bg-primary-foreground/10 transition-colors"
        >
          Sign In
        </button>
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
            Discover local events intelligently and automatically. AI-powered recommendations
            based on your interests, location, and preferences — see only what matters to you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/discover')}
              className="w-full sm:w-auto px-8 py-4 bg-[hsl(295,100%,73%)] text-foreground font-semibold text-sm uppercase tracking-wider hover:bg-[hsl(295,100%,78%)] transition-colors"
            >
              Discover Events
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-4 border border-primary-foreground/30 font-semibold text-sm uppercase tracking-wider hover:bg-primary-foreground/10 transition-colors"
            >
              Post Events
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingSimple;
