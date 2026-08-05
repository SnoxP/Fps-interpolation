import { Settings2, Play, AlertCircle, Files } from 'lucide-react';
import { useState } from 'react';

interface ConfigPanelProps {
  files: File[];
  onStart: (fps: number) => void;
  onCancel: () => void;
}

export function ConfigPanel({ files, onStart, onCancel }: ConfigPanelProps) {
  const [fps, setFps] = useState<number>(60);

  const fpsOptions = [
    { value: 30, label: '30 FPS', desc: 'Padrão' },
    { value: 60, label: '60 FPS', desc: 'Suave' },
    { value: 120, label: '120 FPS', desc: 'Ultra Fluído' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-16 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-800">
        <Settings2 className="w-6 h-6 text-indigo-400" />
        <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight">Configuração</h2>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-4">Taxa de Quadros Alvo (FPS)</label>
          <div className="grid grid-cols-3 gap-4">
            {fpsOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFps(opt.value)}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                  fps === opt.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <span className="text-lg font-semibold mb-1 text-zinc-200">{opt.label}</span>
                <span className="text-xs opacity-70">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-amber-400 font-medium text-sm">Aviso de Limitações de Rede e do Google Colab</h4>
            <p className="text-amber-300/80 text-xs mt-1">
              Devido ao tempo de processamento e ao tamanho do arquivo final, <strong>vídeos mais longos podem concluir a interpolação no Colab, mas falhar na hora de enviar o resultado de volta para o aplicativo</strong> (devido a timeouts da conexão do Ngrok). Por isso, recomendamos o envio de vídeos curtos (10 a 15 segundos) e dividi-los se necessário.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">
              <Files className="w-5 h-5" />
            </div>
            <div className="max-w-[200px] truncate text-sm text-zinc-300 font-medium">
              {files.length} {files.length === 1 ? 'arquivo selecionado' : 'arquivos selecionados'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onStart(fps)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Iniciar Processamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
