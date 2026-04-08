import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Zap, Check, ArrowLeft, Sparkles, Building2, Users } from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();

  const handleGetStarted = (tier: string) => {
    navigate('/organizer');
  };

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      badge: 'Get Started',
      badgeColor: 'bg-muted text-muted-foreground',
      description: 'Perfect for casual organizers',
      icon: Users,
      features: [
        '3 active events',
        '1 Trial Preview Event (test before upgrading)',
        '1 Trial AI Dynamic Pricing event (experience Pro feature)',
        'Basic event creation',
        'Email contact only',
        'Standard support',
        'No AI commission (upgrade to use AI features)',
      ],
      cta: 'Start Free',
      ctaStyle: 'bg-muted hover:bg-muted/80 text-foreground',
      popular: false,
    },
    {
      name: 'Starter',
      price: '$5',
      period: '/mo',
      badge: 'Popular',
      badgeColor: 'bg-blue-500/20 text-blue-600',
      description: 'For small businesses & communities',
      icon: Users,
      features: [
        '10 active events',
        '3 Preview Events (test demand before scheduling)',
        '3 Trial AI Dynamic Pricing events (experience Pro feature)',
        'Phone + email contact',
        'CSV export',
        'Priority email support',
        '2% AI commission on sales',
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
      badgeColor: 'bg-primary text-white',
      description: 'For professional organizers',
      icon: Sparkles,
      features: [
        'Unlimited events',
        'Unlimited Preview Events',
        'AI dynamic pricing',
        'Real-time notifications',
        'Broadcast messaging',
        'Priority chat support',
        'Trial API access (10 calls, experience Enterprise)',
        '1% AI commission on sales',
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
      badgeColor: 'bg-purple-500/20 text-purple-600',
      description: 'For chains & large venues',
      icon: Building2,
      features: [
        'Everything in Pro',
        'Unlimited Preview Events',
        'AI-powered optimization',
        'API access',
        'White-label options',
        'Dedicated account manager',
        '0.5% AI commission on sales',
      ],
      cta: 'Contact Sales',
      ctaStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-600/25',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Pricing — Event Radius"
        description="Simple, transparent pricing for event organizers. Start free, upgrade when you grow. Pay only when our AI helps you make sales."
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-6 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/25 transition-transform duration-300 group-hover:scale-105">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">Event Radius</span>
              <div className="text-xs text-muted-foreground">Discover Local Events</div>
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

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">For Event Organizers</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            AI-powered dynamic pricing helps you fill empty seats. Commission charged only on dynamic priced events — regular price events have zero commission.
          </p>

          {/* AI Feature Highlight */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
              AI Dynamic Pricing: Auto-optimize prices to maximize revenue
            </span>
          </div>

          {/* Free for Discoverers Banner */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              100% Free for Event Discoverers
            </span>
            <span className="text-xs text-muted-foreground">• Browse, Register, Attend — No Cost</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`group relative bg-background/60 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                  tier.popular
                    ? 'border-2 border-primary/50 hover:border-primary hover:shadow-primary/20'
                    : 'border-border/50 hover:border-primary/30 hover:shadow-primary/10'
                }`}
              >
                <div className={`absolute -top-3 left-6 px-3 py-1 ${tier.badgeColor} text-xs font-semibold rounded-full`}>
                  {tier.badge}
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <tier.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                </div>
                
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-bold ${tier.popular ? 'text-primary' : 'text-foreground'}`}>
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleGetStarted(tier.name)}
                  className={`w-full py-3 font-semibold rounded-lg transition-all duration-300 ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try Before You Upgrade Section */}
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
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each tier includes trial access to premium features from higher tiers. 
              Experience the value before you commit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-background border border-border/50 rounded-xl">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-muted-foreground">Free</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Free Tier Trials</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>1 Preview Event (Starter feature)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>1 AI Dynamic Pricing event (Pro feature)</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Try premium features, then upgrade for unlimited access.
              </p>
            </div>

            <div className="p-6 bg-background border border-primary/30 rounded-xl">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-blue-600">Starter</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Starter Tier Trials</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>3 Preview Events (full feature)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>3 AI Dynamic Pricing events (Pro feature)</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                More trials to experience AI-powered revenue optimization.
              </p>
            </div>

            <div className="p-6 bg-background border border-border/50 rounded-xl">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-purple-600">Pro</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Pro Tier Trials</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Unlimited AI Dynamic Pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>10 API calls (Enterprise feature)</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Experience enterprise integrations before upgrading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Event Feature */}
      <section className="py-16 px-4 md:px-8 bg-amber-500/5">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-background border border-amber-500/20 rounded-2xl">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  Preview Events (Coming Soon)
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs rounded-full">New Feature</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Test demand before you schedule.</strong> Create a Preview Event to collect interest, 
                  gather feedback, and optimize your event details before committing to a date and venue.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-amber-500/5 rounded-lg">
                    <strong className="text-foreground">1. Create Preview</strong>
                    <p className="text-muted-foreground">Propose ideas without fixed dates</p>
                  </div>
                  <div className="p-3 bg-amber-500/5 rounded-lg">
                    <strong className="text-foreground">2. Collect Interest</strong>
                    <p className="text-muted-foreground">Users express interest & comment</p>
                  </div>
                  <div className="p-3 bg-amber-500/5 rounded-lg">
                    <strong className="text-foreground">3. Schedule Confidently</strong>
                    <p className="text-muted-foreground">Convert to real event when ready</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                  <span><strong className="text-foreground">Free:</strong> 1 Trial Preview</span>
                  <span><strong className="text-foreground">Starter:</strong> 3 Preview Events</span>
                  <span><strong className="text-primary">Pro+:</strong> Unlimited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Commission Explainer */}
      <section className="py-16 px-4 md:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto">
          <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">AI Commission Explained</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Commission is charged <strong>only on dynamic priced events</strong>. Regular price events have zero commission.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-8 text-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">$0</div>
                  <div className="text-muted-foreground">Free tier (no AI)</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">0.5-2%</div>
                  <div className="text-muted-foreground">Starter & Pro (AI-powered)</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">10x+</div>
                  <div className="text-muted-foreground">typical ROI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 px-4 md:px-8 bg-purple-500/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">AI-Powered</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              How AI Dynamic Pricing Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes real-time data to recommend optimal prices that fill your empty seats and maximize revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* AI Feature 1 */}
            <div className="p-6 bg-background border border-border/50 rounded-xl">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Price Optimization</h3>
              <p className="text-sm text-muted-foreground">
                AI analyzes occupancy, time remaining, and demand to recommend the perfect discount level for maximum revenue.
              </p>
            </div>

            {/* AI Feature 2 */}
            <div className="p-6 bg-background border border-border/50 rounded-xl">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Intelligent Targeting</h3>
              <p className="text-sm text-muted-foreground">
                AI matches your events to the most likely customers based on interests, location, past behavior, and price sensitivity.
              </p>
            </div>

            {/* AI Feature 3 */}
            <div className="p-6 bg-background border border-border/50 rounded-xl">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Demand Forecasting</h3>
              <p className="text-sm text-muted-foreground">
                AI predicts attendance before events start, helping you decide when to discount and by how much for optimal fill rates.
              </p>
            </div>
          </div>

          {/* Example Scenario */}
          <div className="mt-8 p-6 bg-background border border-purple-500/20 rounded-xl">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Example: Cinema Tuesday 7pm Showing
            </h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-muted-foreground mb-2"><strong className="text-foreground">Scenario:</strong> 100-seat theater, 2 hours before showtime, only 30 seats sold.</p>
                <p className="text-muted-foreground"><strong className="text-foreground">AI Action:</strong> Recommends 40% discount ($12 → $7.20) and pushes to nearby movie fans.</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2"><strong className="text-foreground">Result:</strong> 40 additional seats filled.</p>
                <p className="text-muted-foreground"><strong className="text-foreground">Revenue:</strong> $288 additional income (vs $0 if seats stayed empty).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
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
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-foreground">Active Events</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">3</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">10</td>
                  <td className="text-center py-4 px-4 text-primary font-medium">Unlimited</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">Unlimited</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-foreground">AI Dynamic Pricing</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-primary font-medium">✓</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">✓</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-foreground">Real-time Notifications</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-primary font-medium">✓</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">✓</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-foreground">CSV Export</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">✓</td>
                  <td className="text-center py-4 px-4 text-primary font-medium">✓</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">✓</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-foreground">Phone Contact</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">✓</td>
                  <td className="text-center py-4 px-4 text-primary font-medium">✓</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">✓</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-foreground">API Access</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-primary font-medium">—</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">✓</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-foreground">AI Commission Rate</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">8%</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">5%</td>
                  <td className="text-center py-4 px-4 text-primary font-medium">3%</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">1%</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-foreground">Support</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">Forum</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">Email</td>
                  <td className="text-center py-4 px-4 text-primary font-medium">Chat</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-background border border-border/50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Do I need a credit card to start?</h3>
              <p className="text-sm text-muted-foreground">No. The Free tier requires no credit card. Create up to 3 events completely free — no commission, no fees. Upgrade to paid tiers when you want AI-powered features.</p>
            </div>
            
            <div className="p-6 bg-background border border-border/50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">What is the AI commission?</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Free tier:</strong> No AI commission at all (AI features not available).<br/>
                <strong>Paid tiers:</strong> 0.5-2% commission only on dynamic priced events. Regular price events have zero commission — sell at full price and keep 100% of revenue.
              </p>
            </div>
            
            <div className="p-6 bg-background border border-border/50 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-sm text-muted-foreground">Yes. You can change your plan at any time. When you upgrade, you'll be charged the prorated difference. When you downgrade, you'll keep your current plan until the end of the billing period.</p>
            </div>
            
            <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                Is it really free for event discoverers?
              </h3>
              <p className="text-sm text-muted-foreground">
                <strong>Yes, 100% free.</strong> People browsing and attending events never pay anything. 
                Browse events, register, save favorites, get notifications, chat with organizers — all completely free. 
                Our revenue comes only from organizers who choose to use our premium tools to fill more seats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Fill More Seats?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of organizers using AI to maximize their revenue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/organizer')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-600/25 transition-all duration-300"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-8 py-4 bg-background border border-border/50 text-foreground font-semibold rounded-lg hover:bg-accent/50 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 border-t border-border/20">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Event Radius. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
