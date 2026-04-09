import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Is EventRadius really free for event discoverers?',
    answer:
      'Yes! Event discoverers can browse, search, register for events, and use all discovery features completely free. We charge organizers, not attendees. We don\'t sell tickets — we connect you to events.',
  },
  {
    question: 'What tier should I start with as an organizer?',
    answer:
      'We recommend starting with the Free tier. It includes 3 active events and trials of premium features like Preview Events and AI Dynamic Pricing. Use your free trials to test the platform, then upgrade to Starter or Pro only when you need more features. There\'s no pressure to upgrade — take your time and grow at your own pace.',
  },
  {
    question: 'What\'s the difference between regular and dynamic priced events?',
    answer:
      'Regular price events have fixed prices with zero commission. Dynamic priced events use AI to adjust prices based on demand and time remaining — commission (0.5-2%) is only charged on these AI-optimized sales. You choose which events use dynamic pricing.',
  },
  {
    question: 'Can I switch between the user and organizer role?',
    answer:
      'Yes! One account can have both roles. Use the Role Switcher in the navigation bar to toggle between discovering events and organizing them. Your organizer subscription only applies when you\'re in organizer mode.',
  },
  {
    question: 'What happens if I exceed my tier\'s event limit?',
    answer:
      'You\'ll need to upgrade to a higher tier or archive old events to create new ones. We\'ll notify you when you\'re approaching your limit.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel anytime. Your subscription will remain active until the end of your current billing period. After that, you\'ll be downgraded to the Free tier with your events archived but not deleted.',
  },
  {
    question: 'How does AI dynamic pricing work?',
    answer:
      'Our AI analyzes your event occupancy, time remaining, and demand patterns to recommend optimal discount levels. When discounts are applied, the system instantly pushes notifications to interested nearby users. Real-time alerts are the key to filling empty seats.',
  },
  {
    question: 'What are Preview Events?',
    answer:
      'Preview Events let you test demand before committing to a full event. Create a preview with a tentative idea, collect interest and feedback from users, then convert to a real event when you have enough demand. Free tier gets 1 trial, Starter gets 3, Pro/Enterprise get unlimited.',
  },
  {
    question: 'Is there a setup fee or hidden costs?',
    answer:
      'No setup fees, no hidden costs. You only pay the monthly subscription plus AI commission (if you use dynamic pricing). Regular price events have zero commission.',
  },
];

const FAQItemComponent = ({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) => {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-2 text-left hover:bg-accent/50 rounded-lg transition-colors"
      >
        <span className="font-medium text-foreground pr-4">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 px-2">
          <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
};

export const PricingFAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 px-4 md:px-8 bg-accent/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Got Questions?</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about EventRadius pricing and features.
          </p>
        </div>

        <div className="bg-background border border-border rounded-2xl p-6">
          {faqs.map((faq, index) => (
            <FAQItemComponent
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
