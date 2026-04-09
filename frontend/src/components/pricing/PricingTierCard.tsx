import { Check, LucideIcon } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  cta: string;
  ctaStyle: string;
  popular: boolean;
}

interface PricingTierCardProps {
  tier: PricingTier;
  onSelect: () => void;
}

export const PricingTierCard = ({ tier, onSelect }: PricingTierCardProps) => {
  const Icon = tier.icon;

  return (
    <div
      className={`relative p-6 bg-background border rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        tier.popular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-primary/50'
      }`}
    >
      {/* Badge */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold ${tier.badgeColor}`}
      >
        {tier.badge}
      </div>

      {/* Icon */}
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mt-2">
        <Icon className="w-7 h-7 text-primary" />
      </div>

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
        <p className="text-sm text-muted-foreground">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">{tier.price}</span>
        <span className="text-muted-foreground">{tier.period}</span>
      </div>

      {/* CTA */}
      <button
        onClick={onSelect}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 mb-6 ${tier.ctaStyle}`}
      >
        {tier.cta}
      </button>

      {/* Features */}
      <ul className="space-y-3">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
