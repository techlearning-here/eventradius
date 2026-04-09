import { Sparkles, Zap, Users, Building2 } from 'lucide-react';

const aiFeatures = [
  {
    icon: Zap,
    title: 'Smart Price + Instant Alerts',
    description:
      'AI calculates optimal discounts AND instantly pushes notifications to interested subscribers. Price drops are worthless without real-time alerts.',
  },
  {
    icon: Users,
    title: 'Real-Time Subscriber Alerts',
    description:
      'AI identifies interested subscribers and pushes instant notifications when prices drop. Speed is everything — alerts reach users in seconds, not hours.',
  },
  {
    icon: Building2,
    title: 'Demand Forecasting',
    description:
      'AI predicts attendance before events start, helping you decide when to discount and by how much for optimal fill rates.',
  },
];

export const AIFeaturesSection = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-purple-500/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">AI-Powered</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            AI Dynamic Pricing + Real-Time Notifications
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The magic happens when AI lowers prices and instantly notifies interested subscribers.
            Real-time alerts are the key to filling empty seats.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {aiFeatures.map((feature, index) => (
            <div key={index} className="p-6 bg-background border border-border/50 rounded-xl">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Example Scenario */}
        <div className="mt-8 p-6 bg-background border border-purple-500/20 rounded-xl">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Example: Cinema Tuesday 7pm Showing
          </h4>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-2">
                <strong className="text-foreground">Scenario:</strong> 100-seat theater, 2 hours before showtime,
                only 30 seats sold.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">AI Action:</strong> Drops price 40% ($12 → $7.20) and
                instantly notifies 200 nearby movie fans via push notification.
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">
                <strong className="text-foreground">Result:</strong> 40 additional seats filled.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Revenue:</strong> $288 additional income (vs $0 if seats
                stayed empty).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
