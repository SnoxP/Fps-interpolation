import { Loader2, Layers, AlertCircle, X, CheckCircle2, RotateCcw, Download } from 'lucide-react';
import { VideoTask } from '../types';


interface BatchProcessingViewProps {
  tasks: VideoTask[];
  onCancelAll: () => void;
  onRetry: (id: string) => void;
  onReset: () => void;
}

export function BatchProcessingView({ tasks, onCancelAll, onRetry, onReset }: BatchProcessingViewProps) {
  const allDone = tasks.every(t => t.status === 'done' || t.status === 'error');
  const someProcessing = tasks.some(t => t.status === 'processing');

  const handleDownload = (resultUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `interpolated_${fileName.replace(/\.[^/.]+$/, "")}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      {allDone ? (
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-2">Processamento Concluído</h2>
          <p className="text-zinc-400 text-lg">Todos os vídeos foram processados.</p>
        </div>
      ) : (
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight mb-2">Processando Lote</h2>
          <p className="text-zinc-400">Por favor, não feche esta janela.</p>
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-medium text-zinc-200 truncate">{task.file.name}</span>
                <div className="shrink-0">
                  {task.status === 'pending' && <span className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-800 text-zinc-400">Pendente</span>}
                  {task.status === 'processing' && <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400">Processando</span>}
                  {task.status === 'done' && <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400">Concluído</span>}
                  {task.status === 'error' && <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400">Erro</span>}
                </div>
              </div>
              
              <div className="shrink-0 flex items-center justify-end">
                {task.status === 'error' && (
                  <button
                    onClick={() => onRetry(task.id)}
                    className="text-xs font-medium text-red-400 hover:text-red-300 underline"
                  >
                    Tentar Novamente
                  </button>
                )}
                {task.status === 'done' && task.resultUrl && (
                  <button
                    onClick={() => handleDownload(task.resultUrl!, task.file.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    Baixar
                  </button>
                )}
              </div>
            </div>
            
            {task.status === 'processing' && (
               <div className="mt-4 border-t border-zinc-800/50 pt-4">
                 <div className="flex justify-between items-center text-sm mb-2">
                   <div className="flex items-center gap-2 text-zinc-300">
                     <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                     {task.message}
                   </div>
                   <span className="text-indigo-400 font-medium">{Math.round(task.progress)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/50">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                      style={{ width: `${task.progress}%` }}
                    />
                 </div>
                 {task.systemInfo && task.systemInfo !== 'Inativo' && (
                   <p className="text-xs text-zinc-500 mt-2 text-right">Frames: {task.systemInfo}</p>
                 )}
               </div>
            )}
            
            {task.status === 'error' && task.errorMessage && (
              <div className="mt-2 text-xs text-red-400/80 p-2 bg-red-500/10 rounded-lg">
                {task.errorMessage}
              </div>
            )}
            
            {task.status === 'done' && task.resultUrl && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
                  <video src={URL.createObjectURL(task.file)} controls className="w-full h-full object-contain" />
                </div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden border border-indigo-500/30">
                  <video src={task.resultUrl} controls className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8 gap-4">
        {!allDone && someProcessing && (
          <button
            onClick={onCancelAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-red-500/20"
          >
            <X className="w-4 h-4" />
            Cancelar Processamento
          </button>
        )}
        
        {allDone && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Processar Mais Vídeos
          </button>
        )}
      </div>
    </div>
  );
}
