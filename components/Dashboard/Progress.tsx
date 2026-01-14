
import React from 'react';

const Progress: React.FC = () => {
  const chartData = [40, 55, 45, 70, 65, 80, 72];
  const skills = [
    { label: 'Long Pots', value: 65, color: 'bg-indigo-500' },
    { label: 'Positioning', value: 82, color: 'bg-chalk-blue' },
    { label: 'Safety Play', value: 45, color: 'bg-orange-400' }
  ];

  return (
    <div className="animate-fade-in overflow-hidden pb-10">
      <div className="mb-6 animate-slide-down">
        <h2 className="text-xl font-bold text-deep-charcoal dark:text-white">Performance Insights</h2>
        <p className="text-xs text-muted-text dark:text-dark-text-muted">Tracking your road to mastery.</p>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-[2rem] border border-soft-gray dark:border-dark-border shadow-sm mb-6 animate-zoom-in stagger-item-1">
        <div className="flex justify-between items-end mb-6">
          <div className="animate-slide-left stagger-item-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-text dark:text-dark-text-muted mb-1">Weekly Accuracy</div>
            <div className="text-2xl font-black text-deep-charcoal dark:text-white">72.4% <span className="text-green-500 text-xs font-bold animate-pulse">+4.2%</span></div>
          </div>
          <div className="flex gap-1 items-end h-20">
            {chartData.map((height, i) => (
              <div 
                key={i} 
                className={`w-3.5 rounded-t-lg transition-all duration-1000 ${i === 6 ? 'bg-chalk-blue shadow-[0_-4px_12px_rgba(135,206,235,0.5)]' : 'bg-soft-gray dark:bg-dark-border opacity-60'}`}
                style={{ 
                  height: `${height}%`,
                  transitionDelay: `${i * 100}ms`
                }}
              ></div>
            ))}
          </div>
        </div>
        <div className="flex justify-between px-1.5 animate-fade-in stagger-item-3">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-muted-text dark:text-dark-text-muted">{d}</span>
          ))}
        </div>
      </div>

      {/* Skill Breakdown */}
      <section className="space-y-4 mb-8">
        <h3 className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest px-1 animate-fade-in stagger-item-2">Skill Proficiency</h3>
        <div className="bg-white dark:bg-dark-surface p-6 rounded-[2rem] border border-soft-gray dark:border-dark-border shadow-sm space-y-5 animate-slide-up stagger-item-2">
          {skills.map((skill, idx) => (
            <div key={skill.label} className="group">
              <div className="flex justify-between text-[11px] font-bold text-deep-charcoal dark:text-white mb-2 transition-transform group-hover:translate-x-1">
                <span>{skill.label}</span>
                <span className="opacity-60">{skill.value}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
                <div 
                  className={`h-full ${skill.color} rounded-full transition-all duration-[1.5s] ease-out`} 
                  style={{ width: `${skill.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Sessions */}
      <section className="space-y-3 pb-4 animate-slide-up stagger-item-3">
        <h3 className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest px-1">Practice History</h3>
        {[
          { title: 'Speed Drill: Blitz', date: '2 hours ago', score: '12/15', icon: 'timer', color: 'text-orange-500' },
          { title: 'AI Coach: Draw Shots', date: 'Yesterday', score: '32m', icon: 'psychology', color: 'text-chalk-blue-dark' },
          { title: 'Form: Bridge Stability', date: '3 days ago', score: 'A-', icon: 'analytics', color: 'text-indigo-500' },
        ].map((session, i) => (
          <div 
            key={i} 
            className={`bg-white dark:bg-dark-surface p-4 rounded-2xl border border-soft-gray dark:border-dark-border shadow-sm flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group animate-slide-up stagger-item-${i+1}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gray-50 dark:bg-dark-bg flex items-center justify-center ${session.color} group-hover:scale-110 transition-transform shadow-inner`}>
                <span className="material-symbols-outlined text-xl">{session.icon}</span>
              </div>
              <div>
                <div className="text-xs font-bold text-deep-charcoal dark:text-white group-hover:text-chalk-blue-dark transition-colors">{session.title}</div>
                <div className="text-[10px] text-muted-text dark:text-dark-text-muted">{session.date}</div>
              </div>
            </div>
            <div className="text-xs font-black text-deep-charcoal dark:text-white bg-gray-50 dark:bg-dark-bg px-3 py-1.5 rounded-lg border border-soft-gray dark:border-dark-border">{session.score}</div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Progress;
