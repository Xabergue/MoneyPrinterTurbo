import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getTaskStateLabel(state: number): string {
  switch (state) {
    case -1:
      return 'Falhou';
    case 1:
      return 'Concluído';
    case 4:
      return 'Processando';
    default:
      return 'Pendente';
  }
}

export function getTaskStateColor(state: number): string {
  switch (state) {
    case -1:
      return 'text-red-400';
    case 1:
      return 'text-green-400';
    case 4:
      return 'text-violet-400';
    default:
      return 'text-zinc-400';
  }
}

export function getProgressStep(progress: number): string {
  if (progress <= 10) return 'Gerando roteiro...';
  if (progress <= 30) return 'Sintetizando voz...';
  if (progress <= 60) return 'Buscando clipes...';
  if (progress <= 90) return 'Montando vídeo...';
  return 'Finalizando...';
}

/**
 * Converte um caminho local de vídeo retornado pela API em uma URL acessível
 * pelo navegador via mount /storage do FastAPI.
 * Exemplo: "storage/tasks/abc123/final-1.mp4" → "http://localhost:8080/storage/tasks/abc123/final-1.mp4"
 */
export function getVideoUrl(localPath: string): string {
  if (!localPath) return '';
  // Se já é uma URL absoluta, retorna como está
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) return localPath;
  // Normaliza barras invertidas (Windows) e remove prefixo de drive
  const normalized = localPath.replace(/\\/g, '/').replace(/^[A-Za-z]:/, '');
  // Remove barras iniciais duplicadas
  const clean = normalized.replace(/^\/+/, '');
  // Garante que o caminho comece com "storage/"
  const withStorage = clean.startsWith('storage/') ? clean : `storage/${clean}`;
  return `http://localhost:8080/${withStorage}`;
}
