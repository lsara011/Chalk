
import React from 'react';
import Logo from '../Logo';
import Progress from './Progress';
import Profile from './Profile';
import { User, AppView } from '../../types';

interface DashboardProps {
  user: User;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  currentView: AppView;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onLogout, currentView }) => {
  const renderContent = () => {
    if (currentView === 'progress') {
      return <Progress />;
    }
    if (currentView === 'profile') {
      return <Profile user={user} onLogout={onLogout} />;
    }

    return (
      <div className="animate-fade-in overflow-hidden">
        <div className="mb-6 animate-slide-down">
          <h2 className="text-xl font-bold text-deep-charcoal dark:text-white">Hi, {user.name}! 👋</h2>
          <p className="text-xs text-muted-text dark:text-dark-text-muted">Ready for today's session?</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-soft-gray dark:border-dark-border shadow-sm animate-zoom-in stagger-item-1 hover:shadow-md hover:scale-[1.02] cursor-pointer">
            <span className="material-symbols-outlined text-chalk-blue-dark text-2xl mb-1 animate-bounce-subtle">trending_up</span>
            <div className="text-xl font-extrabold dark:text-white">84%</div>
            <div className="text-[10px] text-muted-text dark:text-dark-text-muted font-bold uppercase tracking-wider">Pot Success</div>
          </div>
          <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-soft-gray dark:border-dark-border shadow-sm animate-zoom-in stagger-item-2 hover:shadow-md hover:scale-[1.02] cursor-pointer">
            <span className="material-symbols-outlined text-orange-400 text-2xl mb-1">bolt</span>
            <div className="text-xl font-extrabold dark:text-white">12</div>
            <div className="text-[10px] text-muted-text dark:text-dark-text-muted font-bold uppercase tracking-wider">Day Streak</div>
          </div>
        </div>

        <section className="space-y-3 pb-4">
          <h3 className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest px-1 animate-fade-in stagger-item-3">Training Tools</h3>
          
          <button 
            onClick={() => onNavigate('ai-coach')}
            className="w-full group bg-white dark:bg-dark-surface p-1 rounded-[1.5rem] border border-soft-gray dark:border-dark-border shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left overflow-hidden flex items-center animate-slide-up stagger-item-3"
          >
            <div className="w-16 h-16 bg-chalk-blue rounded-[1.3rem] flex items-center justify-center text-deep-charcoal group-hover:bg-chalk-blue-dark flex-shrink-0 transition-colors">
              <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">psychology</span>
            </div>
            <div className="px-4 flex-1">
              <div className="font-bold text-sm text-deep-charcoal dark:text-white">AI Coach</div>
              <p className="text-[10px] text-muted-text dark:text-dark-text-muted line-clamp-1">Custom drills powered by Gemini.</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('speed-session')}
            className="w-full group bg-white dark:bg-dark-surface p-1 rounded-[1.5rem] border border-soft-gray dark:border-dark-border shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left overflow-hidden flex items-center animate-slide-up stagger-item-4"
          >
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/10 rounded-[1.3rem] flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
              <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">timer</span>
            </div>
            <div className="px-4 flex-1">
              <div className="font-bold text-sm text-deep-charcoal dark:text-white">Speed Session</div>
              <p className="text-[10px] text-muted-text dark:text-dark-text-muted line-clamp-1">Timed drill practice sessions.</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('form-analysis')}
            className="w-full group bg-white dark:bg-dark-surface p-1 rounded-[1.5rem] border border-soft-gray dark:border-dark-border shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left overflow-hidden flex items-center animate-slide-up stagger-item-5"
          >
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/10 rounded-[1.3rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <span className="material-symbols-outlined text-3xl group-hover:-translate-y-1 transition-transform">videocam</span>
            </div>
            <div className="px-4 flex-1">
              <div className="font-bold text-sm text-deep-charcoal dark:text-white">Form Analysis</div>
              <p className="text-[10px] text-muted-text dark:text-dark-text-muted line-clamp-1">Record and get technical feedback.</p>
            </div>
          </button>
        </section>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-off-white dark:bg-dark-bg overflow-hidden transition-colors">
      <header className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white dark:bg-dark-surface border-b border-soft-gray dark:border-dark-border z-10 animate-slide-down">
        <div className="flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer">
          <Logo size="sm" />
          <h1 className="text-lg font-extrabold text-deep-charcoal dark:text-white">Chalk</h1>
        </div>
        <button 
          onClick={() => onNavigate('settings')}
          className="w-9 h-9 rounded-full bg-white dark:bg-dark-bg border border-soft-gray dark:border-dark-border flex items-center justify-center text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white transition-all hover:rotate-90"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
        </button>
      </header>

      <main className="px-6 py-5 flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </main>

      <nav className="bg-white dark:bg-dark-surface border-t border-soft-gray dark:border-dark-border px-10 py-4 flex justify-between items-center flex-shrink-0 animate-slide-up shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        {[
          { id: 'dashboard', icon: 'home' },
          { id: 'progress', icon: 'insights' },
          { id: 'profile', icon: 'person' },
          { id: 'settings', icon: 'tune' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => onNavigate(item.id as AppView)} 
            className={`transition-all active:scale-75 ${currentView === item.id ? 'text-chalk-blue-dark scale-110' : 'text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${currentView === item.id ? 'fill-1' : ''}`}>{item.icon}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Dashboard;
