
import React, { useState } from 'react';
import Logo from '../Logo';

interface LoginProps {
  onLogin: (email: string) => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  return (
    <main className="w-full px-8 py-6 flex flex-col items-center h-full overflow-hidden bg-white dark:bg-dark-bg animate-fade-in">
      <div className="mt-4 mb-6 flex flex-col items-center animate-slide-down">
        <div className="relative mb-4 hover:rotate-6 transition-transform">
          <Logo size="sm" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-deep-charcoal dark:text-white">Chalk</h1>
      </div>

      <div className="w-full mb-6 text-center animate-slide-up stagger-item-1">
        <h2 className="text-xl font-bold text-deep-charcoal dark:text-white mb-1">Ready to break?</h2>
        <p className="text-sm text-muted-text dark:text-dark-text-muted">Welcome back to Chalk.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3 flex-shrink-0 animate-slide-up stagger-item-2">
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
          <button type="button" className="text-[11px] font-semibold text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white transition-colors">
            Forgot Password?
          </button>
        </div>

        <button type="submit" className="btn-primary !py-3 mt-2 hover:scale-[1.02] active:scale-95">
          Sign In
        </button>

        <div className="flex items-center justify-center pt-2">
          <div className="flex -space-x-1.5 mr-3">
            {[1, 2, 3].map((i) => (
              <img 
                key={i}
                src={`https://picsum.photos/seed/${i + 10}/100`} 
                className="w-5 h-5 rounded-full border border-white dark:border-dark-border bg-gray-200 hover:scale-110 transition-transform cursor-pointer"
                alt="User"
              />
            ))}
          </div>
          <p className="text-[11px] font-medium text-muted-text dark:text-dark-text-muted">Join 50k+ players</p>
        </div>
      </form>

      <div className="w-full mt-auto mb-4 animate-slide-up stagger-item-3">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-soft-gray dark:border-dark-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-white dark:bg-dark-bg px-3 text-muted-text dark:text-dark-text-muted">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary !py-2.5 hover:scale-[1.02] active:scale-95">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-xs">Google</span>
          </button>
          <button className="btn-secondary !py-2.5 hover:scale-[1.02] active:scale-95">
            <svg className="w-4 h-4 mr-2 text-deep-charcoal dark:text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.96.95-2.04 1.72-3.23 1.72-1.16 0-1.54-.71-2.94-.71-1.41 0-1.84.7-2.95.71-1.19 0-2.31-.83-3.29-1.78-1.98-1.91-3.41-5.38-3.41-8.39 0-2.99 1.51-4.72 3.12-4.72 1.01 0 1.83.6 2.62.6.79 0 1.83-.65 3.01-.65 1.13 0 2.21.46 3.01 1.34-2.84 1.34-2.38 5.48.51 6.81-.72 1.84-1.63 3.44-2.26 4.07zM12.03 7.25c-.23-2.03 1.55-3.87 3.34-3.87.24 2.16-1.87 4.03-3.34 3.87z"></path>
            </svg>
            <span className="text-xs">Apple</span>
          </button>
        </div>

        <footer className="mt-6 text-center">
          <p className="text-xs text-muted-text dark:text-dark-text-muted">
            New to the club? 
            <button onClick={onSwitchToSignup} className="ml-1 text-chalk-blue-dark font-bold hover:underline transition-all active:scale-95 inline-block">Sign Up</button>
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Login;
