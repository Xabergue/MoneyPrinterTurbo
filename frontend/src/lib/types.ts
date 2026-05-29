// API Types for MoneyPrinterTurbo

export interface VideoParams {
  video_subject: string;
  video_script?: string;
  video_terms?: string | string[];
  video_aspect?: '16:9' | '9:16' | '1:1';
  video_concat_mode?: 'random' | 'sequential';
  video_transition_mode?: string | null;
  video_clip_duration?: number;
  video_count?: number;
  video_source?: 'pexels' | 'pixabay' | 'local';
  video_materials?: Array<{ provider: string; url: string; duration: number }>;
  custom_audio_file?: string;
  video_language?: string;
  voice_name?: string;
  voice_volume?: number;
  voice_rate?: number;
  bgm_type?: string;
  bgm_file?: string;
  bgm_volume?: number;
  subtitle_enabled?: boolean;
  subtitle_position?: 'top' | 'bottom' | 'center' | 'custom';
  custom_position?: number;
  font_name?: string;
  text_fore_color?: string;
  text_background_color?: boolean | string;
  font_size?: number;
  stroke_color?: string;
  stroke_width?: number;
  n_threads?: number;
  paragraph_number?: number;
}

export interface Task {
  task_id: string;
  state: number;
  progress: number;
  videos?: string[];
  combined_videos?: string[];
  params?: VideoParams;
  created_at?: string;
  updated_at?: string;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
}

export interface Voice {
  name: string;
  gender?: string;
  language?: string;
}

export interface BgmFile {
  name: string;
  size: number;
  file: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Task states
export const TASK_STATE = {
  FAILED: -1,
  COMPLETE: 1,
  PROCESSING: 4,
} as const;
