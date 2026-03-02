import React from "react";
import Logo from "../Logo";
import { User, AppView, UserProfile } from "../../types";

interface DashboardProps {
  user: User;
  userProfile: UserProfile | null;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  currentView: AppView;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  userProfile,
  onNavigate,
  onLogout,
  currentView,
}) => {
  const renderContent = () => {
    const firstName = userProfile?.firstName || user.firstName;
    return (
      <div className="animate-fade-in overflow-hidden">
        <div className="mb-6 animate-slide-down">
          <h2 className="text-xl font-bold text-deep-charcoal dark:text-white">
            Hi, {firstName}!
          </h2>
          <p className="text-xs text-muted-tt dark:text-dark-text-muted">
            Ready for today's session?
          </p>
        </div>

        <section className="flex-1 flex flex-col pb-6">
          <h3 className="text-[11px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest px-1 animate-fade-in stagger-item-3">
            Training Tools
          </h3>

          <div className="mt-4 grid flex-1 grid-rows-3 gap-4">
            <button
              onClick={() => onNavigate("ai-coach")}
              className="flex-1 min-h-[200px] w-full group bg-white dark:bg-dark-surface p-4 rounded-[1.75rem] border border-soft-gray dark:border-dark-border shadow-sm hover:shadow-lg transition-all active:scale-[0.97] text-left overflow-hidden flex items-center animate-slide-up stagger-item-3"
            >
              <div className="w-20 h-20 bg-chalk-blue rounded-[1.5rem] flex items-center justify-center text-deep-charcoal group-hover:bg-chalk-blue-dark flex-shrink-0 transition-colors">
                <span className="material-symbols-outlined text-4xl group-hover:rotate-12 transition-transform">
                  psychology
                </span>
              </div>

              <div className="px-5 flex-1 space-y-1">
                <div className="font-bold text-base text-deep-charcoal dark:text-white">
                  AI Coach
                </div>
                <p className="text-xs leading-relaxed text-muted-text dark:text-dark-text-muted line-clamp-10">
                  Personalized training drills and practice routines generated
                  by AI to target weaknesses and accelerate improvement.
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate("speed-session")}
              className="flex-1 h-full w-full group bg-white dark:bg-dark-surface p-4 rounded-[1.75rem] border border-soft-gray dark:border-dark-border shadow-sm hover:shadow-lg transition-all active:scale-[0.97] text-left overflow-hidden flex items-center animate-slide-up stagger-item-4"
            >
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/10 rounded-[1.5rem] flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">
                  timer
                </span>
              </div>

              <div className="px-5 flex-1 space-y-1">
                <div className="font-bold text-base text-deep-charcoal dark:text-white">
                  Speed Session
                </div>
                <p className="text-xs leading-relaxed text-muted-text dark:text-dark-text-muted line-clamp-10">
                  Run timed practice sessions to build rhythm, focus, and
                  consistency under realistic match conditions.
                </p>
              </div>
            </button>

            {/* Form Analysis */}
            <button
              onClick={() => onNavigate("form-analysis")}
              className="flex-1 h-full w-full group bg-white dark:bg-dark-surface p-4 rounded-[1.75rem] border border-soft-gray dark:border-dark-border shadow-sm hover:shadow-lg transition-all active:scale-[0.97] text-left overflow-hidden flex items-center animate-slide-up stagger-item-5"
            >
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/10 rounded-[1.5rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <span className="material-symbols-outlined text-4xl group-hover:-translate-y-1 transition-transform">
                  videocam
                </span>
              </div>

              <div className="px-5 flex-1 space-y-1">
                <div className="font-bold text-base text-deep-charcoal dark:text-white">
                  Form Analysis
                </div>
                <p className="text-xs leading-relaxed text-muted-text dark:text-dark-text-muted line-clamp-10">
                  Record your technique and receive structured feedback to
                  refine mechanics and eliminate bad habits.
                </p>
              </div>
            </button>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-off-white dark:bg-dark-bg overflow-hidden transition-colors">
      <main className="px-6 py-5 flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </main>

      <nav className=" px-10 py-4 flex justify-end items-center flex-shrink-0 animate-slide-up shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        {[{ id: "settings", icon: "tune" }].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as AppView)}
            className={`transition-all active:scale-75 ${
              currentView === item.id
                ? "text-chalk-blue-dark scale-110"
                : "text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white"
            }`}
          >
            <span
              className={`material-symbols-outlined text-2xl ${
                currentView === item.id ? "fill-1" : ""
              }`}
            >
              {item.icon}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Dashboard;
