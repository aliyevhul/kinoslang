import { useState } from 'react';
import type { SlangWord } from '../../data/movies';
import { languages } from '../../data/languages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createEmptySlangWord } from '../../lib/moviesService';

interface SlangEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slang?: SlangWord;
  onSave: (slang: SlangWord) => void;
}

export default function SlangEditor({ open, onOpenChange, slang, onSave }: SlangEditorProps) {
  const [form, setForm] = useState<SlangWord>(slang || createEmptySlangWord());

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setForm(slang || createEmptySlangWord());
    }
    onOpenChange(next);
  };

  const updateField = <K extends keyof SlangWord>(key: K, value: SlangWord[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateTranslation = (langCode: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      translations: { ...prev.translations, [langCode]: value },
    }));
  };

  const handleSave = () => {
    if (!form.word.trim()) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#111] border-[#222] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {slang ? 'Edit Slang Word' : 'Add Slang Word'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="bg-[#1A1A1A] border border-[#222]">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-[#999]">Word / Phrase</Label>
              <Input
                value={form.word}
                onChange={(e) => updateField('word', e.target.value)}
                placeholder="e.g. Pump and dump"
                className="bg-[#0A0A0A] border-[#222] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#999]">Difficulty</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => updateField('difficulty', v as SlangWord['difficulty'])}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#222] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-[#222]">
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#999]">Type</Label>
                <Input
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  placeholder="e.g. Slang, Catchphrase"
                  className="bg-[#0A0A0A] border-[#222] text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#999]">Quote from movie</Label>
              <Textarea
                value={form.quote}
                onChange={(e) => updateField('quote', e.target.value)}
                placeholder='"Sell me this pen."'
                rows={3}
                className="bg-[#0A0A0A] border-[#222] text-white resize-none"
              />
            </div>
          </TabsContent>

          <TabsContent value="translations" className="space-y-3 mt-4">
            <p className="text-xs text-[#666] mb-2">
              Add translations for all supported languages. English is used as fallback.
            </p>
            {languages.map((lang) => (
              <div key={lang.code} className="flex items-center gap-3">
                <span className="text-lg w-8 shrink-0">{lang.flag}</span>
                <Label className="text-[#999] text-xs w-24 shrink-0">{lang.name}</Label>
                <Input
                  value={form.translations[lang.code] || ''}
                  onChange={(e) => updateTranslation(lang.code, e.target.value)}
                  placeholder={`Translation in ${lang.name}`}
                  className="bg-[#0A0A0A] border-[#222] text-white flex-1"
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#222] text-[#999] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.word.trim()}
            className="bg-[#E50914] hover:bg-[#B20710] text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
