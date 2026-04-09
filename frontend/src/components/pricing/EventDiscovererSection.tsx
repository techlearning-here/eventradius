import { Search, MapPin, Calendar, Heart, Bell, MessageCircle, CheckCircle, Zap } from 'lucide-react';

interface EventDiscovererSectionProps {
  onStartDiscovering: () => void;
}

export const EventDiscovererSection = ({ onStartDiscovering }: EventDiscovererSectionProps) => {
  const features = [
    {
      icon: Search,
      title: 'Discover Events',
      description: 'Browse unlimited events by location, category, date, and interests. Find exactly what you\'re looking for.',
    },
    {
      icon: MapPin,
      title: 'Hyper-Local Search',
      description: 'Find events near you with precise location filtering. Set your preferred radius and never miss local happenings.',
    },
    {
      icon: Calendar,
      title: 'Event Registration',
      description: 'Register for any event instantly. Free entry, paid events, or RSVP — all with zero platform fees. We don\'t sell tickets, we connect you to events.',
    },
    {
      icon: Heart,
      title: 'Save Favorites',
      description: 'Bookmark events you\'re interested in. Get reminders before they start and never miss out.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get notified about new events matching your interests. Personalized recommendations delivered to you.',
    },
    {
      icon: Zap,
      title: 'AI-Powered Discounts',
      description: 'Get instant alerts when events you\'re interested in drop prices via AI dynamic pricing. Save money on last-minute deals.',
    },
    {
      icon: MessageCircle,
      title: 'Event Chat',
      description: 'Chat directly with event organizers to ask questions, get details, and stay informed about the event.',
    },
  ];

  return (
    <section className="pt-32 pb-16 px-4 md:px-8 bg-green-500/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">100% Free Forever</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Event Discoverer
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse, discover, and attend events. All features are completely free for event seekers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-background border border-green-500/20 rounded-xl hover:border-green-500/40 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Completely Free for Discoverers</h3>
                <p className="text-sm text-muted-foreground">No hidden fees. No credit card required. Ever.</p>
              </div>
            </div>
            <button
              onClick={onStartDiscovering}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Discovering
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
