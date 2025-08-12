import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Trophy, Star, Users, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  getAuthHeaders,
  processStarsPayment,
  showBackButton,
  hideBackButton,
} from "@/lib/telegram";
import { useEffect } from "react";
import type { Tournament, User } from "@shared/schema";

export default function TournamentDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const tournamentId = params.id;

  // Setup Telegram back button
  useEffect(() => {
    showBackButton(() => setLocation("/"));
    return () => hideBackButton();
  }, [setLocation]);

  // Fetch tournament details
  const { data: tournament, isLoading: tournamentLoading } = useQuery({
    queryKey: ["/api/tournaments", tournamentId],
    queryFn: async () => {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch tournament");
      return response.json();
    },
    enabled: !!tournamentId,
  });

  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/me"],
  });

  // Fetch participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ["/api/tournaments", tournamentId, "participants"],
    queryFn: async () => {
      const response = await fetch(`/api/tournaments/${tournamentId}/participants`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch participants");
      return response.json();
    },
    enabled: !!tournamentId,
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to join tournament");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've successfully joined the tournament!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/tournaments", tournamentId, "participants"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleJoinTournament = async () => {
    if (!user || !tournament) return;

    if (user.stars < tournament.entryFee) {
      toast({
        title: "Insufficient Stars",
        description: `You need ${tournament.entryFee} stars to join this tournament`,
        variant: "destructive",
      });
      return;
    }

    if (tournament.participants.includes(user.id)) {
      toast({
        title: "Already Joined",
        description: "You're already registered for this tournament",
        variant: "destructive",
      });
      return;
    }

    try {
      const paymentSuccess = await processStarsPayment(tournament.entryFee, tournament.id);

      if (paymentSuccess) {
        joinTournamentMutation.mutate();
      } else {
        toast({
          title: "Payment Cancelled",
          description: "Tournament registration was cancelled",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (date: Date) => {
    const tournamentDate = new Date(date);
    return {
      date: tournamentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      time: tournamentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  if (tournamentLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-sm mx-auto">
          <div className="bg-white p-4 border-b">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="p-4 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-6 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tournament Not Found</h3>
          <p className="text-gray-600 mb-4">The tournament you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/")}>Back to Tournaments</Button>
        </Card>
      </div>
    );
  }

  const { date, time } = formatDateTime(tournament.date);
  const isUserRegistered = user && tournament.participants.includes(user.id);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" className="p-2 mr-2" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Tournament Details</h1>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-6">
        {/* Tournament Hero */}
        <div className="relative h-48 rounded-xl overflow-hidden">
          <img
            src={tournament.mapImage}
            alt={`${tournament.mapName} tactical gaming zone`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Tournament Stats Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-2">{tournament.title}</h3>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="text-gray-200 text-sm">Entry Fee</div>
                <div className="flex items-center space-x-1">
                  <Star className="text-trophy-gold w-4 h-4 fill-current" />
                  <span className="text-white font-bold">{tournament.entryFee} Stars</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-gray-200 text-sm">Prize Pool</div>
                <div className="flex items-center space-x-1">
                  <Trophy className="text-trophy-gold w-4 h-4" />
                  <span className="text-white font-bold">{tournament.prize} Stars</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{tournament.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Date & Time</span>
                </h4>
                <p className="text-sm text-gray-600">{date}</p>
                <p className="text-sm text-gray-600">{time}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1 flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Participants</span>
                </h4>
                <p className="text-sm text-gray-600">
                  {tournament.participants.length} / {tournament.maxParticipants}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {tournament.tournamentType}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Participant List Preview */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Recent Participants</h4>
              {participantsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : participants.length === 0 ? (
                <p className="text-sm text-gray-500">No participants yet. Be the first to join!</p>
              ) : (
                <div className="space-y-2">
                  {participants.slice(0, 5).map((participant: User) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-telegram-blue rounded-full flex items-center justify-center">
                        <Users className="text-white w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">@{participant.username}</div>
                        <div className="text-xs text-gray-500">
                          {participant.firstName} {participant.lastName}
                        </div>
                      </div>
                    </div>
                  ))}
                  {participants.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{participants.length - 5} more participants
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          {isUserRegistered ? (
            <div className="text-center p-4 bg-gaming-green bg-opacity-10 rounded-xl">
              <Trophy className="w-8 h-8 text-gaming-green mx-auto mb-2" />
              <p className="text-gaming-green font-semibold">
                You're registered for this tournament!
              </p>
              <p className="text-sm text-gray-600 mt-1">Good luck in the competition!</p>
            </div>
          ) : tournament.participants.length >= tournament.maxParticipants ? (
            <Button className="w-full py-4 rounded-xl" disabled variant="secondary">
              Tournament Full
            </Button>
          ) : (
            <Button
              className="w-full bg-telegram-blue hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              onClick={handleJoinTournament}
              disabled={joinTournamentMutation.isPending}
            >
              <Star className="w-4 h-4 fill-current" />
              <span>
                {joinTournamentMutation.isPending
                  ? "Processing..."
                  : `Join for ${tournament.entryFee} stars`}
              </span>
            </Button>
          )}

          <Button
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            variant="secondary"
            onClick={() => {
              /* Show full participant list */
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            View All Participants
          </Button>
        </div>
      </div>
    </div>
  );
}
