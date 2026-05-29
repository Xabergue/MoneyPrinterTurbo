'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { ConfigPanel } from '@/components/video/config-panel';
import { PreviewPanel } from '@/components/video/preview-panel';
import { VideoCard } from '@/components/video/video-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useVideoGeneration } from '@/hooks/use-video-generation';
import { useTasks, useDeleteTask } from '@/hooks/use-tasks';
import type { VideoParams } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const { generateVideo, isGenerating, taskStatus, error, reset } = useVideoGeneration();
  const { data: tasksData } = useTasks(1, 5);
  const deleteTaskMutation = useDeleteTask();
  const { toast } = useToast();

  const handleGenerate = (params: VideoParams) => {
    reset();
    generateVideo(params);
    toast({
      title: 'Geração iniciada',
      description: 'Seu vídeo está sendo gerado...',
      variant: 'default',
    });
  };

  const handleDelete = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
    toast({
      title: 'Tarefa removida',
      description: 'A tarefa foi excluída com sucesso.',
    });
  };

  const recentTasks = tasksData?.tasks?.filter((t) => t.task_id !== taskStatus?.task_id) || [];

  return (
    <div className="max-w-[1400px] mx-auto">
      <Header
        title="Gerador de Vídeos"
        description="Crie vídeos curtos com inteligência artificial"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column - Configuration (40%) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="sticky top-8 rounded-xl border border-border/30 bg-[#0d0d0d] p-6">
            <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Configurações
            </h2>
            <ConfigPanel
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </motion.div>

        {/* Right column - Preview and History (60%) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Video Preview */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Prévia
            </h2>
            <PreviewPanel
              taskStatus={taskStatus}
              isGenerating={isGenerating}
              error={error}
            />
          </div>

          <Separator className="bg-border/30" />

          {/* Recent Videos */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Vídeos Recentes
            </h2>
            {recentTasks.length > 0 ? (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <VideoCard
                      key={task.task_id}
                      task={task}
                      onDelete={handleDelete}
                      compact
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 rounded-xl border border-dashed border-border/30">
                <p className="text-sm text-muted-foreground">
                  Nenhum vídeo gerado ainda
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure os parâmetros e clique em &quot;Gerar Vídeo&quot;
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
