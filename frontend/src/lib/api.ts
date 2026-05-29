import type { VideoParams, ApiResponse, TasksResponse, Task, BgmFile } from './types';

const API_BASE = '/api/v1';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro de conexão' }));
    throw new Error(error.message || `Erro ${res.status}`);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

// Video generation
export async function createVideo(params: VideoParams): Promise<{ task_id: string }> {
  return fetchApi('/videos', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// Task management
export async function getTask(taskId: string): Promise<Task> {
  return fetchApi(`/tasks/${taskId}`);
}

export async function getTasks(page = 1, pageSize = 10): Promise<TasksResponse> {
  return fetchApi(`/tasks?page=${page}&page_size=${pageSize}`);
}

export async function deleteTask(taskId: string): Promise<void> {
  return fetchApi(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

// Voices
export async function getVoices(): Promise<string[]> {
  return fetchApi('/voices');
}

// BGM
export async function getMusics(): Promise<{ files: BgmFile[] }> {
  return fetchApi('/musics');
}

// LLM
export async function generateScript(params: {
  video_subject: string;
  video_language?: string;
  paragraph_number?: number;
}): Promise<{ video_script: string }> {
  return fetchApi('/scripts', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function generateTerms(params: {
  video_subject?: string;
  video_script?: string;
  amount?: number;
}): Promise<{ video_terms: string[] }> {
  return fetchApi('/terms', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
