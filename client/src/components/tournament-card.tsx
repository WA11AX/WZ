import type { Tournament } from "@shared/schema";
import { Star, Trophy, Users, Clock, Zap, Target } from "lucide-react";
import { useLocation } from "wouter";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TournamentCardProps {
  tournament: Tournament;
  onJoin?: (tournament: Tournament) => void;
  showJoinButton?: boolean;
}

export default function TournamentCard({
  tournament,
  onJoin,
  showJoinButton = true,
}: TournamentCardProps) {
  const [, setLocation] = useLocation();

  const formatDate = (date: Date) => {
    const now = new Date();
    const tournamentDate = new Date(date);
    const isToday = tournamentDate.toDateString() === now.toDateString();

    if (isToday) {
      return `Today ${tournamentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      })}`;
    }

    const isTomorrow =
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() ===
      tournamentDate.toDateString();
    if (isTomorrow) {
      return `Tomorrow ${tournamentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      })}`;
    }

    return tournamentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "gradient-green animate-glow";
      case "upcoming":
        return "gradient-orange";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Zap className="w-3 h-3 text-white" />;
      case "upcoming":
        return <Clock className="w-3 h-3 text-white" />;
      case "completed":
        return <Target className="w-3 h-3 text-white" />;
      default:
        return <Clock className="w-3 h-3 text-white" />;
    }
  };

  const handleCardClick = () => {
    setLocation(`/tournament/${tournament.id}`);
  };

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-tournament border-0 cursor-pointer hover:shadow-tournament-hover hover:scale-105 transition-all duration-300 animate-float">
      <div className="relative h-36 overflow-hidden group" onClick={handleCardClick}>
        <img
          src={tournament.mapImage}
          alt={`${tournament.mapName} gaming environment`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-purple-900/20"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>

        {/* Map Name Overlay */}
        <div className="absolute top-3 left-3">
          <div className="glass rounded-xl px-3 py-2 transform transition-transform hover:scale-105">
            <span className="text-white text-sm font-bold tracking-wide drop-shadow-lg">
              {tournament.mapName}
            </span>
          </div>
        </div>

        {/* Entry Fee and Prize Badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <div className="gradient-orange rounded-full px-3 py-1.5 flex items-center space-x-1.5 shadow-lg transform transition-transform hover:scale-110">
            <Star className="text-white w-4 h-4 fill-current drop-shadow" />
            <span className="text-white text-sm font-bold drop-shadow">{tournament.entryFee}</span>
          </div>
          <div className="gradient-green rounded-full px-3 py-1.5 flex items-center space-x-1.5 shadow-lg transform transition-transform hover:scale-110">
            <Trophy className="text-white w-4 h-4 drop-shadow" />
            <span className="text-white text-sm font-bold drop-shadow">{tournament.prize}</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute bottom-3 left-3">
          <div
            className={`flex items-center space-x-2 ${getStatusColor(tournament.status)} rounded-full px-4 py-2 shadow-lg`}
          >
            {getStatusIcon(tournament.status)}
            <span className="text-white text-sm font-bold uppercase tracking-wider drop-shadow">
              {tournament.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tournament Details */}
      <div className="p-5 bg-gradient-to-br from-white to-gray-50">
        <div className="flex justify-between items-start mb-3">
          <h3
            className="font-bold text-xl text-gray-900 cursor-pointer hover:text-telegram-blue transition-colors"
            onClick={handleCardClick}
          >
            {tournament.title}
          </h3>
          <div className="text-right">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
              <Clock className="w-4 h-4 text-telegram-blue" />
              <span className="text-sm font-medium text-gray-700">
                {formatDate(tournament.date)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-4 cursor-pointer leading-relaxed" onClick={handleCardClick}>
          {tournament.description}
        </p>

        {/* Participant Info */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[...Array(Math.min(4, tournament.participants.length))].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 gradient-blue rounded-full border-3 border-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:z-10"
                >
                  <Users className="text-white w-4 h-4" />
                </div>
              ))}
              {tournament.participants.length > 4 && (
                <div className="w-8 h-8 gradient-purple rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">
                    +{tournament.participants.length - 4}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {tournament.participants.length}
              </div>
              <div className="text-xs text-gray-500 -mt-1">players</div>
            </div>
          </div>

          {/* Tournament Type Badge */}
          <Badge className="gradient-blue text-white font-bold px-3 py-1 shadow-lg border-0">
            {tournament.tournamentType}
          </Badge>
        </div>

        {/* Action Button */}
        {showJoinButton && (
          <Button
            className="w-full gradient-blue text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:scale-105 transform border-0"
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.(tournament);
            }}
          >
            <Star className="w-5 h-5 fill-current animate-pulse" />
            <span className="text-lg">Join for {tournament.entryFee} stars</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </Button>
        )}
      </div>
    </Card>
  );
}
