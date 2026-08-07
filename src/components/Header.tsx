import { useState } from 'react';
import { Zap, LogOut, Menu, X, Clock, Code, Copy, Check, Download } from 'lucide-react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { HistoryPanel } from './HistoryPanel';
import { colabScriptContent } from '../lib/colabScript';

interface HeaderProps {
  user?: User;
}

export function Header({ user }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(colabScriptContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleDownloadColab = () => {
    const blob = new Blob([colabScriptContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colab_motionai.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <button 
            onClick={() => setIsScriptModalOpen(true)}
            className="flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors"
            title="Ver Script do Colab"
          >
            <Code className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Script Colab</span>
          </button>
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
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsScriptModalOpen(true);
                }}
                className="flex items-center justify-center w-full gap-2 py-3 mb-6 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-colors font-medium text-sm"
              >
                <Code className="w-4 h-4" />
                Ver Script do Colab
              </button>
              
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
      {/* Script Modal */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsScriptModalOpen(false)}
          />
          <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Code className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">Script do Google Colab</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Execute este código em um notebook para usar como servidor.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsScriptModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-zinc-950/50">
              <pre className="text-xs sm:text-sm text-zinc-300 font-mono bg-black/50 p-4 rounded-xl overflow-x-auto border border-zinc-800/50">
                <code>{colabScriptContent}</code>
              </pre>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={handleDownloadColab}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Baixar Arquivo
              </button>
              <button
                onClick={handleCopyScript}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar Script'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
