import { Check, Minus } from 'lucide-react';

interface ComparisonFeature {
  name: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

const features: ComparisonFeature[] = [
  { name: 'Active Events', free: '3', starter: '10', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Preview Events', free: '1 Trial', starter: '3', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'AI Dynamic Pricing', free: '1 Trial', starter: '3 Trials', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Real-time Notifications', free: false, starter: false, pro: true, enterprise: true },
  { name: 'Direct Chat with Users', free: false, starter: true, pro: true, enterprise: true },
  { name: 'Analytics', free: false, starter: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
  { name: 'Priority Listing', free: false, starter: 'Trial', pro: true, enterprise: true },
  { name: 'Team Members', free: false, starter: '1 Trial', pro: true, enterprise: true },
  { name: 'API Access', free: false, starter: false, pro: '10 Trial', enterprise: 'Full' },
  { name: 'White-label', free: false, starter: false, pro: false, enterprise: true },
  { name: 'AI Commission', free: 'N/A', starter: '2%', pro: '1%', enterprise: '0.5%' },
];

const plans = [
  { name: 'Free', price: '$0', color: 'text-muted-foreground' },
  { name: 'Starter', price: '$5', color: 'text-blue-600' },
  { name: 'Pro', price: '$15', color: 'text-primary' },
  { name: 'Enterprise', price: '$49', color: 'text-purple-600' },
];

export const PricingComparisonTable = () => {
  const renderCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-primary mx-auto" />
      ) : (
        <Minus className="w-5 h-5 text-muted-foreground mx-auto" />
      );
    }
    return <span className="text-sm text-muted-foreground">{value}</span>;
  };

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
          Feature Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.name} className="text-center py-4 px-4">
                    <div className={`font-bold ${plan.color}`}>{plan.name}</div>
                    <div className="text-sm text-muted-foreground">{plan.price}/mo</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.name} className="border-b border-border/50 last:border-0">
                  <td className="py-4 px-4 font-medium text-foreground">{feature.name}</td>
                  <td className="py-4 px-4 text-center">{renderCell(feature.free)}</td>
                  <td className="py-4 px-4 text-center">{renderCell(feature.starter)}</td>
                  <td className="py-4 px-4 text-center">{renderCell(feature.pro)}</td>
                  <td className="py-4 px-4 text-center">{renderCell(feature.enterprise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
