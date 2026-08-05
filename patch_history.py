import re

with open('src/components/HistoryPanel.tsx', 'r') as f:
    content = f.read()

old_display = r'''              {video.videoUrl ? (
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
              )}'''

new_display = r'''              {video.videoUrl === 'error' ? (
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
              )}'''

content = content.replace(old_display, new_display)

with open('src/components/HistoryPanel.tsx', 'w') as f:
    f.write(content)

