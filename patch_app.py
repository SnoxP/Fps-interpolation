import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add batchCancelRef
content = content.replace("const pollingIntervalRef = useRef<number | null>(null);", "const pollingIntervalRef = useRef<number | null>(null);\n  const batchCancelRef = useRef<boolean>(false);")

# Update handleCancelAll
old_cancel = r'''  const handleCancelAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setTasks(prev => prev.map(t => 
      t.status === 'processing' || t.status === 'pending' 
        ? { ...t, status: 'error', errorMessage: 'Cancelado pelo usuário' } 
        : t
    ));
    // Keep globalStatus as processing_batch so the user can see the errors and retry or reset
  }, []);'''

new_cancel = r'''  const handleCancelAll = useCallback(() => {
    batchCancelRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setTasks(prev => prev.map(t => 
      t.status === 'processing' || t.status === 'pending' 
        ? { ...t, status: 'error', errorMessage: 'Cancelado pelo usuário' } 
        : t
    ));
  }, []);'''
content = content.replace(old_cancel, new_cancel)

# Update handleStartProcessing
old_start = r'''  const handleStartProcessing = useCallback((fps: number, user: User) => {
    setTargetFps(fps);
    setCurrentUser(user);
    setGlobalStatus('processing_batch');
    
    setTasks(prev => {
      const cloned = [...prev];
      processQueue(cloned, fps, user);
      return cloned;
    });
    
  }, []);'''
new_start = r'''  const handleStartProcessing = useCallback((fps: number, user: User) => {
    setTargetFps(fps);
    setCurrentUser(user);
    setGlobalStatus('processing_batch');
    batchCancelRef.current = false;
    
    setTasks(prev => {
      const cloned = [...prev];
      processQueue(cloned, fps, user);
      return cloned;
    });
    
  }, []);'''
content = content.replace(old_start, new_start)

# Update handleRetry
old_retry = r'''  const handleRetry = useCallback((taskId: string) => {
    if (!currentUser) return;
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, status: 'pending', errorMessage: null } : t);
      const toProcess = updated.filter(t => t.id === taskId);
      processQueue(toProcess, targetFps, currentUser);
      return updated;
    });
  }, [currentUser, targetFps]);'''
new_retry = r'''  const handleRetry = useCallback((taskId: string) => {
    if (!currentUser) return;
    batchCancelRef.current = false;
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, status: 'pending', errorMessage: null } : t);
      const toProcess = updated.filter(t => t.id === taskId);
      processQueue(toProcess, targetFps, currentUser);
      return updated;
    });
  }, [currentUser, targetFps]);'''
content = content.replace(old_retry, new_retry)

# Update processQueue
old_queue = r'''  const processQueue = async (currentTasks: VideoTask[], fps: number, user: User) => {
    let tasksToProcess = [...currentTasks];
    for (let i = 0; i < tasksToProcess.length; i++) {
      // Re-fetch the task to check if it was cancelled
      let stillPending = false;
      setTasks(prev => {
        const t = prev.find(pt => pt.id === tasksToProcess[i].id);
        if (t && (t.status === 'pending' || t.status === 'processing')) {
           stillPending = true;
        }
        return prev;
      });
      
      if (!stillPending) continue;

      await processTask(tasksToProcess[i], fps, user);
    }
    
    // Check if everything is done
    setTasks(prev => {
      const allDone = prev.every(t => t.status === 'done' || t.status === 'error');
      if (allDone) {
        // Let BatchProcessingView show "Done" instead of changing global status right away
      }
      return prev;
    });
  };'''

new_queue = r'''  const processQueue = async (currentTasks: VideoTask[], fps: number, user: User) => {
    let tasksToProcess = [...currentTasks];
    for (let i = 0; i < tasksToProcess.length; i++) {
      if (batchCancelRef.current) break;
      await processTask(tasksToProcess[i], fps, user);
    }
  };'''

content = content.replace(old_queue, new_queue)

with open('src/App.tsx', 'w') as f:
    f.write(content)
