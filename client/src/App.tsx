import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatProvider } from "@/contexts/ChatContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "@/pages/home";
import FeedbackAssistant from "@/pages/feedback-assistant";
import OurStory from "@/pages/our-story";
import Terms from "@/pages/terms";
import ReportAbuse from "@/pages/report-abuse";
import Contact from "@/pages/contact";
import Planner from "@/pages/planner";
import Library from "@/pages/library";
import Register from "@/pages/register";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Subscription from "@/pages/subscription";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/subscription">
        <ProtectedRoute requireActiveSubscription={false}>
          <Subscription />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path="/feedback">
        <ProtectedRoute requiredTier="tier2">
          <FeedbackAssistant />
        </ProtectedRoute>
      </Route>
      <Route path="/feedback-assistant">
        <ProtectedRoute requiredTier="tier2">
          <FeedbackAssistant />
        </ProtectedRoute>
      </Route>
      <Route path="/our-story" component={OurStory} />
      <Route path="/terms" component={Terms} />
      <Route path="/report-abuse" component={ReportAbuse} />
      <Route path="/contact" component={Contact} />
      <Route path="/planner">
        <ProtectedRoute>
          <Planner />
        </ProtectedRoute>
      </Route>
      <Route path="/library">
        <ProtectedRoute>
          <Library />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="taskmaster-theme">
        <AuthProvider>
          <ChatProvider>
            <TooltipProvider>
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <div className="flex-1 overflow-auto">
                    <Router />
                  </div>
                </div>
                <Toaster />
              </SidebarProvider>
            </TooltipProvider>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
