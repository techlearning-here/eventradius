import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { 
  Zap, Calendar, Users, MapPin, Lightbulb, BookOpen, HelpCircle, 
  Coffee, Film, Dumbbell, Utensils, Palette, Music, GraduationCap, 
  Baby, Briefcase, Heart, ShoppingBag, Sparkles, BookOpenCheck,
  ArrowRight, CheckCircle, Clock, DollarSign, ChevronDown, ChevronUp,
  Sparkle, Target, Repeat, HeartHandshake, Wine, Mic, UsersRound,
  PartyPopper
} from 'lucide-react';

const OrganizerHub = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const eventCategories = [
    { icon: Film, label: 'Movies & Screenings', desc: 'Indie films, watch parties, cinema clubs' },
    { icon: Utensils, label: 'Food & Drink', desc: 'Tastings, pop-ups, culinary experiences' },
    { icon: GraduationCap, label: 'Workshops & Classes', desc: 'Skill-sharing, hands-on learning' },
    { icon: Baby, label: 'Kids & Family', desc: 'Parent-kids activities, mini-sessions' },
    { icon: Music, label: 'Music & Culture', desc: 'Open mics, listening parties, cultural events' },
    { icon: Dumbbell, label: 'Sports & Fitness', desc: 'Run clubs, yoga sessions, intro classes' },
    { icon: Briefcase, label: 'Networking & Community', desc: 'Meetups, roundtables, circles' },
    { icon: Heart, label: 'Wellness', desc: 'Meditation, self-care, mindfulness' },
    { icon: ShoppingBag, label: 'Shopping & Pop-ups', desc: 'Markets, demos, product showcases' },
    { icon: Sparkles, label: 'Faith & Spiritual', desc: 'Gatherings, discussions, ceremonies' },
    { icon: BookOpen, label: 'Learning & Talks', desc: 'Q&As, lectures, expert sessions' },
    { icon: PartyPopper, label: 'Local Business Promos', desc: 'Launches, tastings, showcases' },
  ];

  const organizerPersonas = [
    {
      title: 'Café Owner',
      ideas: ['Poetry night', 'Latte art workshop', 'Board game evening', 'Book club meetup', 'Acoustic open mic']
    },
    {
      title: 'Cinema Owner',
      ideas: ['Weekday parent-kids matinee', 'Indie film night', 'Retro movie club', 'Director Q&A screening', 'Themed movie marathon']
    },
    {
      title: 'Restaurant Owner',
      ideas: ['Chef tasting for 12 people', 'Regional food night', 'Singles dinner table', 'Cooking demo lunch', 'Wine pairing evening']
    },
    {
      title: 'Fitness Trainer',
      ideas: ['Sunrise yoga', 'Beginner mobility class', 'Run club intro', 'Nutrition talk', 'Outdoor bootcamp']
    },
    {
      title: 'Artist',
      ideas: ['Sketch walk', 'Mini gallery opening', 'Paint & sip session', 'Art demo day', 'Collaborative mural project']
    },
    {
      title: 'Musician',
      ideas: ['Intimate listening session', 'Songwriting circle', 'Instrument workshop', 'Acoustic brunch set', 'Jazz improv night']
    },
    {
      title: 'Teacher / Coach',
      ideas: ['Free intro session', 'Skill workshop', 'Parent info hour', 'Study group meetup', 'Q&A clinic']
    },
    {
      title: 'Parent Group Organizer',
      ideas: ['Playdate meetup', 'Parent coffee chat', 'Kids craft morning', 'Story time session', 'Family potluck']
    },
    {
      title: 'Coworking Space Owner',
      ideas: ['Networking breakfast', 'Lunch & learn', 'Founder roundtable', 'Skill swap session', 'Coworking social']
    },
    {
      title: 'Community Volunteer',
      ideas: ['Neighborhood cleanup', 'Charity bake sale', 'Local history walk', 'Community garden day', 'Volunteer orientation']
    },
  ];

  const eventFormats = [
    { format: 'Workshop', bestFor: 'Skill transfer', size: '6-20', duration: '1-3 hours', monetization: 'Ticket sales, materials fee' },
    { format: 'Roundtable', bestFor: 'Discussion', size: '4-12', duration: '1-2 hours', monetization: 'Free/Paid RSVP' },
    { format: 'Watch Party', bestFor: 'Entertainment', size: '10-30', duration: '2-4 hours', monetization: 'Food/drink sales' },
    { format: 'Guided Walk', bestFor: 'Exploration', size: '8-15', duration: '1-2 hours', monetization: 'Ticket sales' },
    { format: 'Tasting', bestFor: 'Food/Drink', size: '8-20', duration: '1-2 hours', monetization: 'Per-person fee' },
    { format: 'Pop-up Class', bestFor: 'Learning', size: '5-15', duration: '45-90 min', monetization: 'Class fee' },
    { format: 'Networking Circle', bestFor: 'Connection', size: '10-25', duration: '1-2 hours', monetization: 'Free/Paid' },
    { format: 'Open Mic', bestFor: 'Performance', size: '15-40', duration: '2-3 hours', monetization: 'Entry fee, drinks' },
    { format: 'Demo Day', bestFor: 'Showcase', size: '20-50', duration: '2-4 hours', monetization: 'Free, lead gen' },
    { format: 'Expert Q&A', bestFor: 'Knowledge', size: '10-30', duration: '1 hour', monetization: 'Ticket sales' },
  ];

  const playbooks = [
    {
      title: 'Launch a 10-Person Paid Event',
      steps: [
        'Choose a specific niche (e.g., "beginner watercolor" not "art class")',
        'Set a clear value proposition',
        'Price at $20-50 per person',
        'Find a small venue (café, studio, home)',
        'Post on EventRadius 2 weeks ahead',
        'Share on your social channels',
        'Collect RSVPs with payment',
        'Prepare materials/experience',
        'Deliver great event',
        'Collect feedback & photos'
      ]
    },
    {
      title: 'Run a Recurring Weekly Micro-Event',
      steps: [
        'Pick a consistent day/time',
        'Keep the same venue if possible',
        'Start with just 4-6 people',
        'Make it easy to join anytime',
        'Create a simple repeatable format',
        'Price consistently',
        'Build a regular attendee base',
        'Iterate based on feedback',
        'Gradually increase capacity',
        'Build community around the event'
      ]
    },
    {
      title: 'Test a One-Hour Neighborhood Event',
      steps: [
        'Identify a hyper-local need',
        'Choose a public space (park, café)',
        'Make it free or $5-10',
        'Invite 8-12 people max',
        'Keep duration under 1 hour',
        'Focus on one clear activity',
        'Collect emails for future events',
        'Ask for immediate feedback',
        'Document with photos',
        'Decide to repeat, pivot, or drop'
      ]
    }
  ];

  const faqs = [
    { q: 'What is a micro-event?', a: 'A micro-event is a small, focused gathering of 8-30 people with a clear purpose and intimate setting. Unlike large conferences or festivals, micro-events prioritize connection over scale.' },
    { q: 'How many people should attend?', a: 'Most successful micro-events have 8-20 attendees. This size allows for genuine interaction while being large enough to create energy.' },
    { q: 'Can I charge for a small event?', a: 'Absolutely! Small events often command higher per-person pricing because of the intimate, exclusive experience. Most micro-events charge $15-75 per person.' },
    { q: 'What if I don\'t have a venue?', a: 'Start simple: cafés during off-hours, community centers, parks, co-working spaces, or even your home. Many venues welcome events that bring customers.' },
    { q: 'What categories work best for first-time organizers?', a: 'Workshops, tastings, and meetups are great starters. They have clear value, manageable logistics, and proven demand.' },
    { q: 'How do I know if people want this event?', a: 'Start with conversations. Ask your network, post on social media, or create a waitlist. If 5-10 people express interest, you have validation.' },
    { q: 'Can businesses use micro-events for promotion?', a: 'Yes! Micro-events are powerful for building relationships. A wine shop hosting tastings, a gym doing intro classes—both drive business.' },
    { q: 'Can I test an idea before scaling it?', a: 'That\'s exactly what micro-events are for. Run a small version first, learn what works, then grow gradually.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Organizer Hub — Launch Better Local Events | EventRadius"
        description="Discover micro-event ideas, event categories, and practical guides for organizing small local experiences. Perfect for first-time hosts and small business owners."
      />

      {/* Mini Nav */}
      <nav className="z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">EventRadius</span>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#micro-events" className="text-muted-foreground hover:text-foreground transition-colors">Micro-Events</a>
            <a href="#categories" className="text-muted-foreground hover:text-foreground transition-colors">Categories</a>
            <a href="#ideas" className="text-muted-foreground hover:text-foreground transition-colors">Ideas</a>
            <a href="#formats" className="text-muted-foreground hover:text-foreground transition-colors">Formats</a>
            <a href="#playbooks" className="text-muted-foreground hover:text-foreground transition-colors">Playbooks</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <button 
            onClick={() => navigate('/organizer')}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
          >
            List Your Event
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600/10 border border-teal-600/20 rounded-full mb-6">
            <Sparkle className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-teal-600">Organizer Resource Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Launch Better Local Events
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            EventRadius helps you create, test, and grow micro-events. Small gatherings with big impact—easier to organize, better for engagement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/organizer')}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all"
            >
              List Your Event
            </button>
            <a 
              href="#ideas"
              className="px-8 py-4 bg-background border border-border text-foreground font-semibold rounded-lg hover:bg-accent/50 transition-all"
            >
              Explore Micro Event Ideas
            </a>
          </div>
        </div>
      </section>

      {/* What is a Micro-Event */}
      <section id="micro-events" className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What is a Micro-Event?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Small, focused, interactive local gatherings. Easier to test, cheaper to launch, and often better for engagement than large events.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Target, title: 'Easier to Organize', desc: 'Less logistics, more focus' },
              { icon: DollarSign, title: 'Lower Risk', desc: 'Small investment, quick pivot' },
              { icon: HeartHandshake, title: 'Better Connection', desc: 'Intimate experiences win' },
              { icon: Repeat, title: 'Repeatable', desc: 'Build habits, not one-offs' },
              { icon: Users, title: 'Niche Friendly', desc: 'Serve specific communities' },
            ].map((benefit) => (
              <div key={benefit.title} className="p-6 bg-background border border-border/50 rounded-xl hover:shadow-lg transition-all">
                <benefit.icon className="w-8 h-8 text-teal-600 mb-4" />
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Categories */}
      <section id="categories" className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Categories</h2>
            <p className="text-muted-foreground">Popular micro-event categories that work in any community</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {eventCategories.map((cat) => (
              <div key={cat.label} className="group p-5 bg-background border border-border/50 rounded-xl hover:border-teal-600/50 hover:shadow-lg transition-all cursor-pointer">
                <cat.icon className="w-6 h-6 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-foreground mb-1">{cat.label}</h3>
                <p className="text-sm text-muted-foreground">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Micro-Event Ideas by Persona */}
      <section id="ideas" className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Micro-Event Ideas by Organizer Type</h2>
            <p className="text-muted-foreground">Practical ideas tailored to your background and resources</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {organizerPersonas.map((persona) => (
              <div key={persona.title} className="p-6 bg-background border border-border/50 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 text-teal-600">{persona.title}</h3>
                <ul className="space-y-2">
                  {persona.ideas.map((idea, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Lightbulb className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Framework */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How to Design a Good Micro-Event</h2>
            <p className="text-muted-foreground">A simple framework for creating memorable small gatherings</p>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-600 to-cyan-600" />
            {[
              'Choose a niche audience',
              'Pick one clear format',
              'Set a time and duration',
              'Choose pricing or free RSVP',
              'Make it interactive',
              'Start small (8-12 people)',
              'Repeat what works'
            ].map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-4 mb-6 pl-4 md:pl-8">
                <div className="absolute left-0 md:left-4 w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                  {idx + 1}
                </div>
                <div className="ml-8 p-4 bg-background border border-border/50 rounded-lg flex-1">
                  <span className="font-medium">{step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Formats */}
      <section id="formats" className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Micro-Event Formats</h2>
            <p className="text-muted-foreground">Reusable formats you can adapt to your niche</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventFormats.map((fmt) => (
              <div key={fmt.format} className="p-5 bg-background border border-border/50 rounded-xl hover:shadow-lg transition-all">
                <h3 className="font-semibold text-lg mb-3 text-teal-600">{fmt.format}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best for:</span>
                    <span className="text-foreground">{fmt.bestFor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group size:</span>
                    <span className="text-foreground">{fmt.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="text-foreground">{fmt.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monetization:</span>
                    <span className="text-foreground text-right max-w-[120px]">{fmt.monetization}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Starter Playbooks */}
      <section id="playbooks" className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Starter Playbooks</h2>
            <p className="text-muted-foreground">Step-by-step guides for your first micro-events</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {playbooks.map((playbook) => (
              <div key={playbook.title} className="p-6 bg-gradient-to-br from-teal-600/5 to-cyan-600/5 border border-teal-600/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpenCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold">{playbook.title}</h3>
                </div>
                <ol className="space-y-2">
                  {playbook.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 bg-teal-600/20 rounded-full flex items-center justify-center text-xs text-teal-600 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips for First-Time Organizers */}
      <section className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tips for First-Time Organizers</h2>
            <p className="text-muted-foreground">Reassuring guidance to help you get started</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: UsersRound, text: 'You don\'t need a huge audience' },
              { icon: Target, text: 'You can start with just 8-20 people' },
              { icon: Sparkles, text: 'Clear positioning matters more than scale' },
              { icon: Repeat, text: 'Repeatable events often beat one big event' },
              { icon: CheckCircle, text: 'Small events help validate demand' },
              { icon: Lightbulb, text: 'Start with what you know and love' },
            ].map((tip, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-background border border-border/50 rounded-lg">
                <tip.icon className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="font-medium">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Common questions about organizing micro-events</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-border/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-teal-600/10 via-cyan-600/5 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Launch Your First Micro-Event?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start small, learn fast, and build something meaningful for your community. EventRadius makes it easy to list and promote your events.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/organizer')}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all"
            >
              Start Your First Micro-Event
            </button>
            <button 
              onClick={() => navigate('/discover')}
              className="px-8 py-4 bg-background border border-border text-foreground font-semibold rounded-lg hover:bg-accent/50 transition-all"
            >
              Explore Events First
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">EventRadius</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Helping organizers create memorable local experiences.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <button onClick={() => navigate('/discover')} className="text-muted-foreground hover:text-foreground transition-colors">
                Discover
              </button>
              <button onClick={() => navigate('/organizer')} className="text-muted-foreground hover:text-foreground transition-colors">
                List Event
              </button>
              <button onClick={() => navigate('/pricing')} className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OrganizerHub;
