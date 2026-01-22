import { useState, useEffect } from 'react';
import { AuthPage } from '@/app/components/AuthPage';
import { Sidebar, PageId } from '@/app/components/Sidebar';
import { DashboardPage } from '@/app/components/DashboardPage';
import { NewCleanupPage } from '@/app/components/NewCleanupPage';
import { MapPage } from '@/app/components/MapPage';
import { HistoryPage } from '@/app/components/HistoryPage';
import { StatisticsPage } from '@/app/components/StatisticsPage';
import { ReportsPage } from '@/app/components/ReportsPage';
import { ProfilePage } from '@/app/components/ProfilePage';
import { isLoggedIn, logout, getStoredUser } from '@/lib/mockData';
import { Toaster } from '@/app/components/ui/sonner';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [userName, setUserName] = useState('Utilisateur');

  useEffect(() => {
    const loggedIn = isLoggedIn();
    setAuthenticated(loggedIn);
    
    if (loggedIn) {
      const user = getStoredUser();
      if (user) {
        setUserName(user.name);
      }
    }
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
    const user = getStoredUser();
    if (user) {
      setUserName(user.name);
    }
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'new-cleanup':
        return <NewCleanupPage />;
      case 'map':
        return <MapPage />;
      case 'history':
        return <HistoryPage />;
      case 'statistics':
        return <StatisticsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  if (!authenticated) {
    return (
      <>
        <AuthPage onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EFEA]">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        userName={userName}
      />
      
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
