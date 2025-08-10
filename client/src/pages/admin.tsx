import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Trophy, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/telegram";
import type { Tournament, User } from "@shared/schema";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mapName: '',
    mapImage: '',
    date: '',
    entryFee: '',
    prize: '',
    maxParticipants: '100',
    status: 'upcoming' as const,
    tournamentType: 'BATTLE ROYALE',
  });

  // Check if user is admin
  const { data: user } = useQuery({
    queryKey: ['/api/user/me'],
  });

  // Fetch tournaments
  const { data: tournaments = [] } = useQuery({
    queryKey: ['/api/tournaments'],
  });

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...data,
          date: new Date(data.date),
          entryFee: parseInt(data.entryFee),
          prize: parseInt(data.prize),
          maxParticipants: parseInt(data.maxParticipants),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create tournament');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Tournament created successfully!",
      });
      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        mapName: '',
        mapImage: '',
        date: '',
        entryFee: '',
        prize: '',
        maxParticipants: '100',
        status: 'upcoming',
        tournamentType: 'BATTLE ROYALE',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete tournament mutation
  const deleteTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete tournament');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Tournament deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-6 text-center max-w-sm mx-auto">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Button onClick={() => setLocation('/')}>Back to Tournaments</Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.entryFee || !formData.prize) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTournamentMutation.mutate(formData);
  };

  const handleDelete = (tournamentId: string, tournamentTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${tournamentTitle}"?`)) {
      deleteTournamentMutation.mutate(tournamentId);
    }
  };

  const activeTournaments = tournaments.filter((t: Tournament) => t.status === 'active').length;
  const totalParticipants = tournaments.reduce((acc: number, t: Tournament) => acc + t.participants.length, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 mr-2"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600">Manage tournaments and settings</p>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-6">
        {/* Admin Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-telegram-blue to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{activeTournaments}</div>
              <div className="text-sm opacity-90">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-gaming-green to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{totalParticipants}</div>
              <div className="text-sm opacity-90">Players</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gaming-green hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create Tournament</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle>Create New Tournament</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Tournament Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter tournament title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tournament description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mapName">Map Name</Label>
                    <Input
                      id="mapName"
                      value={formData.mapName}
                      onChange={(e) => setFormData(prev => ({ ...prev, mapName: e.target.value }))}
                      placeholder="e.g. REBIRTH ISLAND"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tournamentType">Type</Label>
                    <Select
                      value={formData.tournamentType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tournamentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BATTLE ROYALE">Battle Royale</SelectItem>
                        <SelectItem value="CHAMPIONSHIP">Championship</SelectItem>
                        <SelectItem value="TOURNAMENT">Tournament</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="mapImage">Map Image URL</Label>
                  <Input
                    id="mapImage"
                    value={formData.mapImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mapImage: e.target.value }))}
                    placeholder="https://example.com/map-image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="date">Date & Time *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="entryFee">Entry Fee *</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      value={formData.entryFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, entryFee: e.target.value }))}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prize">Prize *</Label>
                    <Input
                      id="prize"
                      type="number"
                      value={formData.prize}
                      onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max Players</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'upcoming' | 'active' | 'completed') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gaming-green hover:bg-green-600"
                    disabled={createTournamentMutation.isPending}
                  >
                    {createTournamentMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tournament Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Manage Tournaments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tournaments.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No tournaments created yet</p>
            ) : (
              <div className="space-y-3">
                {tournaments.map((tournament: Tournament) => (
                  <div key={tournament.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{tournament.title}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{tournament.participants.length} participants</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tournament.status === 'active' ? 'bg-gaming-green text-white' :
                            tournament.status === 'upcoming' ? 'bg-yellow-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {tournament.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto"
                          onClick={() => setLocation(`/tournament/${tournament.id}`)}
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto"
                          onClick={() => handleDelete(tournament.id, tournament.title)}
                          disabled={deleteTournamentMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Entry: {tournament.entryFee} ⭐</span>
                      <span>Prize: {tournament.prize} ⭐</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
