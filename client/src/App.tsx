import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import FeedbackAssistant from "@/pages/feedback-assistant";
import OurStory from "@/pages/our-story";
import Terms from "@/pages/terms";
import ReportAbuse from "@/pages/report-abuse";
import Planner from "@/pages/planner";
import Library from "@/pages/library";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/feedback" component={FeedbackAssistant} />
      <Route path="/feedback-assistant" component={FeedbackAssistant} />
      <Route path="/our-story" component={OurStory} />
      <Route path="/terms" component={Terms} />
      <Route path="/report-abuse" component={ReportAbuse} />
      <Route path="/planner" component={Planner} />
      <Route path="/library" component={Library} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="taskmaster-theme">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
