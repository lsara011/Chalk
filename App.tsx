
import React, { useState, useEffect } from 'react';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import AICoach from './components/Dashboard/AICoach';
import SpeedSession from './components/Dashboard/SpeedSession';
import FormAnalysis from './components/Dashboard/FormAnalysis';
import Settings from './components/Dashboard/Settings';
import Progress from './components/Dashboard/Progress';
import { AppView, User, ThemeMode, LeagueInfo } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [user, setUser] = useState<User | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme-mode') as ThemeMode) || 'auto';
  });

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === 'dark') {
        isDark = true;
      } else if (themeMode === 'auto') {
        const hour = new Date().getHours();
        isDark = hour >= 18 || hour < 6;
      }
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme-mode', themeMode);
    };

    applyTheme();
    const interval = setInterval(applyTheme, 60000);
    return () => clearInterval(interval);
  }, [themeMode]);

  const handleLogin = (email: string) => {
    setUser({ 
      email, 
      name: email.split('@')[0], 
      location: 'Chicago, Illinois',
      skillLevel: 'Intermediate',
      leagues: [
        { id: 'bca', name: 'BCA', ratingLabel: 'FargoRate', rating: '525' },
        { id: 'apa', name: 'APA', ratingLabel: 'SL', rating: '8-Ball: 5, 9-Ball: 4' }
      ]
    });
    setView('dashboard');
  };

  const handleSignupComplete = (userData: { email: string; name: string; location: string; leagues: LeagueInfo[] }) => {
    setUser({ ...userData, skillLevel: 'Novice' });
    setView('dashboard');
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login onLogin={handleLogin} onSwitchToSignup={() => setView('signup')} />;
      case 'signup':
        return <Signup onSignupComplete={handleSignupComplete} onSwitchToLogin={() => setView('login')} />;
      case 'dashboard':
      case 'progress':
      case 'profile':
        return (
          <Dashboard 
            currentView={view} 
            user={user!} 
            onNavigate={(v) => setView(v)} 
            onLogout={handleLogout} 
          />
        );
      case 'ai-coach':
        return <AICoach onBack={() => setView('dashboard')} />;
      case 'speed-session':
        return <SpeedSession onBack={() => setView('dashboard')} />;
      case 'form-analysis':
        return <FormAnalysis onBack={() => setView('dashboard')} />;
      case 'settings':
        return (
          <Settings 
            user={user!}
            onUpdateUser={handleUpdateUser}
            themeMode={themeMode} 
            onThemeChange={setThemeMode} 
            onBack={() => setView('dashboard')} 
            onLogout={handleLogout}
          />
        );
      default:
        return <Login onLogin={handleLogin} onSwitchToSignup={() => setView('signup')} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center bg-off-white dark:bg-dark-bg overflow-hidden transition-colors">
      <div className="w-full max-w-md h-full flex flex-col relative bg-white dark:bg-dark-bg shadow-2xl overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
};

export default App;
