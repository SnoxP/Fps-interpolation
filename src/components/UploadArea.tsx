import { UploadCloud, FileVideo } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
}

export function UploadArea({ onFileSelect }: UploadAreaProps) {
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
      const file = e.dataTransfer.files[0];
      if (file.type === 'video/mp4' || file.type === 'image/gif') {
        onFileSelect(file);
      } else {
        alert('Please upload an MP4 or GIF file.');
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-16">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-zinc-100 mb-4 tracking-tight">Enhance Video Fluidity with AI</h1>
        <p className="text-lg text-zinc-400">Upload your MP4 or GIF to intelligently interpolate frames up to 120 FPS.</p>
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
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {isDragging ? <FileVideo className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
          </div>
          <div>
            <p className="text-zinc-200 font-medium text-lg">Click or drag a file to this area to upload.</p>
            <p className="text-zinc-500 text-sm mt-2">Supports MP4 and GIF up to 500MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
