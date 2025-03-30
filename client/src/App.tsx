import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ContentCalendar from "@/pages/ContentCalendar";
import ContentEditor from "@/pages/ContentEditor";
import AIAssistant from "@/pages/AIAssistant";
import AutoEngage from "@/pages/AutoEngage";
import Analytics from "@/pages/Analytics";
import Monetization from "@/pages/Monetization";
import Settings from "@/pages/Settings";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/calendar" component={ContentCalendar} />
      <Route path="/editor" component={ContentEditor} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/auto-engage" component={AutoEngage} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/monetization" component={Monetization} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
