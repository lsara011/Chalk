import React, { useState, useEffect, useRef } from "react";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import AICoach from "./components/Dashboard/AICoach";
import SpeedSession from "./components/Dashboard/SpeedSession";
import FormAnalysis from "./components/Dashboard/FormAnalysis";
import Settings from "./components/Dashboard/Settings";
import ResetPassword from "./components/Dashboard/ResetPassword";
import { AppView, User, ThemeMode, LeagueInfo, UserProfile } from "./types";
import { supabase } from "./services/supabase";

const USER_CACHE_KEY = "chalk-user-cache-v1";

const App: React.FC = () => {
  const IDLE_TIMEOUT_MINUTES = Number(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES ?? 30);
  const IDLE_TIMEOUT_MS =
    Number.isFinite(IDLE_TIMEOUT_MINUTES) && IDLE_TIMEOUT_MINUTES > 0
      ? IDLE_TIMEOUT_MINUTES * 60 * 1000
      : 30 * 60 * 1000;

  const [view, setView] = useState<AppView>("login");
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme-mode") as ThemeMode) || "auto";
  });
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCachedUser = (): User | null => {
    try {
      const raw = localStorage.getItem(USER_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as User;
      if (!parsed?.email) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const getAuthUserFromSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user ?? null;
  };

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === "dark") {
        isDark = true;
      } else if (themeMode === "auto") {
        const hour = new Date().getHours();
        isDark = hour >= 18 || hour < 6;
      }

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme-mode", themeMode);
    };

    applyTheme();
    const interval = setInterval(applyTheme, 60000);
    return () => clearInterval(interval);
  }, [themeMode]);

  const hydrateUserFromSession = async () => {
    const authUser = await getAuthUserFromSession();
    if (!authUser) throw new Error("No auth user in session");

    // Move user to app immediately after auth, preserving any existing cached values.
    setUser((prev) => ({
      email: authUser.email ?? prev?.email ?? "",
      firstName: prev?.firstName ?? "",
      lastName: prev?.lastName ?? "",
      location: prev?.location ?? "",
      skillLevel: prev?.skillLevel ?? "Novice",
      leagues: prev?.leagues ?? [],
    }));
    setView("dashboard");

    const [profileRes, locRes, ratingsRes] = await Promise.all([
      supabase
        .from("user_profile")
        .select("first_name, last_name")
        .eq("user_id", authUser.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("locations")
        .select("city, state, country, is_international")
        .eq("user_id", authUser.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("user_league_ratings")
        .select("apa_8ball_sl, apa_9ball_sl, fargo, vnea, usapl, tap")
        .eq("user_id", authUser.id)
        .limit(1)
        .maybeSingle(),
    ]);

    if (profileRes.error) console.warn("Profile hydrate warning:", profileRes.error.message);
    if (locRes.error) console.warn("Location hydrate warning:", locRes.error.message);
    if (ratingsRes.error) console.warn("Ratings hydrate warning:", ratingsRes.error.message);

    const profile = profileRes.data;
    const loc = locRes.data;
    const ratings = ratingsRes.data;

    const locationString = loc
      ? `${loc.city}, ${loc.state}${loc.is_international ? `, ${loc.country}` : ""}`
      : "";

    const leagues: LeagueInfo[] = [];

    if (ratings?.apa_8ball_sl != null || ratings?.apa_9ball_sl != null) {
      leagues.push({
        id: "apa",
        name: "APA",
        ratingLabel: "SL",
        rating: `8-Ball: ${ratings?.apa_8ball_sl ?? "-"}, 9-Ball: ${ratings?.apa_9ball_sl ?? "-"}`,
      });
    }
    if (ratings?.fargo != null) {
      leagues.push({ id: "bca", name: "BCA", ratingLabel: "FargoRate", rating: String(ratings.fargo) });
    }
    if (ratings?.usapl != null) {
      leagues.push({ id: "usapl", name: "USAPL", ratingLabel: "FargoRate", rating: String(ratings.usapl) });
    }
    if (ratings?.vnea != null) {
      leagues.push({ id: "vnea", name: "VNEA", ratingLabel: "Skill Level", rating: String(ratings.vnea) });
    }
    if (ratings?.tap != null) {
      leagues.push({ id: "tap", name: "TAP", ratingLabel: "Rating", rating: String(ratings.tap) });
    }

    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        firstName: profile?.first_name ?? prev.firstName,
        lastName: profile?.last_name ?? prev.lastName,
        location: locationString || prev.location,
        leagues: leagues.length ? leagues : prev.leagues,
      };
    });
    setUserProfile(
      profile
        ? {
            firstName: profile.first_name ?? "",
            lastName: profile.last_name ?? "",
          }
        : null
    );
  };

  useEffect(() => {
    let active = true;

    const bootstrapSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (session) {
        const cached = loadCachedUser();
        if (cached) {
          setUser(cached);
          setView("dashboard");
        }

        try {
          await hydrateUserFromSession();
        } catch (err) {
          console.error("Session hydrate failed:", err);
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();
          if (!currentSession) {
            setUser(null);
            setView("login");
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setView("login");
        localStorage.removeItem(USER_CACHE_KEY);
      }
    };

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Keep auth callback non-blocking; run async work outside callback.
        setTimeout(() => {
          hydrateUserFromSession().catch((err) => {
            console.error("Auth state hydrate failed:", err);
          });
        }, 0);
      } else {
        setUser(null);
        setUserProfile(null);
        setView("login");
        localStorage.removeItem(USER_CACHE_KEY);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (_email: string) => {
    try {
      const sessionUser = await getAuthUserFromSession();
      if (sessionUser) {
        setUser((prev) => ({
          email: sessionUser.email ?? prev?.email ?? "",
          firstName: prev?.firstName ?? "",
          lastName: prev?.lastName ?? "",
          location: prev?.location ?? "",
          skillLevel: prev?.skillLevel ?? "Novice",
          leagues: prev?.leagues ?? [],
        }));
        setView("dashboard");
      }

      
      // Do not block UI transition on profile hydration.
      void hydrateUserFromSession();
    } catch (err) {
      console.error("Login hydrate failed:", err);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser((prev) => ({
          email: session.user.email ?? prev?.email ?? "",
          firstName: prev?.firstName ?? "",
          lastName: prev?.lastName ?? "",
          location: prev?.location ?? "",
          skillLevel: prev?.skillLevel ?? "Novice",
          leagues: prev?.leagues ?? [],
        }));
        setView("dashboard");
      }
    }
  };

  const handleSignupComplete = async () => {
    try {
      await hydrateUserFromSession();
    } catch (err) {
      console.error("Signup hydrate failed:", err);
    }
  };

  const handlePasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password", // change for prod
    });

    if (error) {
      console.error(error);
    }
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setView("login");
    localStorage.removeItem(USER_CACHE_KEY);
  };

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        supabase.auth.signOut().catch((err) => {
          console.error("Idle timeout sign out failed:", err);
          setUser(null);
          setView("login");
        });
      }, IDLE_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, resetIdleTimer));
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [user, IDLE_TIMEOUT_MS]);

  const renderView = () => {
    switch (view) {
      case "login":
        return (
          <Login
            onLogin={handleLogin}
            onSwitchToSignup={() => setView("signup")}
            onForgotPassword={() => setView("reset-password")}
          />
        );
      case "signup":
        return <Signup onSignupComplete={handleSignupComplete} onSwitchToLogin={() => setView("login")} />;
      case "reset-password":
        return <ResetPassword onBackToLogin={() => setView("login")} onSubmit={handlePasswordReset} />;
      case "dashboard":
      case "progress":
      case "profile":
        return (
          <Dashboard
            currentView={view}
            user={user!}
            userProfile={userProfile}
            onNavigate={(v) => setView(v)}
            onLogout={handleLogout}
          />
        );
      case "ai-coach":
        return <AICoach onBack={() => setView("dashboard")} />;
      case "speed-session":
        return <SpeedSession onBack={() => setView("dashboard")} />;
      case "form-analysis":
        return <FormAnalysis onBack={() => setView("dashboard")} />;
      case "settings":
        return (
          <Settings
            user={user!}
            onUpdateUser={handleUpdateUser}
            themeMode={themeMode}
            onThemeChange={setThemeMode}
            onBack={() => setView("dashboard")}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <Login
            onLogin={handleLogin}
            onSwitchToSignup={() => setView("signup")}
            onForgotPassword={() => setView("reset-password")}
          />
        );
    }
  };

  console.log("Dashboard userProfile", userProfile);
console.log("Dashboard user", user);


  return (
    <div className="h-[100dvh] w-full flex flex-col items-center bg-off-white dark:bg-dark-bg overflow-hidden transition-colors">
      <div className="w-full max-w-md h-full flex flex-col relative bg-white dark:bg-dark-bg shadow-2xl overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
};

export default App;
