import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Clock, Film, Video, Download, Trash2 } from 'lucide-react';

interface HistoryPanelProps {
  user: User;
  isDrawer?: boolean;
}

interface VideoHistory {
  id: string;
  fileName: string;
  fps: number;
  videoUrl?: string;
  createdAt: any;
}

export function HistoryPanel({ user, isDrawer }: HistoryPanelProps) {
  const [history, setHistory] = useState<VideoHistory[]>([]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este vídeo do histórico?')) {
      try {
        await deleteDoc(doc(db, 'videos', id));
      } catch (err) {
        console.error('Falha ao excluir o vídeo', err);
        alert('Falha ao excluir o vídeo.');
      }
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'videos'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VideoHistory[];
      
      // Sort manually by createdAt (descending)
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      
      setHistory(data);
    });

    return () => unsubscribe();
  }, [user.uid]);

  if (history.length === 0) {
    return (
      <div className={`w-full ${!isDrawer ? 'max-w-2xl mx-auto mt-12 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6' : 'flex flex-col items-center justify-center h-48 text-center'}`}>
        {!isDrawer && (
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Histórico de Interpolação</h3>
          </div>
        )}
        <p className="text-sm text-zinc-400">
          Nenhum vídeo processado ainda.
        </p>
      </div>
    );
  }

  const containerClasses = isDrawer
    ? "w-full"
    : "w-full max-w-2xl mx-auto mt-12 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6";

  return (
    <div className={containerClasses}>
      {!isDrawer && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Histórico de Interpolação</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            Seus vídeos processados são salvos com segurança na nuvem (usando Catbox) e estarão disponíveis em todos os seus dispositivos.
          </p>
        </>
      )}
      
      <div className="space-y-3">
        {history.map(video => (
          <div key={video.id} className={`flex items-center justify-between p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 ${isDrawer ? 'flex-col sm:flex-row gap-4 items-start sm:items-center' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <Film className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-zinc-200 truncate">{video.fileName}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {video.fps} FPS</span>
                  <span>•</span>
                  <span>{video.createdAt?.toDate().toLocaleDateString()} {video.createdAt?.toDate().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${isDrawer ? 'w-full sm:w-auto mt-2 sm:mt-0' : ''}`}>
              {video.videoUrl === 'error' ? (
                <div className={`px-3 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20 text-center ${isDrawer ? 'w-full sm:w-auto' : ''}`}>
                  Erro ao salvar
                </div>
              ) : video.videoUrl ? (
                <a 
                  href={video.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 text-sm font-medium rounded-lg transition-colors ${isDrawer ? 'w-full sm:w-auto' : ''}`}
                >
                  <Download className="w-4 h-4" />
                  Ver Vídeo
                </a>
              ) : (
                <div className={`px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20 text-center ${isDrawer ? 'w-full sm:w-auto' : ''}`}>
                  Salvando...
                </div>
              )}
              
              <button 
                onClick={() => handleDelete(video.id)}
                className={`flex items-center justify-center p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ${isDrawer ? 'w-full sm:w-auto' : ''}`}
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
                {isDrawer && <span className="ml-2 sm:hidden">Excluir</span>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
