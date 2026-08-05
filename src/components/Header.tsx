import { useState } from 'react';
import { Zap, LogOut, Menu, X, Clock } from 'lucide-react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { HistoryPanel } from './HistoryPanel';

interface HeaderProps {
  user?: User;
}

export function Header({ user }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <>
      <header className="flex items-center justify-between py-6 px-8 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-zinc-100">MotionAI</span>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-zinc-400">
          <a href="#" className="hidden sm:block hover:text-zinc-100 transition-colors">Documentação</a>
          {user && (
            <div className="flex items-center gap-4 sm:ml-4 sm:pl-4 sm:border-l border-zinc-800">
              <span className="hidden sm:inline text-zinc-300">{user.displayName || user.email}</span>
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                title="Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsDrawerOpen(false)} 
          />
          <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 p-6 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-medium text-white tracking-tight">Vídeos Salvos</h2>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)} 
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {user && (
              <div className="flex-1">
                <HistoryPanel user={user} isDrawer={true} />
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-zinc-800/50 sm:hidden">
              <div className="mb-4 text-sm text-zinc-400 truncate px-2">
                Logado como: <span className="text-zinc-200">{user?.displayName || user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center w-full gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
