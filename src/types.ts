export interface VideoTask {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  message: string;
  systemInfo: string;
  resultUrl: string | null;
  errorMessage: string | null;
}
