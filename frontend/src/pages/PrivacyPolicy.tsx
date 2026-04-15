import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { ArrowLeft, Zap, Shield, Eye, Database, Share2, Cookie, Lock, UserX, Globe, MessageSquare } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const lastUpdated = "January 15, 2026";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Privacy Policy — Events Radius"
        description="Learn how Events Radius collects, uses, and protects your personal information. Read our Privacy Policy for details on data handling."
      />

      {/* Nav */}
      <nav className="z-50 px-4 md:px-8 py-6 bg-background/80 backdrop-blur-sm border-b border-border/20">
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

      {/* Header */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>Your Data Matters</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How we collect, use, and protect your personal information
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert max-w-none">

          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-teal-600" />
              1. Introduction
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                At Events Radius, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our event discovery and management 
                platform (the "Services").
              </p>
              <p>
                We are committed to protecting your personal information and being transparent about our data practices. 
                By using Events Radius, you consent to the practices described in this Privacy Policy.
              </p>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@eventradius.com.
              </p>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-teal-600" />
              2. Information We Collect
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p className="font-medium text-foreground">Personal Information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Profile information and preferences</li>
                <li>Location data (with your permission)</li>
                <li>Demographic information you choose to provide</li>
                <li>Payment information (processed securely by our payment providers)</li>
              </ul>

              <p className="font-medium text-foreground mt-4">Usage Information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Events you view, search for, or express interest in</li>
                <li>Events you create, manage, or attend</li>
                <li>Interactions with other users on the platform</li>
                <li>Device and browser information</li>
                <li>IP address and log data</li>
              </ul>

              <p className="font-medium text-foreground mt-4">AI and Recommendation Data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your interests and preferences for event matching</li>
                <li>Cultural and accessibility preferences</li>
                <li>Interaction patterns to improve recommendations</li>
                <li>Feedback on suggested events</li>
              </ul>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-teal-600" />
              3. How We Use Your Information
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our Services</li>
                <li>Personalize your event discovery experience</li>
                <li>Match you with relevant events based on your preferences</li>
                <li>Process transactions and send confirmations</li>
                <li>Send you updates, security alerts, and support messages</li>
                <li>Facilitate communication between organizers and attendees</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>
                We use AI and machine learning to analyze your preferences and behavior to provide better 
                event recommendations. You can control your recommendation preferences in your account settings.
              </p>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Share2 className="w-6 h-6 text-teal-600" />
              4. Information Sharing
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Event Organizers:</strong> When you register for or express interest in an event, 
                  relevant information is shared with the organizer to facilitate attendance</li>
                <li><strong>Service Providers:</strong> Trusted third parties who help us operate our platform, 
                  process payments, send communications, or analyze data</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights 
                  and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, 
                  with notice to you</li>
              </ul>
              <p>
                We do not sell your personal information to third parties for marketing purposes. 
                Any data shared with AI service providers is anonymized and used solely to improve our recommendation algorithms.
              </p>
            </div>
          </div>

          {/* Cookies and Tracking */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Cookie className="w-6 h-6 text-teal-600" />
              5. Cookies and Tracking Technologies
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We use cookies and similar technologies to enhance your experience, understand usage patterns, 
                and deliver personalized content. Types of cookies we use:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (if enabled)</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Note that disabling certain cookies 
                may limit your ability to use some features of our Services.
              </p>
            </div>
          </div>

          {/* Data Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-teal-600" />
              6. Data Security
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication requirements</li>
                <li>Employee training on data protection practices</li>
                <li>Incident response procedures</li>
              </ul>
              <p>
                While we strive to protect your data, no security system is impenetrable. We cannot guarantee 
                absolute security, but we continuously work to enhance our protections.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <UserX className="w-6 h-6 text-teal-600" />
              7. Your Rights and Choices
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access, correct, or delete your personal information</li>
                <li>Object to or restrict certain processing of your data</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent for optional data processing</li>
                <li>Opt out of marketing communications</li>
                <li>Disable location tracking in your device settings</li>
              </ul>
              <p>
                To exercise these rights, visit your account settings or contact us at privacy@eventsradius.com. 
                We will respond to your request within 30 days.
              </p>
            </div>
          </div>

          {/* International Data Transfers */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-teal-600" />
              8. International Data Transfers
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Events Radius operates globally. Your information may be transferred to and processed in 
                countries other than your country of residence, including the United States. These countries 
                may have different data protection laws.
              </p>
              <p>
                When we transfer data internationally, we use appropriate safeguards such as Standard Contractual 
                Clauses or ensure the recipient country provides an adequate level of protection. By using our 
                Services, you consent to these transfers.
              </p>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-teal-600" />
              9. Children's Privacy
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Our Services are not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If we learn we have collected such information, 
                we will delete it promptly.
              </p>
              <p>
                If you believe we may have information from a child under 13, please contact us immediately 
                at privacy@eventradius.com.
              </p>
            </div>
          </div>

          {/* Changes to Privacy Policy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-teal-600" />
              10. Changes to This Privacy Policy
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
                We will post the updated policy on our platform and update the "Last Updated" date.
              </p>
              <p>
                For material changes, we will notify you via email or through a prominent notice on our platform 
                before the changes take effect. We encourage you to review this Privacy Policy regularly.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-12 p-6 bg-accent/30 rounded-xl">
            <h2 className="text-xl font-bold text-foreground mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices:
            </p>
            <p className="text-foreground font-medium mt-2">
              Email: privacy@eventradius.com
            </p>
            <p className="text-muted-foreground mt-1">
              Events Radius, Inc.<br />
              Attn: Privacy Officer<br />
              San Francisco, CA 94102
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 border-t border-border/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Events Radius. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors">Terms</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">Privacy</button>
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
