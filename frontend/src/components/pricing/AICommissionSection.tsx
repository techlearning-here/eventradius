import { Zap } from 'lucide-react';

interface CommissionTier {
  name: string;
  value: string;
  description: string;
  highlight?: boolean;
}

const commissionTiers: CommissionTier[] = [
  { name: 'Free tier', value: '$0', description: 'no AI', highlight: false },
  { name: 'Starter & Pro', value: '0.5-2%', description: 'AI-powered', highlight: true },
  { name: 'Typical ROI', value: '10x+', description: 'return on commission', highlight: false },
];

export const AICommissionSection = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-primary/5">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">AI Commission Explained</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Commission is charged <strong className="text-foreground">only on dynamic priced events</strong>.
                  Regular price events have zero commission.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm">
              {commissionTiers.map((tier, index) => (
                <div key={tier.name} className="text-center">
                  <div className={`text-3xl font-bold ${tier.highlight ? 'text-primary' : 'text-foreground'}`}>
                    {tier.value}
                  </div>
                  <div className="text-muted-foreground">{tier.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
