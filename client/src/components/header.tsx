import { Trophy, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/telegram";
import { useLocation } from "wouter";

export default function Header() {
  const [, setLocation] = useLocation();

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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-sm mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="text-trophy-gold w-6 h-6" />
          <h1 className="text-lg font-semibold text-gray-900">Tournaments</h1>
        </div>
        <div className="flex items-center space-x-3">
          
          
          {/* Admin Panel Toggle */}
          {user?.isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto"
              onClick={() => setLocation('/admin')}
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
