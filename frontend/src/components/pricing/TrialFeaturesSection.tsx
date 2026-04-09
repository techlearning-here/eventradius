import { Sparkles } from 'lucide-react';

interface TrialTier {
  name: string;
  color: string;
  bgColor: string;
  title: string;
  features: string[];
  note: string;
  highlight?: boolean;
}

const trialTiers: TrialTier[] = [
  {
    name: 'Free',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    title: 'Free Tier — Start Here',
    features: [
      '1 Preview Event (Starter feature)',
      '1 AI Dynamic Pricing event (Pro feature)',
    ],
    note: '✓ Recommended starting point. Use trials, then upgrade when you need more.',
    highlight: true,
  },
  {
    name: 'Starter',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    title: 'Starter Tier Includes',
    features: [
      '3 Preview Events (full feature)',
      'Direct chat with interested users',
      'Basic reports and analytics',
      'Up to 3 event photos',
      '3 AI Dynamic Pricing events (Pro trial, no commission)',
      'Priority listing trial (Pro feature)',
      '1 team member (Pro trial)',
    ],
    note: 'Basic analytics + chat + photos + AI trials (zero commission) for testing.',
    highlight: true,
  },
  {
    name: 'Pro',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    title: 'Pro Tier Includes',
    features: [
      'Unlimited AI Dynamic Pricing',
      'Advanced analytics (benchmark vs other organizers)',
      'Priority listing in search results',
      'Team members for event organization',
      'Up to 7 event photos',
      '10 API calls (Enterprise trial)',
    ],
    note: 'Build your team + rich photo galleries + stand out in search + benchmark data.',
  },
];

export const TrialFeaturesSection = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Experience Premium Features</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Try Before You Upgrade
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
            Each tier includes trial access to premium features from higher tiers.
            Experience the value for 1 month before you commit.
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 max-w-2xl mx-auto">
            Start with Free, use your trials, then upgrade gradually as your events grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {trialTiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-6 bg-background rounded-xl ${
                tier.highlight
                  ? 'border border-primary/30'
                  : 'border border-border/50'
              }`}
            >
              <div className={`w-10 h-10 ${tier.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <span className={`text-lg font-bold ${tier.color}`}>{tier.name}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{tier.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">{tier.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
