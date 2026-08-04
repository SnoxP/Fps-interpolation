import React, { useState, useEffect } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-200">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
          <LogIn className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Welcome to MotionAI</h1>
        <p className="text-zinc-400 mb-8 max-w-sm text-center">
          Sign in to interpolate your videos and save your processing history securely in the cloud.
        </p>
        <button
          onClick={handleLogin}
          className="bg-white text-zinc-950 px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return <>{children(user)}</>;
}
