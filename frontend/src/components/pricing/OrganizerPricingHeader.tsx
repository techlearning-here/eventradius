import { Zap, Sparkles } from 'lucide-react';

export const OrganizerPricingHeader = () => {
  return (
    <section className="py-16 px-4 md:px-8 border-t border-border">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">For Event Organizers</span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Event Organizer Pricing
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          AI-powered dynamic pricing helps you fill empty seats. Commission charged only on dynamic
          priced events — regular price events have zero commission.
        </p>
        <p className="text-base text-green-600 dark:text-green-400 font-medium max-w-2xl mx-auto mb-6">
          💡 We recommend starting with the Free tier. Upgrade when you need more features — no rush, no pressure.
        </p>

        {/* AI Feature Highlight */}
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
            AI Dynamic Pricing + Real-Time Notifications = Filled Seats
          </span>
        </div>
      </div>
    </section>
  );
};
