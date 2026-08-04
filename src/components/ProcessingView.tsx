import { Loader2, Layers, AlertCircle, X } from 'lucide-react';

interface ProcessingViewProps {
  progress: number;
  message: string;
  systemInfo?: string;
  onCancel?: () => void;
}

export function ProcessingView({ progress, message, systemInfo, onCancel }: ProcessingViewProps) {
  let currentFrames = 0;
  let totalFrames = 0;
  let hasFrames = false;
  
  if (systemInfo && systemInfo !== "Inativo") {
    // Tenta extrair os frames no formato "120/1200"
    const framesMatch = systemInfo.match(/(\d+)\/(\d+)/);
    if (framesMatch) {
      currentFrames = parseInt(framesMatch[1], 10);
      totalFrames = parseInt(framesMatch[2], 10);
      if (!isNaN(currentFrames) && !isNaN(totalFrames) && totalFrames > 0) {
        hasFrames = true;
      }
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-24 text-center">
      <div className="relative inline-flex items-center justify-center mb-8">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            className="text-zinc-800"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="58"
            cx="64"
            cy="64"
          />
          <circle
            className="text-indigo-500 transition-all duration-300 ease-out"
            strokeWidth="8"
            strokeDasharray={364.4}
            strokeDashoffset={364.4 - (364.4 * progress) / 100}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="58"
            cx="64"
            cy="64"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-indigo-400">
          <span className="text-3xl font-bold">{Math.round(progress)}%</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-3 text-zinc-300 mb-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        <h3 className="text-xl font-semibold tracking-tight">{message}</h3>
      </div>
      
      {hasFrames && (
        <div className="mt-8 max-w-sm mx-auto">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-zinc-400 flex items-center gap-2">
              <Layers className="w-4 h-4" /> 
              Frames Interpolados
            </span>
            <span className="text-indigo-400 font-medium">
              {currentFrames} / {totalFrames}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/50">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, (currentFrames / totalFrames) * 100))}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="mt-8 max-w-md mx-auto text-left bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-zinc-300 text-sm">
              Por favor, não feche esta janela enquanto a IA estiver processando. Este processo pode levar alguns minutos dependendo do tamanho do vídeo.
            </p>
          </div>
        </div>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-red-500/20"
        >
          <X className="w-4 h-4" />
          Cancelar Interpolação
        </button>
      )}
    </div>
  );
}
