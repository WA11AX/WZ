import { useQuery } from '@tanstack/react-query';
import { Trophy, Settings, Star } from 'lucide-react';
import { useLocation } from 'wouter';

import { Button } from '@/components/ui/button';
import { getAuthHeaders } from '@/lib/telegram';

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
          <h1 className="text-lg font-semibold text-gray-900 ml-[100px] mr-[100px]">Wrzone</h1>
        </div>
        <div className="flex items-center space-x-3">
          {/* User Stars Balance */}
          <div className="flex items-center space-x-1 bg-telegram-blue bg-opacity-10 px-2 py-1 rounded-full">
            <Star className="text-telegram-blue w-4 h-4 fill-current" />
            <span className="text-sm font-medium text-telegram-blue">{user?.stars || 0}</span>
          </div>

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
