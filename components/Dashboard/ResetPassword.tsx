import React, { useState } from "react";
import Logo from "../Logo";

type ResetPasswordProps = {
  onBackToLogin: () => void;
  onSubmit: (email: string) => Promise<void>;
};

const ResetPassword: React.FC<ResetPasswordProps> = ({
  onBackToLogin,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(cleanEmail);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full px-8 py-6 flex flex-col h-full bg-white dark:bg-dark-bg animate-fade-in">
      

      {/* Back */}
      <div className="mb-4">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center text-chalk-blue-dark font-bold hover:underline"
        >
          <span className="material-symbols-outlined mr-1">chevron_left</span>
          Back to Login
        </button>
      </div>

      {/* Content */}
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-deep-charcoal dark:text-white mb-1">
            Reset Your Password
          </h2>
          <p className="text-sm text-muted-text dark:text-dark-text-muted">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input-field !py-3 !px-4"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg("");
              if (success) setSuccess(false);
            }}
            required
          />

          {errorMsg && (
            <p className="text-[11px] text-red-500 font-bold">{errorMsg}</p>
          )}

          {success && (
            <p className="text-[11px] text-green-600 font-bold">
              Reset link sent! Check your email.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary !py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-auto mb-4 text-center">
        <p className="text-xs text-muted-text dark:text-dark-text-muted">
          Still need help?
          <button className="ml-1 text-chalk-blue-dark font-bold hover:underline">
            Contact Support
          </button>
        </p>
      </footer>
    </main>
  );
};

export default ResetPassword;
