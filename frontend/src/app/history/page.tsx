'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trash2, Filter, Search } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { VideoCard } from '@/components/video/video-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTasks, useDeleteTask } from '@/hooks/use-tasks';
import { useToast } from '@/components/ui/use-toast';
import { TASK_STATE } from '@/lib/types';
import { getTaskStateLabel } from '@/lib/utils';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'complete' | 'processing' | 'failed'>('all');
  const [search, setSearch] = useState('');
  const { data: tasksData, isLoading } = useTasks(page, 12);
  const deleteTaskMutation = useDeleteTask();
  const { toast } = useToast();

  const handleDelete = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
    toast({
      title: 'Tarefa removida',
      description: 'A tarefa foi excluída com sucesso.',
    });
  };

  let tasks = tasksData?.tasks || [];

  // Apply filter
  if (filter !== 'all') {
    const stateMap = {
      complete: TASK_STATE.COMPLETE,
      processing: TASK_STATE.PROCESSING,
      failed: TASK_STATE.FAILED,
    };
    tasks = tasks.filter((t) => t.state === stateMap[filter]);
  }

  // Apply search
  if (search) {
    tasks = tasks.filter((t) =>
      t.params?.video_subject?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = tasksData?.total || 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-[1200px] mx-auto">
      <Header
        title="Histórico"
        description="Todos os vídeos gerados"
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por tema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0d0d0d] border-border/50"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[180px] bg-[#0d0d0d] border-border/50">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-border/50">
            <SelectItem value="all" className="text-sm">Todos</SelectItem>
            <SelectItem value="complete" className="text-sm">Concluídos</SelectItem>
            <SelectItem value="processing" className="text-sm">Em processamento</SelectItem>
            <SelectItem value="failed" className="text-sm">Falharam</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Task Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-[#0d0d0d] border border-border/30 animate-pulse"
            />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <ScrollArea className="max-h-[calc(100vh-260px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.task_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <VideoCard task={task} onDelete={handleDelete} />
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-20 rounded-xl border border-dashed border-border/30">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum vídeo encontrado
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Gere seu primeiro vídeo na aba &quot;Gerador&quot;
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="bg-[#0d0d0d] border-border/50"
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="bg-[#0d0d0d] border-border/50"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
