import { Users, Sparkles, Building2, LucideIcon } from 'lucide-react';

export interface PricingTier {
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

export const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    badge: 'Start Here',
    badgeColor: 'bg-green-600 text-white dark:bg-green-500 dark:text-white',
    description: 'Recommended: Start free, upgrade when ready',
    icon: Users,
    features: [
      '3 active events',
      '1 Trial Preview Event (test before upgrading)',
      '1 Trial AI Dynamic Pricing event (experience Pro feature)',
      'Basic event creation',
      'Email contact only (no direct chat)',
      'No analytics (upgrade for reports)',
      'Standard support',
      'No AI commission (upgrade to use AI features)',
    ],
    cta: 'Start Free (Recommended)',
    ctaStyle: 'bg-green-600 hover:bg-green-700 text-white',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$5',
    period: '/mo',
    badge: 'Popular',
    badgeColor: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
    description: 'For small businesses & communities',
    icon: Users,
    features: [
      '10 active events',
      '3 Preview Events (test demand before scheduling)',
      '3 Trial AI Dynamic Pricing events (no commission on trials)',
      'Direct chat with interested users',
      'Phone + email contact',
      'Basic reports and analytics',
      'CSV export',
      'Priority email support',
      '2% AI commission on dynamic priced sales (when you upgrade)',
    ],
    cta: 'Get Starter',
    ctaStyle: 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-teal-600/25',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$15',
    period: '/mo',
    badge: 'Best Value',
    badgeColor: 'bg-teal-600 text-white dark:bg-teal-500 dark:text-white',
    description: 'For professional organizers',
    icon: Sparkles,
    features: [
      'Unlimited events',
      'Unlimited Preview Events',
      'AI dynamic pricing',
      'Real-time notifications',
      'Broadcast messaging',
      'Priority chat support',
      'Advanced analytics (benchmark against other organizers)',
      'Priority listing in search results',
      'Team members for event organization',
      'Trial API access (10 calls, experience Enterprise)',
      '1% AI commission on dynamic priced sales',
    ],
    cta: 'Get Pro',
    ctaStyle: 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-teal-600/25',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/mo',
    badge: 'Power Users',
    badgeColor: 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white',
    description: 'For chains & large venues',
    icon: Building2,
    features: [
      'Everything in Pro',
      'Unlimited Preview Events',
      'AI-powered optimization',
      'API access',
      'White-label options',
      'Dedicated account manager',
      '0.5% AI commission on dynamic priced sales',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-600/25',
    popular: false,
  },
];
