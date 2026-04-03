import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Discover from "./pages/Discover";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import TestOAuth from "./pages/TestOAuth";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Admin from "./pages/Admin";
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import NotFound from "./pages/NotFound";
import { DebugAuth } from "@/components/DebugAuth";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/event/:id" element={<Index />} />
      <Route path="/event/:id/edit" element={<EditEvent />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/organizer" element={<OrganizerDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/test-oauth" element={<TestOAuth />} />
      <Route path="/admin" element={<Admin />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <DebugAuth />
  </TooltipProvider>
);

export default App;
