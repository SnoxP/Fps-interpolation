import React, { useState, useEffect } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, Loader2, Mail, Lock } from 'lucide-react';

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Falha ao entrar com o Google');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Simplify Firebase error messages
      let message = err.message || 'Ocorreu um erro';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'Email ou senha inválidos';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Uma conta com este email já existe';
      } else if (err.code === 'auth/weak-password') {
        message = 'A senha deve ter pelo menos 6 caracteres';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Login com email/senha não está habilitado no Firebase.';
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
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
        <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl flex flex-col items-center shadow-xl">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
            <LogIn className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">MotionAI</h1>
          <p className="text-zinc-400 mb-8 text-center text-sm">
            {isLogin ? 'Entre na sua conta' : 'Crie uma conta para começar a interpolar'}
          </p>

          <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-6">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Endereço de email"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-200 placeholder:text-zinc-600 transition-colors"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-200 placeholder:text-zinc-600 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'Entrar' : 'Cadastrar'
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 w-full mb-6">
            <div className="h-px bg-zinc-800 flex-1"></div>
            <span className="text-xs text-zinc-500 uppercase font-medium">Ou continue com</span>
            <div className="h-px bg-zinc-800 flex-1"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors border border-zinc-700"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Google
          </button>
          
          <div className="mt-8 text-sm text-zinc-500 text-center">
            {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
            >
              {isLogin ? 'Cadastrar' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children(user)}</>;
}
