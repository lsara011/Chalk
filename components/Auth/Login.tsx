import React, { useEffect, useRef, useState } from "react";
import type { AuthError } from "@supabase/supabase-js";
import Logo from "../Logo";
import { supabase } from "@/services/supabase";

const PENDING_SIGNUP_STORE_ID = "chalk-pending-signup-v1";

interface PendingSignupData {
  email: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

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
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
      toastTimerRef.current = null;
    }, 4500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const formatAuthError = (error: AuthError) => {
    const message = error.message || "Authentication failed.";
    const lower = message.toLowerCase();
    if (lower.includes("email not confirmed") || lower.includes("email not verified")) {
      showToast("Verify your email before signing in.");
      return "Please verify your email first, then sign in.";
    }
    const code = error.code ? `[${error.code}] ` : "";
    return `${code}${message}`;
  };

  const completePendingSignupIfAny = async (cleanEmail: string) => {
    const raw = localStorage.getItem(PENDING_SIGNUP_STORE_ID);
    if (!raw) return;

    try {
      const pending = JSON.parse(raw) as PendingSignupData;
      if (!pending?.email || !pending?.payload) return;
      if (pending.email !== cleanEmail.toLowerCase()) return;

      const { error } = await supabase.rpc("complete_signup", pending.payload);
      if (!error) {
        localStorage.removeItem(PENDING_SIGNUP_STORE_ID);
      } else {
        console.error("Pending signup completion failed:", error);
      }
    } catch (err) {
      console.error("Pending signup parse failed:", err);
    }
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

      await completePendingSignupIfAny(cleanEmail);
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
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-deep-charcoal text-white text-xs font-semibold shadow-lg animate-slide-down">
          {toastMessage}
        </div>
      )}
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
