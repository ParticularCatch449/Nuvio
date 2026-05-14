import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfig } from '../../ConfigContext';
import { SupportedLanguage, translateText } from '../../data/translations';
import { ArrowRight, ArrowLeft, Paintbrush } from 'lucide-react';

const STYLE_PRESETS = {
  "default": { 
      nameFmt: "{stream.resolution::exists[\"{stream.resolution::replace('2160p','4K')::replace('1080p','HD')::replace('720p','SD')}\"||\"\"]} {stream.quality::exists[\"{stream.quality::replace('REMUX','+')::replace('BluRay','⭐⭐⭐⭐⭐')::replace('WEB-DL','⭐⭐⭐⭐')::replace('WEBRip','⭐⭐⭐⭐')}\"||\"\"]} {service.cached::istrue[\"⚡\"||\"⏳\"]}", 
      descFmt: "{stream.type::=usenet[\"📦 USN \"||\"\"]}{stream.title::exists[\"🎬 {stream.title}\"||\"\"]}{stream.seasonEpisode::exists[\" - {stream.seasonEpisode::join(' ')}\"||\"\"]}{stream.year::exists[\" ({stream.year})\"||\"\"]}\n{service.cached::istrue[\"🟢 INSTANT PLAY\"||\"🔴 NEEDS TO DOWNLOAD\"]}\n─────────────\n{stream.languageEmojis::exists[\"Languages: {stream.languageEmojis}\"||\"\"]}\n{stream.quality::exists[\"✨ {stream.quality::replace('REMUX','+')::replace('BluRay','Premium Quality')::replace('WEB-DL','Streaming Quality')::replace('WEBRip','Streaming Quality')}\"||\"\"]}{stream.visualTags::~HDR::istrue[\" | 🌈 HDR\"||\"\"]}{stream.visualTags::~DV::istrue[\" | 🎥 Dolby Vision\"||\"\"]}{stream.audioTags::exists[\" | 🔊 {stream.audioTags::join(', ')}\"||\"\"]}\n─────────────\n📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]}{service.name::exists[\" | ☁️ {service.name}\"||\"\"]}{service.cached::isfalse[\" | 👥 {stream.seeders}\"||\"\"]}{addon.name::exists[\" | 🛰️ {addon.name}\"||\"\"]}" 
  },
  "essential": { 
      nameFmt: "{stream.title::exists[\"{stream.title}\"||\"\"]}", 
      descFmt: "📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]} - {stream.languageEmojis::exists[\"{stream.languageEmojis}\"||\"\"]}" 
  },
  "complex": { 
      nameFmt: "[{service.name::exists[\"{service.name}\"||\"P2P\"]}] {stream.title::exists[\"{stream.title}\"||\"\"]} 📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]}", 
      descFmt: "{stream.visualTags::exists[\"{stream.visualTags::join(', ')}\"||\"\"]} {stream.audioTags::exists[\"{stream.audioTags::join(', ')}\"||\"\"]}" 
  },
  "pro": { 
      nameFmt: "{stream.title::exists[\"{stream.title}\"||\"\"]} | {stream.quality::exists[\"{stream.quality}\"||\"\"]}", 
      descFmt: "📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]} · ✨ {stream.visualTags::exists[\"{stream.visualTags::join(', ')}\"||\"\"]} · 🔊 {stream.audioTags::exists[\"{stream.audioTags::join(', ')}\"||\"\"]}" 
  }
};

const mockData: Record<string, any> = {
  "stream.resolution": "2160p",
  "stream.quality": "BluRay",
  "service.cached": true,
  "stream.type": "usenet",
  "stream.title": "Inception",
  "stream.seasonEpisode": ["S01E01"],
  "stream.year": 2010,
  "stream.languageEmojis": "🇬🇧",
  "stream.visualTags": ["HDR", "DV"],
  "stream.audioTags": ["Atmos", "TrueHD"],
  "stream.size": 65000000000,
  "service.name": "RD+",
  "stream.seeders": 150,
  "addon.name": "Torrentio"
};

const resolveVar = (path: string, val: any) => {
    const parts = path.split('::');
    let baseVal = mockData[parts[0]];
    if (baseVal === undefined) return val || '';
    
    let current = baseVal;
    for (let i = 1; i < parts.length; i++) {
        const method = parts[i];
        if (method.startsWith("replace(")) {
             const args = method.match(/replace\('(.*?)','(.*?)'\)/);
             if (args && typeof current === 'string') current = current.replace(args[1], args[2]);
        } else if (method === "bytes") {
             current = (current / 1024 / 1024 / 1024).toFixed(2) + " GB";
        } else if (method.startsWith("join(")) {
             const args = method.match(/join\('(.*?)'\)/);
             if (args && Array.isArray(current)) current = current.join(args[1]);
        }
    }
    return current;
};

