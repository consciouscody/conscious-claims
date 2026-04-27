import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewJob from "./pages/NewJob";
import JobDetail from "./pages/JobDetail";
import Reference from "./pages/Reference";
import Pricing from "./pages/Pricing";
import Demo from "./pages/Demo";
import FreeGuide from "./pages/FreeGuide";
import StormTheDoor from "./pages/StormTheDoor";
import StormTheDoorSuccess from "./pages/StormTheDoorSuccess";
import Integrations from "./pages/Integrations";
import Affiliates from "./pages/Affiliates";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import LinkedInPosts from "./pages/LinkedInPosts";
import Waitlist from "./pages/Waitlist";
import AdminPanel from "./pages/AdminPanel";
import CallScript from "./pages/CallScript";
import VisibilityAudit from "./pages/VisibilityAudit";
import Billing from "./pages/Billing";
import WaterRestoration from "./pages/WaterRestoration";
import AdminClaimsDashboard from "./pages/AdminClaimsDashboard";
import ClaimStatus from "./pages/ClaimStatus";
import PhotoChecklist from "./pages/PhotoChecklist";
import ShingleIdentifier from "./pages/ShingleIdentifier";
import AdjusterDispute from "./pages/AdjusterDispute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/jobs/new" component={NewJob} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/reference" component={Reference} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/demo" component={Demo} />
      <Route path="/free-guide" component={FreeGuide} />
      <Route path="/storm-the-door" component={StormTheDoor} />
      <Route path="/storm-the-door/success" component={StormTheDoorSuccess} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/affiliates" component={Affiliates} />
      <Route path="/affiliate-dashboard" component={AffiliateDashboard} />
      <Route path="/linkedin-posts" component={LinkedInPosts} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/call-script" component={CallScript} />
      <Route path="/visibility-audit" component={VisibilityAudit} />
      <Route path="/billing" component={Billing} />
      <Route path="/water-restoration" component={WaterRestoration} />
      <Route path="/admin/claims" component={AdminClaimsDashboard} />
      <Route path="/claim-status" component={ClaimStatus} />
      <Route path="/photo-checklist" component={PhotoChecklist} />
      <Route path="/shingle-identifier" component={ShingleIdentifier} />
      <Route path="/adjuster-dispute" component={AdjusterDispute} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
