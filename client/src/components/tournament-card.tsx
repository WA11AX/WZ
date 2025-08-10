import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Users, Clock } from "lucide-react";
import type { Tournament } from "@shared/schema";
import { useLocation } from "wouter";

interface TournamentCardProps {
  tournament: Tournament;
  onJoin?: (tournament: Tournament) => void;
  showJoinButton?: boolean;
}

export default function TournamentCard({ tournament, onJoin, showJoinButton = true }: TournamentCardProps) {
  const [, setLocation] = useLocation();

  const formatDate = (date: Date) => {
    const now = new Date();
    const tournamentDate = new Date(date);
    const isToday = tournamentDate.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today ${tournamentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: false 
      })}`;
    }
    
    const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === tournamentDate.toDateString();
    if (isTomorrow) {
      return `Tomorrow ${tournamentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: false 
      })}`;
    }
    
    return tournamentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-gaming-green';
      case 'upcoming': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const handleCardClick = () => {
    setLocation(`/tournament/${tournament.id}`);
  };

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative h-32 overflow-hidden" onClick={handleCardClick}>
        <img 
          src={tournament.mapImage} 
          alt={`${tournament.mapName} gaming environment`}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        
        {/* Map Name Overlay */}
        <div className="absolute top-3 left-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-white text-xs font-medium">{tournament.mapName}</span>
          </div>
        </div>
        
        {/* Entry Fee and Prize Badges */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <div className="bg-entry-orange rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="text-white w-3 h-3 fill-current" />
            <span className="text-white text-xs font-bold">{tournament.entryFee}</span>
          </div>
          <div className="bg-gaming-green rounded-full px-2 py-1 flex items-center space-x-1">
            <Trophy className="text-white w-3 h-3" />
            <span className="text-white text-xs font-bold">{tournament.prize}</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute bottom-3 left-3">
          <div className={`flex items-center space-x-1 ${getStatusColor(tournament.status)} rounded-full px-2 py-1`}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse-dot"></div>
            <span className="text-white text-xs font-medium uppercase">{tournament.status}</span>
          </div>
        </div>
      </div>

      {/* Tournament Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 cursor-pointer" onClick={handleCardClick}>
            {tournament.title}
          </h3>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(tournament.date)}</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 cursor-pointer" onClick={handleCardClick}>
          {tournament.description}
        </p>
        
        {/* Participant Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, tournament.participants.length))].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-telegram-blue rounded-full border-2 border-white flex items-center justify-center">
                  <Users className="text-white w-3 h-3" />
                </div>
              ))}
              {tournament.participants.length > 3 && (
                <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+{tournament.participants.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {tournament.participants.length} players joined
            </span>
          </div>
          
          {/* Tournament Type Badge */}
          <Badge variant="secondary" className="text-xs">
            {tournament.tournamentType}
          </Badge>
        </div>

        {/* Action Button */}
        {showJoinButton && (
          <Button 
            className="w-full bg-telegram-blue hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.(tournament);
            }}
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Join for {tournament.entryFee} stars</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
