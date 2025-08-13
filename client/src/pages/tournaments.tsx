import type { Tournament } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Trophy, Star, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

import Header from '@/components/header';
import TournamentCard from '@/components/tournament-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useTelegram } from '@/services/telegram';
import { useWebSocketService, type WebSocketMessage } from '@/services/websocket';

export default function TournamentsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { getAuthHeaders, processStarsPayment } = useTelegram();
  const { addCallback } = useWebSocketService();

  // Fetch tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments'],
    queryFn: async () => {
      const response = await fetch('/api/tournaments', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch tournaments');
      return response.json();
    },
  });

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/user/me'],
    queryFn: async () => {
      const response = await fetch('/api/user/me', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join tournament');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: "You've successfully joined the tournament!",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/me'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // WebSocket for real-time updates
  useEffect(() => {
    return addCallback((message: WebSocketMessage) => {
      switch (message.type) {
        case 'tournament_created':
        case 'tournament_updated':
        case 'tournament_registration':
        case 'tournament_unregistration':
          queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
          break;
        case 'tournament_deleted':
          queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
          break;
      }
    });
  }, [addCallback]);

  const handleJoinTournament = async (tournament: Tournament) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please authenticate first',
        variant: 'destructive',
      });
      return;
    }

    if (user.stars < tournament.entryFee) {
      toast({
        title: 'Insufficient Stars',
        description: `You need ${tournament.entryFee} stars to join this tournament`,
        variant: 'destructive',
      });
      return;
    }

    if (tournament.participants.includes(user.id)) {
      toast({
        title: 'Already Joined',
        description: "You're already registered for this tournament",
        variant: 'destructive',
      });
      return;
    }

    try {
      // Process payment with Telegram Stars
      const paymentSuccess = await processStarsPayment(tournament.entryFee, tournament.id);

      if (paymentSuccess) {
        joinTournamentMutation.mutate(tournament.id);
      } else {
        toast({
          title: 'Payment Cancelled',
          description: 'Tournament registration was cancelled',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Payment Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    }
  };

  // Featured tournament (first active tournament)
  const featuredTournament = tournaments.find((t: Tournament) => t.status === 'active');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-sm mx-auto px-4 py-4 space-y-4">
        {/* Featured Tournament Hero */}
        {featuredTournament && (
          <div className="relative bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                alt="Gaming tournament arena with neon lights"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="relative p-6 text-center">
              {/* Golden trophy with laurel wreaths */}
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <Trophy className="text-trophy-gold w-16 h-16 drop-shadow-lg" />
                  <div className="absolute -inset-2 text-yellow-400">
                    <Star className="w-4 h-4 absolute -top-1 -left-1 transform -rotate-45" />
                    <Star className="w-4 h-4 absolute -top-1 -right-1 transform rotate-45" />
                    <Star className="w-4 h-4 absolute -bottom-1 -left-1 transform rotate-45" />
                    <Star className="w-4 h-4 absolute -bottom-1 -right-1 transform -rotate-45" />
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Take part in</h2>
              <h3 className="text-lg font-semibold text-white mb-4">Warzone Stars Tournament</h3>
              <p className="text-sm text-gray-200 mb-2">
                Battle for glory in the ultimate gaming showdown
              </p>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-200">
                <span className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>{featuredTournament.participants.length} joined</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Starts soon</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tournament Cards List */}
        {tournamentsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-3" />
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <Card className="p-8 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tournaments Available</h3>
            <p className="text-gray-600 mb-4">Check back later for new tournaments!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament: Tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onJoin={handleJoinTournament}
              />
            ))}
          </div>
        )}

        {/* Add Tournament Button (Admin Only) */}
        {user?.isAdmin && (
          <Button
            className="w-full bg-gaming-green hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center space-x-2 border-2 border-dashed border-green-400 bg-opacity-90"
            onClick={() => setLocation('/admin')}
          >
            <Plus className="w-5 h-5" />
            <span>Add New Tournament</span>
          </Button>
        )}
      </main>
    </div>
  );
}
