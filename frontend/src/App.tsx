import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Routes, Route } from "react-router-dom";
import RoleBasedLanding from "./pages/RoleBasedLanding";
import Landing from "./pages/Landing";
import Discover from "./pages/Discover";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import TestOAuth from "./pages/TestOAuth";
import Onboarding from "./pages/Onboarding";
import OrganizerOnboarding from "./pages/OrganizerOnboarding";
import Settings from "./pages/Settings";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Admin from "./pages/Admin";
import EditEvent from "./pages/EditEvent";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/event/:id" element={<Index />} />
          <Route path="/event/:id/edit" element={<EditEvent />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/organizer-onboarding" element={<OrganizerOnboarding />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/test-oauth" element={<TestOAuth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
