import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { ArrowLeft, Zap, FileText, Scale, Shield, AlertCircle, UserCheck, Calendar, CreditCard, MessageSquare } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  const lastUpdated = "January 15, 2026";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Terms of Service — Events Radius"
        description="Read Events Radius Terms of Service to understand the rules and guidelines for using our event discovery and management platform."
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
            <Scale className="w-4 h-4" />
            <span>Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The rules and guidelines for using Events Radius platform
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
              <FileText className="w-6 h-6 text-teal-600" />
              1. Introduction
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Welcome to Events Radius! These Terms of Service ("Terms") govern your access to and use of the Events Radius platform, 
                including our website, mobile applications, and all related services (collectively, the "Services"). 
                By accessing or using our Services, you agree to be bound by these Terms.
              </p>
              <p>
                Events Radius is an event discovery and management platform that connects event organizers with attendees. 
                We facilitate the discovery, promotion, and management of local events while providing AI-powered tools 
                to enhance the event experience for both organizers and participants.
              </p>
              <p>
                Please read these Terms carefully. If you do not agree to these Terms, you may not access or use our Services.
              </p>
            </div>
          </div>

          {/* Account Registration */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-teal-600" />
              2. Account Registration
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                To access certain features of our Services, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access or breach</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
              <p>
                You must be at least 13 years old to use our Services. If you are under 18, you must have permission 
                from a parent or guardian. Event organizers must be at least 18 years old to create and manage paid events.
              </p>
            </div>
          </div>

          {/* User Conduct */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-teal-600" />
              3. User Conduct
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>You agree not to use our Services to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Post or promote illegal, fraudulent, or harmful events</li>
                <li>Harass, abuse, or discriminate against other users</li>
                <li>Impersonate any person or entity</li>
                <li>Upload viruses, malware, or other malicious code</li>
                <li>Scrape, crawl, or collect data without authorization</li>
                <li>Interfere with the proper functioning of our Services</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these rules and to remove 
                any content that violates our Community Guidelines.
              </p>
            </div>
          </div>

          {/* Event Listings */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-teal-600" />
              4. Event Listings
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Event organizers are responsible for the accuracy and completeness of their event listings. By posting an event, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You have the right and authority to organize the event</li>
                <li>All event details are accurate and not misleading</li>
                <li>You will honor all tickets sold or registrations received</li>
                <li>You comply with all applicable laws and venue requirements</li>
                <li>You have necessary permits, licenses, and insurance</li>
              </ul>
              <p>
                Events Radius reserves the right to review, modify, or remove any event listing that violates our policies 
                or appears fraudulent, misleading, or inappropriate.
              </p>
            </div>
          </div>

          {/* Payments and Fees */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-teal-600" />
              5. Payments and Fees
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Events Radius offers both free and paid services. For paid events and premium organizer features:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All fees are displayed clearly before purchase</li>
                <li>Payment processing fees may apply</li>
                <li>AI-powered sales commission applies only when our system generates confirmed sales</li>
                <li>Refund policies are set by individual event organizers</li>
                <li>Subscription fees are charged in advance and auto-renew unless canceled</li>
              </ul>
              <p>
                You are responsible for all taxes applicable to your use of our Services. Event organizers 
                are responsible for collecting and remitting any applicable sales or entertainment taxes.
              </p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-teal-600" />
              6. Intellectual Property
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Events Radius and its licensors own all rights, title, and interest in our Services, including all 
                intellectual property rights. You may not copy, modify, distribute, or create derivative works 
                without our express written permission.
              </p>
              <p>
                By posting content on our platform, you grant Events Radius a worldwide, non-exclusive, royalty-free 
                license to use, reproduce, modify, and display that content for the purpose of operating and 
                promoting our Services. You represent that you have the rights to grant this license.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-teal-600" />
              7. Limitation of Liability
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                To the maximum extent permitted by law, Events Radius shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including lost profits, arising out of 
                or related to your use of our Services.
              </p>
              <p>
                Events Radius acts as a platform connecting organizers and attendees. We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The quality, safety, or legality of any event</li>
                <li>The truth or accuracy of event listings</li>
                <li>The ability of organizers to deliver events as described</li>
                <li>Disputes between organizers and attendees</li>
                <li>Any damages or injuries occurring at events</li>
              </ul>
            </div>
          </div>

          {/* Dispute Resolution */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Scale className="w-6 h-6 text-teal-600" />
              8. Dispute Resolution
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Any dispute arising from these Terms or your use of our Services shall first be attempted to be 
                resolved through good faith negotiation. If unresolved, disputes shall be settled through binding 
                arbitration in accordance with the rules of the American Arbitration Association.
              </p>
              <p>
                The arbitration shall take place in San Francisco, California, and the arbitrator's decision 
                shall be final and binding. You waive any right to participate in class action lawsuits or 
                class-wide arbitration.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-teal-600" />
              9. Termination
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                You may terminate your account at any time by following the instructions in your account settings. 
                Events Radius may suspend or terminate your access to our Services at any time, with or without cause, 
                with or without notice.
              </p>
              <p>
                Upon termination, all licenses granted to you will cease, and we may delete your account data 
                in accordance with our data retention policies. Certain provisions of these Terms will survive 
                termination, including intellectual property rights, limitation of liability, and dispute resolution.
              </p>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-teal-600" />
              10. Changes to Terms
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We may update these Terms from time to time. We will notify you of any material changes by posting 
                the new Terms on our platform and updating the "Last Updated" date. Your continued use of our 
                Services after such changes constitutes acceptance of the revised Terms.
              </p>
              <p>
                If you do not agree to the new Terms, you should stop using our Services. We encourage you to 
                review these Terms periodically to stay informed about our policies.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-12 p-6 bg-accent/30 rounded-xl">
            <h2 className="text-xl font-bold text-foreground mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-foreground font-medium mt-2">
              Email: legal@eventsradius.com
            </p>
            <p className="text-muted-foreground mt-1">
              Events Radius, Inc.<br />
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

export default TermsOfService;
