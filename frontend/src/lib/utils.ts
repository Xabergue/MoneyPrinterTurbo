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
