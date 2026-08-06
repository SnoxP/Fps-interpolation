import { Settings2, Play, AlertCircle, Link } from 'lucide-react';
import { useState } from 'react';

interface ConfigPanelProps {
  file: File;
  onStart: (fps: number, apiUrl: string) => void;
  onCancel: () => void;
}

export function ConfigPanel({ file, onStart, onCancel }: ConfigPanelProps) {
  const [fps, setFps] = useState<number>(60);
  const [apiUrl, setApiUrl] = useState<string>('https://adena-dangerless-infrequently.ngrok-free.dev/interpolate');

  const fpsOptions = [
    { value: 30, label: '30 FPS', desc: 'Padrão' },
    { value: 60, label: '60 FPS', desc: 'Suave' },
    { value: 120, label: '120 FPS', desc: 'Ultra Fluído' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-16 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-zinc-800">
        <Settings2 className="w-6 h-6 text-indigo-400 shrink-0" />
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight">Configuração</h2>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-4">Taxa de Quadros Alvo (FPS)</label>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {fpsOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFps(opt.value)}
                className={`flex flex-col items-center sm:items-start p-3 sm:p-4 rounded-xl border transition-all ${
                  fps === opt.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <span className="text-sm sm:text-lg font-semibold mb-1 text-zinc-200">{opt.label}</span>
                <span className="text-[10px] sm:text-xs opacity-70">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">URL da API (Ngrok do Colab)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://sua-url-ngrok.ngrok-free.dev/interpolate"
              className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-xl leading-5 bg-zinc-950 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            />
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-amber-400 font-medium text-sm">Aviso de Tempo de Processamento</h4>
            <p className="text-amber-300/80 text-xs mt-1">Quanto maior o tamanho e a duração do vídeo, mais demorado será o processo de interpolação. O processo pode levar vários minutos.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-6 mt-6 border-t border-zinc-800 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 uppercase shrink-0">
              {file.name.split('.').pop()}
            </div>
            <div className="flex-1 min-w-0 sm:max-w-[200px]">
              <div className="truncate text-sm text-zinc-300 font-medium">
                {file.name}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              onClick={() => onStart(fps, apiUrl)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all w-full sm:w-auto"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Iniciar Interpolação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
