import { Home, Plus, Map, History, BarChart3, FileText, User, LogOut, Waves } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';

export type PageId = 'dashboard' | 'new-cleanup' | 'map' | 'history' | 'statistics' | 'reports' | 'profile';

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  onLogout: () => void;
  userName: string;
}

const menuItems = [
  { id: 'dashboard' as PageId, label: 'Tableau de bord', icon: Home },
  { id: 'new-cleanup' as PageId, label: 'Nouveau ramassage', icon: Plus },
  { id: 'map' as PageId, label: 'Carte', icon: Map },
  { id: 'history' as PageId, label: 'Historique', icon: History },
  { id: 'statistics' as PageId, label: 'Statistiques', icon: BarChart3 },
  { id: 'reports' as PageId, label: 'Rapports', icon: FileText },
  { id: 'profile' as PageId, label: 'Profil', icon: User },
];

export function Sidebar({ currentPage, onPageChange, onLogout, userName }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A4F70] to-[#3FA796] flex items-center justify-center">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0A4F70]">Zéro Déchets</h2>
            <p className="text-xs text-gray-600">Rade</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-11 px-3',
                  isActive
                    ? 'bg-[#0A4F70] text-white hover:bg-[#0A4F70]/90 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-600">Bénévole</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </aside>
  );
}
