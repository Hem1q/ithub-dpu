import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { LanguageProvider } from "@/contexts/language-context";
import { ThemeProvider } from "@/contexts/theme-context";
import Home from "@/pages/home";
import Topic from "@/pages/topic";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import Hub from "@/pages/hub";
import Quiz from "@/pages/quiz";
import Students from "@/pages/students";
import Applicants from "@/pages/applicants";
import Teachers from "@/pages/teachers";
import Admin from "@/pages/admin";
import FeedbackPage from "@/pages/feedback";
import AnalyticsPage from "@/pages/analytics";
import ProjectsPage from "@/pages/projects";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/hub" component={Hub} />
      <Route path="/quiz/:slug" component={Quiz} />
      <Route path="/students" component={Students} />
      <Route path="/applicants" component={Applicants} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/admin" component={Admin} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/" component={Home} />
      <Route path="/topic/:slug" component={Topic} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  if (location === "/login" || location === "/register") {
    return children;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppLayout>
              <Router />
            </AppLayout>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