const renderPreview = (text: string) => {
    if (!text) return "";
    let result = text.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    
    let iterations = 0;
    while (result.includes('{') && iterations < 15) {
        iterations++;
        result = result.replace(/\{([^{}]*)\}/g, (match, inner) => {
            const conditionMatch = inner.match(/^(.*?)::(exists|istrue|isfalse|>0|=([\w]+)|~([\w]+))\["(.*?)"\|\|"(.*?)"\]$/);
            if (conditionMatch) {
                const pathStr = conditionMatch[1];
                const op = conditionMatch[2];
                const trueStr = conditionMatch[5];
                const falseStr = conditionMatch[6];
                
                const baseVal = mockData[pathStr.split('::')[0]];
                let isTruthy = false;
                
                if (op === 'exists') isTruthy = baseVal !== undefined && baseVal !== null && baseVal !== '';
                else if (op === 'istrue') isTruthy = baseVal === true;
                else if (op === 'isfalse') isTruthy = baseVal === false;
                else if (op === '>0') isTruthy = Number(baseVal) > 0;
                else if (op.startsWith('=')) {
                    const expected = op.slice(1);
                    isTruthy = baseVal == expected;
                }
                else if (op.startsWith('~')) {
                    const expected = op.slice(1);
                    isTruthy = Array.isArray(baseVal) ? baseVal.includes(expected) : String(baseVal).includes(expected);
                }
                
                return isTruthy ? trueStr : falseStr;
            } else {
                return resolveVar(inner, inner);
            }
        });
    }
    return result;
};

export function StepVisualStyle({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { streamsConfig, setStreamsConfig, aioMeta } = useConfig();
  const langKey = ((aioMeta?.config?.language) || 'en-US') as SupportedLanguage;
  const visual = streamsConfig.visual;
  

  // Derive final formats to preview
  let namePreviewFmt = visual.customName;
  let descPreviewFmt = visual.customDesc;
  if (visual.style !== 'custom') {
    const preset = STYLE_PRESETS[visual.style as keyof typeof STYLE_PRESETS];
    if (preset) {
      namePreviewFmt = preset.nameFmt;
      descPreviewFmt = preset.descFmt;
    }
  }

  const update = (field: keyof typeof visual, value: any) => {
    setStreamsConfig(prev => ({
      ...prev,
      visual: {
        ...prev.visual,
        [field]: value
      }
    }));
  };

  const handleStyleChange = (style: string) => {
    update('style', style);
    if (style !== 'custom') {
      const preset = STYLE_PRESETS[style as keyof typeof STYLE_PRESETS];
      if (preset) {
        update('customName', preset.nameFmt);
        update('customDesc', preset.descFmt);
      }
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-slate-900 border-b pb-4">{translateText('Visual Layout', langKey) || 'Visual Layout'}</h2>
          <p className="text-slate-500 text-sm mt-4">
            {translateText("Customize how stream titles and descriptions appear in Stremio.", langKey) || "Customize how stream titles and descriptions appear in Stremio."}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="bg-pink-50 p-2 rounded-lg">
              <Paintbrush className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <Label className="text-base font-semibold">{translateText('Label Style Preset', langKey) || 'Label Style Preset'}</Label>
              <p className="text-xs text-slate-500">{translateText('Pick a predefined layout or build your own.', langKey) || 'Pick a predefined layout or build your own.'}</p>
            </div>
          </div>
          <div className="pt-2">
            <select
              value={visual.style}
              onChange={(e) => handleStyleChange(e.target.value)}
              className="mt-2 flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="default">{translateText('Default', langKey) || 'Default'}</option>
              <option value="essential">{translateText('Essential (Minimalista)', langKey) || 'Essential (Minimalista)'}</option>
              <option value="complex">{translateText('Complex (Detailed)', langKey) || 'Complex (Detailed)'}</option>
              <option value="pro">{translateText('Pro (Clean & Formatted)', langKey) || 'Pro (Clean & Formatted)'}</option>
              <option value="custom">{translateText('Custom Format', langKey) || 'Custom Format'}</option>
            </select>
          </div>

          <div className={`pt-4 ${visual.style === 'custom' ? 'block' : 'opacity-60 cursor-not-allowed pointer-events-none'}`}>
            <Label className="text-sm font-semibold text-slate-700 block mb-2">{translateText('First Line (Name format)', langKey) || 'First Line (Name format)'}</Label>
            <Input 
              value={visual.customName}
              onChange={(e) => update('customName', e.target.value)}
              placeholder="e.g. {name} {size}"
              className="mb-4"
            />

            <Label className="text-sm font-semibold text-slate-700 block mb-2">{translateText('Second Line (Description format)', langKey) || 'Second Line (Description format)'}</Label>
            <Input 
              value={visual.customDesc}
              onChange={(e) => update('customDesc', e.target.value)}
              placeholder="e.g. {video} {audio}"
            />
            
            <p className="text-xs text-slate-500 mt-3 font-mono bg-slate-50 p-2 rounded border border-slate-100">
              {translateText("Available variables:", langKey) || "Available variables:"} {'{name}, {size}, {audio}, {video}, {source}, {quality}, {subs}'}
            </p>
          </div>

          <div className="pt-6 border-t mt-4 border-slate-100">
            <Label className="text-sm font-semibold text-slate-700 block mb-3">{translateText('Live Preview (Mock Data)', langKey) || 'Live Preview (Mock Data)'}</Label>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl shadow-inner font-sans border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-slate-800 shrink-0 flex items-center justify-center opacity-70 mt-1">
                <Paintbrush className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-50 text-base whitespace-pre-wrap text-left leading-relaxed">{renderPreview(namePreviewFmt) || " "}</span>
                <span className="text-slate-400 text-sm whitespace-pre-wrap text-left leading-relaxed mt-1">{renderPreview(descPreviewFmt) || " "}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="w-full flex justify-between pt-8 mt-8 border-t border-slate-200">
        <Button onClick={onPrev} variant="outline" className="gap-2 px-6 rounded-xl">
          <ArrowLeft className="w-4 h-4" /> {translateText('Back', langKey) || 'Back'}
        </Button>
        <Button onClick={onNext} className="gap-2 px-8 rounded-xl bg-slate-900 hover:bg-slate-800">
          {translateText('Continue', langKey) || 'Continue'} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
