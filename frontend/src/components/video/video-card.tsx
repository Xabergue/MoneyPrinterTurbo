'use client';

import React from 'react';
import { Play, Clock, Trash2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Task } from '@/lib/types';
import { TASK_STATE } from '@/lib/types';
import { formatDate, getTaskStateLabel } from '@/lib/utils';

interface VideoCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
  compact?: boolean;
}

export function VideoCard({ task, onDelete, compact = false }: VideoCardProps) {
  const hasVideo = task.state === TASK_STATE.COMPLETE && task.combined_videos?.length;
  const hasFailed = task.state === TASK_STATE.FAILED;
  const subject = task.params?.video_subject || 'Vídeo sem título';

  const stateVariant = task.state === TASK_STATE.COMPLETE
    ? 'success' as const
    : task.state === TASK_STATE.FAILED
    ? 'destructive' as const
    : 'processing' as const;

  return (
    <Card className="bg-[#0d0d0d] border-border/30 hover:border-border/60 transition-all duration-200 overflow-hidden group">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className={`relative flex-shrink-0 ${compact ? 'w-20 h-20' : 'w-28 h-20'} rounded-lg overflow-hidden bg-black/40`}>
          {hasVideo ? (
            <video
              src={task.combined_videos?.[0]}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
          ) : hasFailed ? (
            <div className="w-full h-full flex items-center justify-center bg-red-500/10">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/30">
              <Play className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          {hasVideo && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Play className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">
            {subject}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={stateVariant} className="text-[10px] px-1.5 py-0">
              {getTaskStateLabel(task.state)}
            </Badge>
            {task.params?.video_aspect && (
              <span className="text-[10px] text-muted-foreground">
                {task.params.video_aspect}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {task.created_at ? formatDate(task.created_at) : 'Data desconhecida'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          {hasVideo && task.combined_videos?.[0] && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              asChild
            >
              <a
                href={task.combined_videos[0]}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(task.task_id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
