import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';

import { queryClient } from './lib/queryClient';

import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TelegramProvider } from '@/services/telegram';
import { WebSocketProvider } from '@/services/websocket';
import AdminPage from '@/pages/admin';
import NotFound from '@/pages/not-found';
import TournamentDetailPage from '@/pages/tournament-detail';
import TournamentsPage from '@/pages/tournaments';

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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TelegramProvider>
          <WebSocketProvider>
            <div className="min-h-screen bg-gray-100">
              <Toaster />
              <Router />
            </div>
          </WebSocketProvider>
        </TelegramProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
