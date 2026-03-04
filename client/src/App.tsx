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
