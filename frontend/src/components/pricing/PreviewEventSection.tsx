import { Lightbulb, Users, CalendarCheck, ArrowRight } from 'lucide-react';

export const PreviewEventSection = () => {
  const steps = [
    {
      icon: Lightbulb,
      title: 'Create Preview',
      description: 'Propose ideas without fixed dates',
    },
    {
      icon: Users,
      title: 'Collect Interest',
      description: 'Users express interest & comment',
    },
    {
      icon: CalendarCheck,
      title: 'Schedule Confidently',
      description: 'Convert to real event when ready',
    },
  ];

  const tierLimits = [
    { tier: 'Free', limit: '1 Trial Preview', highlight: false },
    { tier: 'Starter', limit: '3 Preview Events', highlight: false },
    { tier: 'Pro+', limit: 'Unlimited', highlight: true },
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-amber-500/5">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 bg-background border border-amber-500/20 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                    Coming Soon
                  </span>
                  <h3 className="text-xl font-bold text-foreground">Preview Events</h3>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                Test demand before committing. Propose event ideas, collect interest & feedback,
                then schedule confidently when you have enough demand.
              </p>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 flex-shrink-0">
                      <span className="text-sm font-semibold text-amber-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <step.icon className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-foreground">{step.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-amber-400 hidden md:block mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Tier Limits */}
            <div className="md:w-64 p-4 bg-amber-500/5 rounded-xl">
              <h4 className="font-semibold text-foreground mb-3">Preview Events by Tier</h4>
              <div className="space-y-2">
                {tierLimits.map((item, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                      item.highlight ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    <span className="font-medium text-foreground">{item.tier}</span>
                    <span className={item.highlight ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                      {item.limit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
