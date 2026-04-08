import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { AuthSheet } from '@/components/AuthSheet';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { MapPin, Calendar, Users, Zap, Sun, Moon } from 'lucide-react';

const Landing = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { user, role, hasOrganizerRole, setActiveRole } = useAuthWithBackend();
  const navigate = useNavigate();

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Default to dark theme
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const handleDiscover = () => {
    if (user) {
      void setActiveRole('user');
      navigate('/discover');
    } else {
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
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <SEOHead
        title="Event Radius — Hyper-Local Event Discovery"
        description="Discover events near you based on your interests and location. Find kid-friendly activities, arts, sports, and community events within your preferred distance."
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/25 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-teal-600/40">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">Event Radius</span>
              <div className="text-xs text-muted-foreground">Discover Local Events</div>
            </div>
          </div>
          
          {/* Navigation actions */}
          <div className="flex items-center gap-4">
            {/* Pricing Link */}
            <button
              onClick={() => navigate('/pricing')}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 bg-background/60 backdrop-blur-sm border border-border/50 font-medium text-sm rounded-lg hover:bg-accent/50 hover:border-border transition-all duration-300 hover:scale-105 active:scale-95 text-foreground"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Online</span>
                </div>
                <button
                  onClick={() => navigate(role === 'organizer' ? '/organizer' : role === 'admin' ? '/admin-dashboard' : '/discover')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium text-sm rounded-lg hover:shadow-lg hover:shadow-teal-600/25 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <span>Dashboard</span>
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-background/60 backdrop-blur-sm border border-border/50 font-medium text-sm rounded-lg hover:bg-accent/50 hover:border-border transition-all duration-300 hover:scale-105 active:scale-95 text-foreground"
              >
                <span>Sign In</span>
                <Users className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-600/30 to-cyan-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-cyan-600/30 to-teal-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full bg-grid-pattern" style={{ 
            backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-sm border border-border/50 rounded-full mb-8 text-xs font-semibold uppercase tracking-wider text-foreground animate-fade-in hover:scale-105 transition-transform duration-300">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <MapPin className="w-3 h-3" />
            Hyper-Local Event Discovery
          </div>

          {/* Main heading with gradient text */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.85] mb-8">
            <span className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Find events
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent animate-gradient-shift">
              near you
            </span>
          </h1>

          {/* Enhanced description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Discover amazing local events tailored to your interests, location, and lifestyle.
            <br className="hidden sm:block" />
            <span className="text-foreground font-medium">Never miss what matters to you.</span>
          </p>

          {/* Enhanced CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handleDiscover}
              className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold text-sm uppercase tracking-wider rounded-lg hover:shadow-2xl hover:shadow-teal-600/25 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Discover Events
                <MapPin className="w-4 h-4" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={handlePostEvents}
              className="group w-full sm:w-auto px-8 py-4 bg-background/60 backdrop-blur-sm border border-border/50 font-semibold text-sm uppercase tracking-wider rounded-lg hover:bg-accent/50 hover:border-border transition-all duration-300 hover:scale-105 active:scale-95 text-foreground"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Post Events
              </span>
            </button>
          </div>
          
          {/* Social proof or trust indicators */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors duration-300 cursor-pointer">
              <Users className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="group-hover:text-foreground transition-colors">1000+ Events</span>
            </div>
            <div className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors duration-300 cursor-pointer">
              <MapPin className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="group-hover:text-foreground transition-colors">50+ Cities</span>
            </div>
            <div className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors duration-300 cursor-pointer">
              <Zap className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="group-hover:text-foreground transition-colors">Real-time Updates</span>
            </div>
            <div 
              onClick={() => navigate('/pricing')}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors duration-300 cursor-pointer border border-purple-500/20"
            >
              <Zap className="w-4 h-4 text-purple-600 group-hover:text-purple-500 transition-colors" />
              <span className="text-purple-700 dark:text-purple-400 group-hover:text-purple-600 transition-colors font-medium">AI Dynamic Pricing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-4 md:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-teal-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6 hover:bg-primary/20 transition-colors duration-300">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-primary">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Discover Events in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get personalized event recommendations tailored to your preferences and location
            </p>
          </div>
          
          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: '/location-icon.svg', 
                title: 'Set Your Location', 
                desc: 'Choose your city and set your preferred travel distance to find events in your area.',
                step: '01',
                color: 'from-teal-600 to-cyan-600'
              },
              { 
                icon: '/interests-icon.svg', 
                title: 'Pick Your Interests', 
                desc: 'Select from categories like sports, arts, family events, music, and more personalized options.',
                step: '02', 
                color: 'from-teal-600 to-cyan-600'
              },
              { 
                icon: '/discover-icon.svg', 
                title: 'Discover & Go', 
                desc: 'Browse curated events tailored to you and get notified when new events match your interests. Never miss what\'s happening in your community!',
                step: '03',
                color: 'from-teal-600 to-cyan-600'
              },
            ].map(({ icon, title, desc, step, color }, index) => (
              <div key={title} className="group relative">
                {/* Card */}
                <div className="relative h-full p-8 bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute -top-4 left-8">
                    <div className={`w-8 h-8 bg-gradient-to-r ${color} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                      {step}
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={icon} 
                      alt={title}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        // Fallback to colored div if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = `<div class="w-8 h-8 bg-gradient-to-r ${color} rounded-lg"></div>`;
                      }}
                    />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-4 text-center">{title}</h3>
                  <p className="text-muted-foreground text-center leading-relaxed">{desc}</p>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-border/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <p className="text-muted-foreground mb-6">Ready to get started?</p>
            <button
              onClick={handleDiscover}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-teal-600/25 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>Start Discovering</span>
              <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* Notification Feature Highlight */}
      <section className="py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-gradient-to-br from-teal-600/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-600/10 border border-teal-600/20 rounded-full mb-6">
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-teal-600">Smart Notifications</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Never Miss Events You Love
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Once you set your interests, we'll automatically notify you when new events match your preferences. Get real-time alerts for events happening in your area!
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-teal-600/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-teal-600 rounded-full" />
                    </div>
                    <span className="text-foreground">Instant notifications for matching events</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-teal-600/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-teal-600 rounded-full" />
                    </div>
                    <span className="text-foreground">Personalized based on your interests</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-teal-600/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-teal-600 rounded-full" />
                    </div>
                    <span className="text-foreground">Never miss events in your preferred location</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-full h-64 bg-gradient-to-br from-teal-600/10 to-cyan-600/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-foreground mb-2">Stay Connected</h4>
                    <p className="text-muted-foreground">Get notified the moment events you'll love are added</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 md:px-8 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 via-primary/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-600/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-sm border border-border/50 rounded-full mb-8 hover:bg-accent/50 transition-colors duration-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Join Our Community</span>
          </div>
          
          {/* Main heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Ready to Discover Amazing Events?
          </h2>
          
          {/* Enhanced description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of event enthusiasts and organizers in your community.
            <br className="hidden sm:block" />
            <span className="text-foreground font-medium">Start your journey today!</span>
          </p>
          
          {/* Stats or benefits */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
            <div className="group text-center hover:scale-110 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-125 transition-transform duration-300">1000+</div>
              <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Events</div>
            </div>
            <div className="group text-center hover:scale-110 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-125 transition-transform duration-300">50+</div>
              <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Cities</div>
            </div>
            <div className="group text-center hover:scale-110 transition-transform duration-300 cursor-pointer">
              <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-125 transition-transform duration-300">24/7</div>
              <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Updates</div>
            </div>
          </div>
          
          {/* Enhanced CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={handleDiscover} 
              className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold text-sm uppercase tracking-wider rounded-lg hover:shadow-2xl hover:shadow-teal-600/25 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Get Started Free
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button 
              onClick={handlePostEvents} 
              className="group w-full sm:w-auto px-8 py-4 bg-background/60 backdrop-blur-sm border border-border/50 font-semibold text-sm uppercase tracking-wider rounded-lg hover:bg-accent/50 hover:border-border transition-all duration-300 hover:scale-105 active:scale-95 text-foreground"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                I'm an Organizer
              </span>
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="group flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors duration-300 cursor-pointer">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-300" />
              <span className="group-hover:text-foreground transition-colors">No credit card required</span>
            </div>
            <div className="w-1 h-1 bg-border rounded-full" />
            <div className="group flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors duration-300 cursor-pointer">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-300" />
              <span className="group-hover:text-foreground transition-colors">Free forever</span>
            </div>
            <div className="w-1 h-1 bg-border rounded-full" />
            <div className="group flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors duration-300 cursor-pointer">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-300" />
              <span className="group-hover:text-foreground transition-colors">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section above footer */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl group">
            {/* Main image with rounded edges and strong shadow for depth */}
            <img
              src="/your-image.jpg"
              alt="Event Radius"
              className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              style={{
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.95)'
              }}
            />

            {/* Side gradient overlays - strong black fade */}
            <div
              className="absolute inset-y-0 left-0 w-2/5 z-10 pointer-events-none rounded-2xl"
              style={{
                background: 'linear-gradient(90deg, hsl(240 10% 3.9%) 0%, hsl(240 10% 3.9% / 0.9) 25%, hsl(240 10% 3.9% / 0.5) 50%, transparent 80%)'
              }}
            />

            <div
              className="absolute inset-y-0 right-0 w-2/5 z-10 pointer-events-none rounded-2xl"
              style={{
                background: 'linear-gradient(270deg, hsl(240 10% 3.9%) 0%, hsl(240 10% 3.9% / 0.9) 25%, hsl(240 10% 3.9% / 0.5) 50%, transparent 80%)'
              }}
            />

            {/* Top gradient - very short length */}
            <div
              className="absolute inset-x-0 top-0 h-12 z-10 pointer-events-none rounded-2xl"
              style={{
                background: 'linear-gradient(180deg, hsl(240 10% 3.9%) 0%, hsl(240 10% 3.9% / 0.8) 40%, transparent 100%)'
              }}
            />

            {/* Bottom gradient - very short length */}
            <div
              className="absolute inset-x-0 bottom-0 h-12 z-10 pointer-events-none rounded-2xl"
              style={{
                background: 'linear-gradient(0deg, hsl(240 10% 3.9%) 0%, hsl(240 10% 3.9% / 0.8) 40%, transparent 100%)'
              }}
            />

            {/* Corner rounding gradient */}
            <div
              className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
              style={{
                background: 'radial-gradient(circle at 50% 50%, transparent 30%, hsl(240 10% 3.9% / 0.6) 70%, hsl(240 10% 3.9%) 100%)',
                maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 65%)',
                WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 65%)'
              }}
            />

            {/* Fallback placeholder while you add your image - only shows if image doesn't load */}
            {/* <div className="absolute inset-0 w-full h-64 bg-gradient-to-br from-[#ff6bff]/20 to-[#200,100%,60%]/20 rounded-lg flex items-center justify-center">
              <span className="text-foreground/60 text-lg">Your Image Here</span>
            </div> */}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Your Next Adventure Awaits
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of people discovering amazing events in their community every day.
          </p>
          <button
            onClick={handleDiscover}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>Get Started Now</span>
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative py-16 px-4 md:px-8 border-t border-border/20 bg-background/60 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">Event Radius</div>
                  <div className="text-sm text-muted-foreground">Discover Local Events</div>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Connecting communities through amazing local events. Discover, participate, and create memorable experiences.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>1000+ Events</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>50+ Cities</span>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Discover</h4>
              <ul className="space-y-2">
                <li><button onClick={handleDiscover} className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse Events</button></li>
                <li><button onClick={handlePostEvents} className="text-sm text-muted-foreground hover:text-primary transition-colors">Post Events</button></li>
                <li><button onClick={() => setIsAuthOpen(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors">Sign Up</button></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2">
                <li><button className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</button></li>
                <li><button className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</button></li>
                <li><button className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom footer */}
          <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Event Radius. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button className="hover:text-primary transition-colors">Terms</button>
              <button className="hover:text-primary transition-colors">Privacy</button>
              <button className="hover:text-primary transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </footer>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default Landing;
