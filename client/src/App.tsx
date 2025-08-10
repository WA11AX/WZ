import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TournamentsPage from "@/pages/tournaments";
import TournamentDetailPage from "@/pages/tournament-detail";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { initTelegram } from "@/lib/telegram";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TournamentsPage} />
      <Route path="/tournament/:id" component={TournamentDetailPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-100">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
