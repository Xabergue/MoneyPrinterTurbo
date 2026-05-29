'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Task } from '@/lib/types';
import { TASK_STATE } from '@/lib/types';
import { getProgressStep, getTaskStateLabel } from '@/lib/utils';

interface PreviewPanelProps {
  taskStatus: Task | null;
  isGenerating: boolean;
  error: Error | null;
}

export function PreviewPanel({ taskStatus, isGenerating, error }: PreviewPanelProps) {
  const hasVideo = taskStatus?.state === TASK_STATE.COMPLETE && taskStatus?.combined_videos?.length;
  const hasFailed = taskStatus?.state === TASK_STATE.FAILED;
  const isProcessing = isGenerating && taskStatus?.state === TASK_STATE.PROCESSING;

  return (
    <div className="space-y-6">
      {/* Video Preview / Status */}
      <Card className="bg-[#0d0d0d] border-border/30 overflow-hidden">
        <div className="aspect-video relative flex items-center justify-center bg-black/40 rounded-lg overflow-hidden">
          {/* Idle state */}
          {!isGenerating && !hasVideo && !hasFailed && (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto">
                <Play className="w-7 h-7 text-muted-foreground ml-1" />
              </div>
              <p className="text-sm text-muted-foreground">
                Configure e gere seu vídeo
              </p>
            </div>
          )}

          {/* Processing state */}
          {isProcessing && (
            <div className="text-center space-y-4 w-full px-8">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {getProgressStep(taskStatus?.progress || 0)}
                </p>
                <Progress value={taskStatus?.progress || 0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {taskStatus?.progress || 0}% concluído
                </p>
              </div>
            </div>
          )}

          {/* Generating (waiting for first poll) */}
          {isGenerating && !taskStatus && (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">
                Iniciando geração...
              </p>
            </div>
          )}

          {/* Complete state with video */}
          {hasVideo && (
            <video
              src={taskStatus.combined_videos![0]}
              controls
              className="w-full h-full object-contain"
              autoPlay
            />
          )}

          {/* Failed state */}
          {hasFailed && (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm font-medium text-red-400">
                Falha na geração do vídeo
              </p>
              <p className="text-xs text-muted-foreground">
                Tente novamente com parâmetros diferentes
              </p>
            </div>
          )}

          {/* Error state */}
          {error && !isGenerating && (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm font-medium text-red-400">
                Erro de conexão
              </p>
              <p className="text-xs text-muted-foreground">
                Verifique se a API está rodando em localhost:8080
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Task Status Badge */}
      {taskStatus && (
        <div className="flex items-center gap-3">
          <Badge
            variant={
              taskStatus.state === TASK_STATE.COMPLETE
                ? 'success'
                : taskStatus.state === TASK_STATE.FAILED
                ? 'destructive'
                : 'processing'
            }
          >
            {getTaskStateLabel(taskStatus.state)}
          </Badge>
          {hasVideo && taskStatus.combined_videos?.[0] && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              asChild
            >
              <a
                href={taskStatus.combined_videos[0]}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Vídeo
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
