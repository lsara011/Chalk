
import React, { useState, useEffect, useRef } from 'react';
import { SpeedDrill } from '../../types';

interface SpeedSessionProps {
  onBack: () => void;
}

const SPEED_DRILLS: SpeedDrill[] = [
  { id: '1', name: 'Stop Shot Sprint', target: '10 successful stops', description: 'Pot the object ball and make the cue ball stop dead. Do 10 in a row.' },
  { id: '2', name: 'Rail Runner', target: '8 rail cuts', description: 'Cut the object ball into the corner pocket while it is frozen to the rail.' },
  { id: '3', name: 'Spot Shot Fury', target: '5 straight pots', description: 'Place object ball on foot spot, cue ball in kitchen. Pot straight in.' },
  { id: '4', name: 'Corner Pocket Chaos', target: '12 angled pots', description: 'Pot balls into corner pockets from various angles at high speed.' },
  { id: '5', name: 'The Gauntlet', target: '6 side pocket cuts', description: 'Focus exclusively on side pocket accuracy under time pressure.' }
];

const SpeedSession: React.FC<SpeedSessionProps> = ({ onBack }) => {
  const [phase, setPhase] = useState<'setup' | 'active' | 'summary'>('setup');
  const [duration, setDuration] = useState(300); // Default 5 mins
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [completedDrills, setCompletedDrills] = useState<number>(0);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'active' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPhase('summary');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const startSession = (secs: number) => {
    setDuration(secs);
    setTimeLeft(secs);
    setCompletedDrills(0);
    setCurrentDrillIndex(0);
    setPhase('active');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nextDrill = () => {
    setCompletedDrills(prev => prev + 1);
    setCurrentDrillIndex(prev => (prev + 1) % SPEED_DRILLS.length);
  };

  const currentDrill = SPEED_DRILLS[currentDrillIndex];
  const progressPercent = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="w-full h-full flex flex-col bg-off-white dark:bg-dark-bg overflow-hidden transition-colors">
      <header className="px-6 py-4 flex items-center gap-4 bg-white dark:bg-dark-surface border-b border-soft-gray dark:border-dark-border flex-shrink-0">
        <button 
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white dark:bg-dark-bg border border-soft-gray dark:border-dark-border flex items-center justify-center text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        <h1 className="text-lg font-extrabold text-deep-charcoal dark:text-white tracking-tight">Speed Session</h1>
      </header>

      <main className="px-6 py-5 flex-1 flex flex-col overflow-y-auto no-scrollbar">
        {phase === 'setup' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-500/20">
              <span className="material-symbols-outlined text-4xl mb-2">bolt</span>
              <h2 className="text-2xl font-extrabold mb-2 tracking-tight">Race the Clock</h2>
              <p className="text-sm opacity-90 leading-relaxed font-medium">Build consistency under pressure. Complete as many drills as possible before the buzzer sounds.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest px-1">Select Duration</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Blitz (2 Min)', value: 120, icon: 'timer_10' },
                  { label: 'Standard (5 Min)', value: 300, icon: 'timer' },
                  { label: 'Endurance (10 Min)', value: 600, icon: 'hourglass_empty' }
                ].map((option) => (
                  <button 
                    key={option.value}
                    onClick={() => startSession(option.value)}
                    className="w-full bg-white dark:bg-dark-surface p-5 rounded-[2rem] border border-soft-gray dark:border-dark-border flex items-center justify-between hover:border-orange-500 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined">{option.icon}</span>
                      </div>
                      <span className="font-bold text-deep-charcoal dark:text-white">{option.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-muted-text dark:text-dark-text-muted group-hover:text-orange-500">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === 'active' && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8">
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2 px-1">
                <div className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest">Time Remaining</div>
                <div className={`text-4xl font-black tabular-nums ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-deep-charcoal dark:text-white'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${timeLeft < 30 ? 'bg-red-500' : 'bg-orange-500'}`}
                  style={{ width: `${100 - progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-white dark:bg-dark-surface p-8 rounded-[3rem] border-2 border-orange-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <span className="material-symbols-outlined text-9xl text-deep-charcoal dark:text-white">sports_score</span>
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    Target: {currentDrill.target}
                  </div>
                  <h2 className="text-3xl font-black text-deep-charcoal dark:text-white mb-4 tracking-tight leading-tight">{currentDrill.name}</h2>
                  <p className="text-base text-muted-text dark:text-dark-text-muted leading-relaxed font-medium mb-10">{currentDrill.description}</p>
                  
                  <button 
                    onClick={nextDrill}
                    className="w-full bg-orange-500 text-white font-black py-6 rounded-[2rem] text-xl shadow-xl shadow-orange-500/40 active:scale-[0.97] transition-all hover:bg-orange-600 flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                    COMPLETED
                  </button>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center gap-3">
                <div className="bg-white dark:bg-dark-surface px-6 py-3 rounded-full border border-soft-gray dark:border-dark-border flex items-center gap-3 shadow-sm">
                   <span className="text-[10px] font-bold text-muted-text dark:text-dark-text-muted uppercase tracking-widest">Score</span>
                   <span className="text-2xl font-black text-orange-500">{completedDrills}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'summary' && (
          <div className="flex-1 flex flex-col justify-center animate-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-dark-surface p-10 rounded-[3rem] border border-soft-gray dark:border-dark-border shadow-2xl text-center">
              <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-orange-500/30">
                <span className="material-symbols-outlined text-5xl">military_tech</span>
              </div>
              <h2 className="text-3xl font-black text-deep-charcoal dark:text-white mb-2 tracking-tight">Session Complete!</h2>
              <p className="text-muted-text dark:text-dark-text-muted mb-8 font-medium italic">"Great intensity. Focus on your follow-through next time."</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-gray-50 dark:bg-dark-bg p-6 rounded-3xl border border-soft-gray dark:border-dark-border">
                   <div className="text-3xl font-black text-deep-charcoal dark:text-white">{completedDrills}</div>
                   <div className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest">Drills Cleared</div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg p-6 rounded-3xl border border-soft-gray dark:border-dark-border">
                   <div className="text-3xl font-black text-deep-charcoal dark:text-white">{Math.round(completedDrills / (duration/60))}</div>
                   <div className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest">Drills / Min</div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setPhase('setup')}
                  className="btn-primary !rounded-[2rem] !bg-orange-500 hover:!bg-orange-600 !text-white"
                >
                  Start New Blitz
                </button>
                <button 
                  onClick={onBack}
                  className="w-full py-4 text-muted-text dark:text-dark-text-muted font-bold hover:text-deep-charcoal dark:hover:text-white transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SpeedSession;
