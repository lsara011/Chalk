
import React from 'react';
import { User } from '../../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  return (
    <div className="animate-fade-in overflow-hidden pb-10">
      <div className="flex flex-col items-center mb-6 pt-6 animate-slide-down">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-[2.5rem] bg-chalk-blue flex items-center justify-center text-5xl font-black text-deep-charcoal shadow-2xl border-4 border-white dark:border-dark-surface animate-zoom-in">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-deep-charcoal dark:bg-white text-white dark:text-deep-charcoal flex items-center justify-center border-4 border-white dark:border-dark-surface shadow-lg hover:scale-110 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        </div>
        <h2 className="text-2xl font-black text-deep-charcoal dark:text-white mb-1 tracking-tight">{user.name}</h2>
        <div className="flex flex-col items-center gap-1 text-xs text-muted-text dark:text-dark-text-muted font-semibold mb-6">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">location_on</span>
            {user.location || 'Unknown Location'}
          </div>
          <div className="px-3 py-1 bg-gray-100 dark:bg-dark-border rounded-full text-[9px] font-black uppercase tracking-widest mt-1">
            {user.skillLevel || 'Novice'}
          </div>
        </div>
        
        {/* League Ratings Column */}
        <div className="w-full space-y-3 px-4 animate-slide-up stagger-item-1">
          {user.leagues && user.leagues.length > 0 ? (
            user.leagues.map((league) => {
              const isAPA = league.id === 'apa';
              const ratingParts = league.rating.split(', ').filter(Boolean);
              
              return (
                <div 
                  key={league.id} 
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.8rem] border transition-all shadow-sm ${
                    isAPA 
                    ? 'bg-gray-50 dark:bg-dark-surface border-soft-gray dark:border-dark-border opacity-90' 
                    : 'bg-white dark:bg-dark-surface border-chalk-blue/30 dark:border-chalk-blue/20'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-black uppercase tracking-widest ${isAPA ? 'text-[9px] text-muted-text' : 'text-[11px] text-chalk-blue-dark'}`}>
                      {league.name}
                    </span>
                    <span className={`font-bold text-muted-text dark:text-dark-text-muted ${isAPA ? 'text-[10px]' : 'text-[10px]'}`}>
                      {league.ratingLabel}
                    </span>
                  </div>
                  
                  <div className={`flex flex-col items-end ${isAPA ? 'gap-0.5' : ''}`}>
                    {ratingParts.map((part, pIdx) => (
                      <div 
                        key={pIdx}
                        className={`font-black text-deep-charcoal dark:text-white text-right leading-tight transition-all ${
                          !isAPA 
                            ? 'text-2xl tracking-tighter' 
                            : ratingParts.length === 1 
                              ? 'text-2xl' 
                              : 'text-xs'
                        }`}
                      >
                        {part}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
             <div className="w-full px-5 py-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.15em] border border-indigo-100 dark:border-indigo-500/20 shadow-sm text-center">
                Unattached Player
              </div>
          )}
        </div>
      </div>

      {/* Profile Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8 px-4 animate-slide-up stagger-item-2">
        {[
          { label: 'Total Hours', value: '42.5', icon: 'schedule' },
          { label: 'Drills Done', value: '184', icon: 'fitness_center' },
          { label: 'Accuracy', value: '74%', icon: 'target' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-dark-surface p-4 rounded-[1.5rem] border border-soft-gray dark:border-dark-border text-center shadow-sm hover:border-chalk-blue transition-all group">
            <span className="material-symbols-outlined text-chalk-blue opacity-40 text-sm mb-1 group-hover:scale-110 transition-transform">{stat.icon}</span>
            <div className="text-lg font-black text-deep-charcoal dark:text-white">{stat.value}</div>
            <div className="text-[8px] font-black text-muted-text dark:text-dark-text-muted uppercase tracking-widest leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <section className="space-y-4 mb-8 px-4 animate-slide-up stagger-item-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest">Achievements</h3>
          <button className="text-[10px] font-black text-chalk-blue-dark uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: 'speed', color: 'text-orange-500', label: 'Fast Break' },
            { icon: 'military_tech', color: 'text-indigo-500', label: 'Pro Form' },
            { icon: 'stars', color: 'text-yellow-500', label: 'Consistent' },
            { icon: 'local_fire_department', color: 'text-red-500', label: 'On Fire' },
          ].map((badge, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-full aspect-square bg-white dark:bg-dark-surface rounded-2xl border border-soft-gray dark:border-dark-border flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                <span className={`material-symbols-outlined text-2xl ${badge.color}`}>{badge.icon}</span>
              </div>
              <span className="text-[9px] font-bold text-muted-text dark:text-dark-text-muted text-center leading-none group-hover:text-deep-charcoal dark:group-hover:text-white transition-colors">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Account Actions */}
      <div className="space-y-3 pb-8 px-4 animate-slide-up stagger-item-4">
        <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-dark-surface rounded-2xl border border-soft-gray dark:border-dark-border shadow-sm group hover:border-indigo-500 transition-all">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
               <span className="material-symbols-outlined">groups</span>
             </div>
             <span className="text-sm font-bold text-deep-charcoal dark:text-white">Club Community</span>
          </div>
          <span className="material-symbols-outlined text-muted-text dark:text-dark-text-muted group-hover:translate-x-1 transition-transform">chevron_right</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-600 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
