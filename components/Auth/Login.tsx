import React, { useState } from "react";
import Logo from "../Logo";
import { supabase } from "@/services/supabase";

interface LoginProps {
  onLogin: (email: string) => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const cleanEmail = email.trim();
    const cleanPassword = password; // don't trim passwords

    if (!cleanEmail || !cleanPassword) {
      setAuthError("Please enter your email and password.");
      return;
    }

    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        // common messages you’ll see: "Invalid login credentials"
        const msg = error.message.toLowerCase().includes("invalid login")
          ? "Incorrect email or password."
          : error.message;

        setAuthError(msg);
        return;
      }

      // ✅ logged in (data.session + data.user are available)
      onLogin(cleanEmail);
    } catch (err) {
      console.error(err);
      setAuthError("Login failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="w-full px-8 py-6 flex flex-col h-full bg-white dark:bg-dark-bg animate-fade-in">
      {/* ✅ Center */}
      <div className="flex-1 w-full flex flex-col justify-center items-center">
        <div className="mt-4 mb-6 flex flex-col items-center animate-slide-down">
          <div className="relative mb-4 hover:rotate-6 transition-transform">
            <Logo size="sm" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-deep-charcoal dark:text-white">
            Chalk
          </h1>
        </div>
        <div className="w-full max-w-sm text-center mb-4 animate-slide-up stagger-item-1">
          <h2 className="text-xl font-bold text-deep-charcoal dark:text-white mb-1">
            Ready to break?
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-3 animate-slide-up stagger-item-2"
        >
          <input
            className="input-field !py-3 !px-4"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input-field !py-3 !px-4"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end pr-1">
            <button
              type="button"
              className="text-[11px] font-semibold text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="btn-primary !py-3 mt-2 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {authLoading ? "Signing in..." : "Sign In"}
          </button>
          {authError && (
            <p className="text-[10px] text-red-500 font-bold mt-2 px-1 animate-slide-down">
              {authError}
            </p>
          )}

          <div className="w-full mt-auto mb-4 animate-slide-up stagger-item-3">
            <footer className="mt-6 text-center">
              <p className="text-xs text-muted-text dark:text-dark-text-muted">
                New to the club?
                <button
                  onClick={onSwitchToSignup}
                  className="ml-1 text-chalk-blue-dark font-bold hover:underline transition-all active:scale-95 inline-block"
                >
                  Sign Up
                </button>
              </p>
            </footer>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Login;
