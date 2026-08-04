export type ProcessStatus = 'idle' | 'configuring' | 'processing' | 'done' | 'error';

export interface InterpolationConfig {
  fps: number;
  apiUrl: string;
}
