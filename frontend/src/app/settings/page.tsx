'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Cpu,
  Key,
  Mic,
  AudioWaveform,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface Settings {
  llmEndpoint: string;
  llmModel: string;
  pexelsApiKey: string;
  pixabayApiKey: string;
  defaultVoice: string;
  defaultWhisperModel: string;
}

const DEFAULT_SETTINGS: Settings = {
  llmEndpoint: 'http://localhost:11434/v1',
  llmModel: 'gpt-3.5-turbo',
  pexelsApiKey: '',
  pixabayApiKey: '',
  defaultVoice: '',
  defaultWhisperModel: 'base',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mpt-settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('mpt-settings', JSON.stringify(settings));
    toast({
      title: 'Configurações salvas',
      description: 'Suas configurações foram salvas com sucesso.',
      variant: 'default',
    });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('mpt-settings');
    toast({
      title: 'Configurações redefinidas',
      description: 'As configurações foram restauradas para os valores padrão.',
    });
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <Header
        title="Configurações"
        description="Gerencie as configurações da aplicação"
      />

      <div className="space-y-6">
        {/* LLM Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#0d0d0d] border-border/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                Modelo de Linguagem (LLM)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Endpoint da API</Label>
                <Input
                  value={settings.llmEndpoint}
                  onChange={(e) => updateSetting('llmEndpoint', e.target.value)}
                  placeholder="http://localhost:11434/v1"
                  className="bg-[#0a0a0a] border-border/50 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  URL do endpoint local ou remoto (Ollama, OpenAI, etc.)
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Modelo</Label>
                <Input
                  value={settings.llmModel}
                  onChange={(e) => updateSetting('llmModel', e.target.value)}
                  placeholder="gpt-3.5-turbo"
                  className="bg-[#0a0a0a] border-border/50 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Nome do modelo a ser utilizado para gerar roteiros
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-[#0d0d0d] border-border/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                Chaves de API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Pexels API Key</Label>
                <Input
                  type="password"
                  value={settings.pexelsApiKey}
                  onChange={(e) => updateSetting('pexelsApiKey', e.target.value)}
                  placeholder="Sua chave de API do Pexels"
                  className="bg-[#0a0a0a] border-border/50 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Necessária para buscar vídeos do Pexels
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Pixabay API Key</Label>
                <Input
                  type="password"
                  value={settings.pixabayApiKey}
                  onChange={(e) => updateSetting('pixabayApiKey', e.target.value)}
                  placeholder="Sua chave de API do Pixabay"
                  className="bg-[#0a0a0a] border-border/50 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Necessária para buscar vídeos do Pixabay
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Voice Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-[#0d0d0d] border-border/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                Voz e Transcrição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Voz padrão</Label>
                <Input
                  value={settings.defaultVoice}
                  onChange={(e) => updateSetting('defaultVoice', e.target.value)}
                  placeholder="Nome da voz padrão"
                  className="bg-[#0a0a0a] border-border/50 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Voz TTS utilizada por padrão ao gerar vídeos
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <AudioWaveform className="w-3.5 h-3.5 text-primary" />
                  Modelo Whisper
                </Label>
                <Select
                  value={settings.defaultWhisperModel}
                  onValueChange={(v) => updateSetting('defaultWhisperModel', v)}
                >
                  <SelectTrigger className="bg-[#0a0a0a] border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-border/50">
                    <SelectItem value="tiny" className="text-sm">Tiny — Mais rápido</SelectItem>
                    <SelectItem value="base" className="text-sm">Base — Equilibrado</SelectItem>
                    <SelectItem value="small" className="text-sm">Small — Melhor qualidade</SelectItem>
                    <SelectItem value="medium" className="text-sm">Medium — Alta qualidade</SelectItem>
                    <SelectItem value="large" className="text-sm">Large — Máxima qualidade</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Modelo utilizado para transcrição de áudio
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center justify-end gap-3 pt-2"
        >
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2 bg-[#0d0d0d] border-border/50"
          >
            <RotateCcw className="w-4 h-4" />
            Redefinir
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
