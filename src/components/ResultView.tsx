import { Download, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ResultViewProps {
  resultUrl: string;
  originalFile: File;
  onReset: () => void;
}

export function ResultView({ resultUrl, originalFile, onReset }: ResultViewProps) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!originalFile) return;
    const url = URL.createObjectURL(originalFile);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [originalFile]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    // Semper salvar como .mp4 pois a API do backend sempre retorna vídeo MP4
    a.download = `interpolated_${originalFile.name.replace(/\.[^/.]+$/, "")}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-2">Processing Complete</h2>
        <p className="text-zinc-400 text-lg">Your video has been successfully interpolated.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Original</span>
          </div>
          <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
            {originalUrl ? (
              originalFile.type.startsWith('video/') ? (
                <video src={originalUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img src={originalUrl} alt="Original" className="w-full h-full object-contain" />
              )
            ) : null}
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800 ring-1 ring-indigo-500/20">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Interpolated (AI)</span>
          </div>
          <div className="aspect-video bg-black rounded-lg overflow-hidden border border-indigo-500/30 flex items-center justify-center">
            {/* O retorno da API será SEMPRE um vídeo MP4 */}
            {resultUrl ? (
              <video src={resultUrl} controls className="w-full h-full object-contain" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Process Another
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          Download Result
        </button>
      </div>
    </div>
  );
}
