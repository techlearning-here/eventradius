import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { ArrowLeft, Zap } from 'lucide-react';
import { EventDiscovererSection } from '@/components/pricing/EventDiscovererSection';
import { OrganizerPricingHeader } from '@/components/pricing/OrganizerPricingHeader';
import { PricingTierCard } from '@/components/pricing/PricingTierCard';
import { TrialFeaturesSection } from '@/components/pricing/TrialFeaturesSection';
import { PreviewEventSection } from '@/components/pricing/PreviewEventSection';
import { AICommissionSection } from '@/components/pricing/AICommissionSection';
import { AIFeaturesSection } from '@/components/pricing/AIFeaturesSection';
import { PricingComparisonTable } from '@/components/pricing/PricingComparisonTable';
import { PricingFAQSection } from '@/components/pricing/PricingFAQSection';
import { pricingTiers } from '@/components/pricing/pricingData';

const Pricing = () => {
  const navigate = useNavigate();

  const handleGetStarted = (tier: string) => {
    navigate('/organizer');
  };

  const handleStartOrganizing = () => {
    navigate('/organizer');
  };

  const handleStartDiscovering = () => {
    navigate('/discover');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Pricing — Events Radius"
        description="Simple, transparent pricing for event organizers. Start free, upgrade when you grow. Pay only when our AI helps you make sales."
      />

      {/* Nav */}
      <nav className="z-50 px-4 md:px-8 py-6 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/25 transition-transform duration-300 group-hover:scale-105">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">Events Radius</span>
              <div className="text-xs text-muted-foreground">Discover Events Intelligently</div>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </nav>

      {/* Event Discoverer Section */}
      <EventDiscovererSection onStartDiscovering={handleStartDiscovering} />

      {/* Organizer Pricing Header */}
      <OrganizerPricingHeader />

      {/* Pricing Cards */}
      <section className="pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <PricingTierCard
                key={tier.name}
                tier={tier}
                onSelect={() => handleGetStarted(tier.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trial Features Section */}
      <TrialFeaturesSection />

      {/* Preview Event Feature */}
      <PreviewEventSection />

      {/* AI Commission Explainer */}
      <AICommissionSection />

      {/* AI Features Section */}
      <AIFeaturesSection />

      {/* Comparison Table */}
      <PricingComparisonTable />

      {/* FAQ Section */}
      <PricingFAQSection />

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Fill Your Empty Seats?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of organizers using AI to maximize revenue. Start free and upgrade when you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/organizer')}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-600/25 transition-all duration-300"
            >
              Start Organizing Free
            </button>
            <button
              onClick={() => navigate('/discover')}
              className="px-8 py-4 bg-background border border-border font-semibold rounded-lg hover:bg-accent/50 transition-all duration-300"
            >
              Discover Events
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 border-t border-border/20">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Events Radius. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
