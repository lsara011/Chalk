
export type AppView = 'login' | 'signup' | 'reset-password' | 'dashboard' | 'ai-coach' | 'speed-session' | 'form-analysis' | 'settings' | 'progress' | 'profile';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface LeagueInfo {
  id: string;
  name: string;
  ratingLabel: string;
  rating: string;
}

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  location?: string;
  leagues?: LeagueInfo[];
  skillLevel?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
}

export interface PracticeRoutine {
  title: string;
  description: string;
  drills: Drill[];
}

export interface Drill {
  name: string;
  reps: string;
  instructions: string;
  imageUrl?: string;
}

interface LoginProps {
  onLogin: (email: string) => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}


export interface SpeedDrill {
  id: string;
  name: string;
  target: string;
  description: string;
}
