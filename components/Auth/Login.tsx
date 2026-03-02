import React, { useState } from "react";
import type { AuthError } from "@supabase/supabase-js";
import Logo from "../Logo";
import { supabase } from "@/services/supabase";

interface LoginProps {
  onLogin: (email: string) => void | Promise<void>;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, onForgotPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const formatAuthError = (error: AuthError) => {
    const code = error.code ? `[${error.code}] ` : "";
    const message = error.message || "Authentication failed.";
    return `${code}${message}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const cleanEmail = email.trim();
    const cleanPassword = password; // do not trim passwords

    if (!cleanEmail || !cleanPassword) {
      setAuthError("Please enter your email and password.");
      return;
    }

    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        console.error("Supabase signInWithPassword error:", {
          code: error.code,
          status: error.status,
          name: error.name,
          message: error.message,
        });
        setAuthError(formatAuthError(error));
        return;
      }

      await onLogin(cleanEmail);
    } catch (err) {
      console.error("Unexpected login error:", err);
      setAuthError("Login failed due to an unexpected error.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="w-full px-8 py-6 flex flex-col h-full bg-white dark:bg-dark-bg animate-fade-in">
      <div className="flex-1 w-full flex flex-col justify-center items-center">
        <div className="mt-4 mb-6 flex flex-col items-center animate-slide-down">
          <div className="relative mb-1 hover:rotate-6 transition-transform">
            <Logo size="sm" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-deep-charcoal dark:text-white">Chalk</h1>
        </div>
        <div className="w-full max-w-sm text-center mb-4 animate-slide-up stagger-item-1">
          <h2 className="text-xl font-bold text-deep-charcoal dark:text-white mb-1">Ready to break?</h2>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 animate-slide-up stagger-item-2">
          <input
            className="input-field !py-3 !px-4"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              className="input-field !py-3 !px-4 !pr-12"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          <div className="flex justify-end pr-1">
            <button
              type="button"
              onClick={onForgotPassword}
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
            <p className="text-[10px] text-red-500 font-bold mt-2 px-1 animate-slide-down">{authError}</p>
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
