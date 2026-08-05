import { UploadCloud, FileVideo } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface UploadAreaProps {
  onFilesSelect: (files: File[]) => void;
}

export function UploadArea({ onFilesSelect }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files as Iterable<File>).filter(
        (f) => f.type === 'video/mp4' || f.type === 'image/gif'
      );
      if (validFiles.length > 0) {
        onFilesSelect(validFiles);
      } else {
        alert('Por favor, envie apenas arquivos MP4 ou GIF.');
      }
    }
  }, [onFilesSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files as Iterable<File>).filter(
        (f) => f.type === 'video/mp4' || f.type === 'image/gif'
      );
      if (validFiles.length > 0) {
        onFilesSelect(validFiles);
      }
    }
  }, [onFilesSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-16">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-zinc-100 mb-4 tracking-tight">Melhore a Fluidez do Vídeo com IA</h1>
        <p className="text-lg text-zinc-400">Envie seus MP4 ou GIF para interpolar quadros inteligentemente até 120 FPS.</p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
        }`}
      >
        <input
          type="file"
          accept="video/mp4, image/gif"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {isDragging ? <FileVideo className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
          </div>
          <div>
            <p className="text-zinc-200 font-medium text-lg">Clique ou arraste arquivos para esta área para enviar.</p>
            <p className="text-zinc-500 text-sm mt-2">Suporta múltiplos arquivos MP4 e GIF até 500MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
