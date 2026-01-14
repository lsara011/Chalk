
import React, { useState, useEffect } from 'react';
import { generateRoutine, generateDrillImage } from '../../services/geminiService';
import { PracticeRoutine, Drill } from '../../types';
import MarkdownText from '../MarkdownText';

interface AICoachProps {
  onBack: () => void;
}

const AICoach: React.FC<AICoachProps> = ({ onBack }) => {
  const [focusArea, setFocusArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState<PracticeRoutine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drillImages, setDrillImages] = useState<Record<number, string>>({});

  const handleGenerate = async () => {
    if (!focusArea) return;
    setLoading(true);
    setError(null);
    setRoutine(null);
    setDrillImages({});
    
    try {
      const result = await generateRoutine(focusArea);
      setRoutine(result);
      
      // Start generating images for each drill asynchronously
      result.drills.forEach((drill, index) => {
        fetchImage(drill, index);
      });
      
    } catch (err) {
      setError("AI is currently chalking its cue. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const fetchImage = async (drill: Drill, index: number) => {
    try {
      const imageUrl = await generateDrillImage(drill.name, drill.instructions);
      setDrillImages(prev => ({ ...prev, [index]: imageUrl }));
    } catch (e) {
      console.error("Failed to generate image for drill", index, e);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-off-white dark:bg-dark-bg overflow-hidden transition-colors animate-fade-in">
      <header className="px-6 py-4 flex items-center gap-4 bg-white dark:bg-dark-surface border-b border-soft-gray dark:border-dark-border flex-shrink-0 animate-slide-down">
        <button 
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white dark:bg-dark-bg border border-soft-gray dark:border-dark-border flex items-center justify-center text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white transition-all hover:scale-110 active:scale-90 shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        <h1 className="text-lg font-extrabold text-deep-charcoal dark:text-white tracking-tight">AI Coach</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">
        {!routine ? (
          <div className="space-y-5 h-full flex flex-col animate-fade-in">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-[2.5rem] border border-soft-gray dark:border-dark-border shadow-sm animate-zoom-in">
              <div className="w-12 h-12 bg-chalk-blue/20 text-chalk-blue-dark rounded-xl flex items-center justify-center mb-4 shadow-inner animate-bounce-subtle">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <h2 className="text-xl font-bold mb-1 tracking-tight text-deep-charcoal dark:text-white">What's your focus?</h2>
              <p className="text-xs text-muted-text dark:text-dark-text-muted mb-6 leading-relaxed">Gemini will build a custom routine with visual diagrams for your specific training needs.</p>
              
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="e.g. Draw shots from the rail"
                  className="input-field !rounded-2xl !py-3 !px-4 !text-sm animate-slide-up stagger-item-1"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  disabled={loading}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={loading || !focusArea}
                  className={`btn-primary flex items-center justify-center gap-2 !rounded-2xl h-14 animate-slide-up stagger-item-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-deep-charcoal/30 border-t-deep-charcoal rounded-full animate-spin"></div>
                      <span className="text-sm">Analyzing Table...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">analytics</span>
                      <span className="text-sm">Generate Routine</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-red-600 text-xs font-medium flex items-center gap-2 animate-zoom-in">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-auto pb-4 animate-slide-up stagger-item-3">
              {['Position Play', 'Potting Accuracy', 'Break Strategy', 'Safe Play'].map((tag, i) => (
                <button 
                  key={tag}
                  onClick={() => setFocusArea(tag)}
                  className={`bg-white dark:bg-dark-surface px-3 py-3 rounded-2xl border border-soft-gray dark:border-dark-border text-[11px] font-bold text-muted-text dark:text-dark-text-muted hover:border-chalk-blue hover:text-deep-charcoal dark:hover:text-white transition-all text-center shadow-sm active:scale-95 animate-zoom-in stagger-item-${i+1}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in pb-10">
            <div className="bg-deep-charcoal dark:bg-black p-6 rounded-[2.5rem] text-off-white shadow-xl animate-slide-up">
              <div className="flex items-center gap-2 text-chalk-blue mb-2">
                <span className="material-symbols-outlined text-[10px] animate-pulse">verified</span>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.2em]">AI Routine</span>
              </div>
              <h2 className="text-xl font-extrabold mb-2 tracking-tight">{routine.title}</h2>
              <div className="text-xs font-medium opacity-70 leading-relaxed">
                <MarkdownText content={routine.description} className="prose-invert text-white/60" />
              </div>
            </div>

            <div className="space-y-6">
              {routine.drills.map((drill, idx) => (
                <div key={idx} className={`bg-white dark:bg-dark-surface rounded-[2.5rem] border border-soft-gray dark:border-dark-border shadow-sm overflow-hidden group animate-slide-up stagger-item-${idx+1}`}>
                  <div className="aspect-[16/9] w-full bg-gray-100 dark:bg-dark-bg relative">
                    {drillImages[idx] ? (
                      <img 
                        src={drillImages[idx]} 
                        alt={drill.name} 
                        className="w-full h-full object-cover animate-fade-in duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                        <div className="w-8 h-8 border-3 border-chalk-blue/20 border-t-chalk-blue rounded-full animate-spin"></div>
                        <p className="text-[9px] font-bold text-muted-text dark:text-dark-text-muted uppercase tracking-wider">Visualizing...</p>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 w-9 h-9 rounded-2xl bg-white/90 dark:bg-black/90 backdrop-blur flex items-center justify-center text-xs font-black border border-white dark:border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-base font-extrabold tracking-tight text-deep-charcoal dark:text-white group-hover:translate-x-1 transition-transform">{drill.name}</h4>
                      <span className="text-[9px] font-extrabold bg-chalk-blue text-deep-charcoal px-2 py-1 rounded-lg uppercase tracking-wider animate-pulse">
                        {drill.reps}
                      </span>
                    </div>
                    <div className="text-xs leading-relaxed text-muted-text dark:text-dark-text-muted">
                       <MarkdownText content={drill.instructions} />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => setRoutine(null)}
                className="w-full bg-white dark:bg-dark-surface border border-soft-gray dark:border-dark-border text-deep-charcoal dark:text-white text-sm font-bold py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-black/20 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 animate-slide-up stagger-item-4"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                New Session
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AICoach;
