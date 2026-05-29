'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Mic,
  Ratio,
  Globe,
  Download,
  Sparkles,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useVoices } from '@/hooks/use-voices';
import type { VideoParams } from '@/lib/types';

interface ConfigPanelProps {
  onGenerate: (params: VideoParams) => void;
  isGenerating: boolean;
}

export function ConfigPanel({ onGenerate, isGenerating }: ConfigPanelProps) {
  const [videoSubject, setVideoSubject] = useState('');
  const [videoScript, setVideoScript] = useState('');
  const [autoScript, setAutoScript] = useState(true);
  const [voiceName, setVoiceName] = useState('');
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('9:16');
  const [videoSource, setVideoSource] = useState<'pexels' | 'pixabay' | 'local'>('pexels');
  const [videoLanguage, setVideoLanguage] = useState('pt-BR');
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);

  const { data: voices, isLoading: voicesLoading } = useVoices();

  const handleGenerate = () => {
    if (!videoSubject.trim()) return;

    const params: VideoParams = {
      video_subject: videoSubject,
      video_script: autoScript ? '' : videoScript,
      video_aspect: videoAspect,
      voice_name: voiceName,
      voice_rate: voiceRate,
      video_source: videoSource,
      video_language: videoLanguage,
      subtitle_enabled: subtitleEnabled,
    };

    onGenerate(params);
  };

  return (
    <div className="space-y-6">
      {/* Video Subject */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Video className="w-3.5 h-3.5 text-primary" />
          Tema do Vídeo
        </Label>
        <Textarea
          placeholder="Descreva o tema do vídeo... Ex: A importância da inteligência artificial no mundo moderno"
          value={videoSubject}
          onChange={(e) => setVideoSubject(e.target.value)}
          className="min-h-[100px] bg-[#0d0d0d] border-border/50 focus:border-primary/50 resize-none text-sm"
        />
      </div>

      {/* Script Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-primary" />
            Gerar roteiro automaticamente
          </Label>
          <Switch
            checked={autoScript}
            onCheckedChange={setAutoScript}
          />
        </div>
        <AnimatePresence>
          {!autoScript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                placeholder="Cole ou escreva o roteiro do vídeo aqui..."
                value={videoScript}
                onChange={(e) => setVideoScript(e.target.value)}
                className="min-h-[150px] bg-[#0d0d0d] border-border/50 focus:border-primary/50 resize-none text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Separator className="bg-border/30" />

      {/* Voice Select */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Mic className="w-3.5 h-3.5 text-primary" />
          Voz
        </Label>
        <Select value={voiceName} onValueChange={setVoiceName}>
          <SelectTrigger className="bg-[#0d0d0d] border-border/50">
            <SelectValue placeholder={voicesLoading ? 'Carregando vozes...' : 'Selecione uma voz'} />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-border/50 max-h-[200px]">
            {Array.isArray(voices) && voices.map((voice) => (
              <SelectItem key={voice} value={voice} className="text-sm">
                {voice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Voice Speed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Velocidade da fala
          </Label>
          <span className="text-xs text-muted-foreground font-mono">
            {voiceRate.toFixed(1)}x
          </span>
        </div>
        <Slider
          value={[voiceRate]}
          onValueChange={(v) => setVoiceRate(v[0])}
          min={0.5}
          max={2.0}
          step={0.1}
          className="py-2"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0.5x</span>
          <span>1.0x</span>
          <span>2.0x</span>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Video Aspect */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Ratio className="w-3.5 h-3.5 text-primary" />
          Proporção do vídeo
        </Label>
        <Select value={videoAspect} onValueChange={(v) => setVideoAspect(v as '16:9' | '9:16')}>
          <SelectTrigger className="bg-[#0d0d0d] border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-border/50">
            <SelectItem value="9:16" className="text-sm">
              📱 9:16 — Vertical (TikTok/Reels)
            </SelectItem>
            <SelectItem value="16:9" className="text-sm">
              🖥️ 16:9 — Horizontal (YouTube)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Video Source */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Fonte dos vídeos
        </Label>
        <Select value={videoSource} onValueChange={(v) => setVideoSource(v as 'pexels' | 'pixabay' | 'local')}>
          <SelectTrigger className="bg-[#0d0d0d] border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-border/50">
            <SelectItem value="pexels" className="text-sm">Pexels</SelectItem>
            <SelectItem value="pixabay" className="text-sm">Pixabay</SelectItem>
            <SelectItem value="local" className="text-sm">Local</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary" />
          Idioma
        </Label>
        <Select value={videoLanguage} onValueChange={setVideoLanguage}>
          <SelectTrigger className="bg-[#0d0d0d] border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-border/50">
            <SelectItem value="pt-BR" className="text-sm">Português (BR)</SelectItem>
            <SelectItem value="en-US" className="text-sm">English (US)</SelectItem>
            <SelectItem value="es" className="text-sm">Español</SelectItem>
            <SelectItem value="fr" className="text-sm">Français</SelectItem>
            <SelectItem value="de" className="text-sm">Deutsch</SelectItem>
            <SelectItem value="zh-CN" className="text-sm">中文</SelectItem>
            <SelectItem value="ja" className="text-sm">日本語</SelectItem>
            <SelectItem value="ko" className="text-sm">한국어</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subtitles Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          Legendas
        </Label>
        <Switch
          checked={subtitleEnabled}
          onCheckedChange={setSubtitleEnabled}
        />
      </div>

      <Separator className="bg-border/30" />

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !videoSubject.trim()}
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 animate-pulse-glow disabled:animate-none disabled:opacity-50"
        size="lg"
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Gerando vídeo...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Gerar Vídeo
          </div>
        )}
      </Button>
    </div>
  );
}
