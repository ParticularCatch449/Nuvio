import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useConfig } from '../../ConfigContext';
import { SupportedLanguage, translateText } from '../../data/translations';
import { ArrowRight, ArrowLeft, Languages, MonitorIcon, VideoIcon, Tv, Popcorn } from 'lucide-react';

export function StepStreamRules({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { streamsConfig, setStreamsConfig, aioMeta } = useConfig();
  const langKey = ((aioMeta?.config?.language) || 'en-US') as SupportedLanguage;
  const rules = streamsConfig.rules;
  

  const update = (field: keyof typeof rules, value: any) => {
    setStreamsConfig(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [field]: value
      }
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    let current = [...rules.languages];
    if (current.includes(lang)) {
      current = current.filter(l => l !== lang);
    } else {
      current.push(lang);
    }
    update('languages', current);
  };

  const availableLanguages = [
    'English', 'French', 'Spanish', 'German', 'Italian', 'Japanese', 'Korean', 'Hindi', 'Portuguese', 'Russian', 'Chinese', 'Arabic'
  ];

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-slate-900 border-b pb-4">{translateText('Stream Rules', langKey) || 'Stream Rules'}</h2>
          <p className="text-slate-500 text-sm mt-4">
            {translateText('Fine-tune options related to Anime, Autoplay, language priorities, and quality caps.', langKey) || 'Fine-tune options related to Anime, Autoplay, language priorities, and quality caps.'}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-2 rounded-lg">
                <Tv className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <Label htmlFor="enableAnime" className="text-base font-semibold">{translateText('Enable Anime Enhancements', langKey) || 'Enable Anime Enhancements'}</Label>
                <p className="text-xs text-slate-500">{translateText('Improves metadata extraction and streaming sources for anime.', langKey) || 'Improves metadata extraction and streaming sources for anime.'}</p>
              </div>
            </div>
            <Switch 
              id="enableAnime"
              checked={rules.enableAnime}
              onCheckedChange={(c) => update('enableAnime', c)}
            />
          </div>
          
          {rules.enableAnime && (
            <div className="pt-4 border-t animate-in fade-in">
              <Label className="text-sm font-semibold text-slate-700 block mb-2">{translateText('Anime Multi-Episode Autoplay Method', langKey) || 'Anime Multi-Episode Autoplay Method'}</Label>
              <select
                value={rules.autoplayMethod}
                onChange={(e) => update('autoplayMethod', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="matchingFile">{translateText('Match closest filename to requested episode (Recommended)', langKey) || 'Match closest filename to requested episode (Recommended)'}</option>
                <option value="matchingIndex">{translateText('Match by torrent sequence index', langKey) || 'Match by torrent sequence index'}</option>
                <option value="firstFile">{translateText('Always pick the first file in torrent', langKey) || 'Always pick the first file in torrent'}</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="bg-teal-50 p-2 rounded-lg">
              <Languages className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <Label className="text-base font-semibold">{translateText('Priority Audio Languages', langKey) || 'Priority Audio Languages'}</Label>
              <p className="text-xs text-slate-500">{translateText('Pick preferred languages for Multi-Audio streams.', langKey) || 'Pick preferred languages for Multi-Audio streams.'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
             {availableLanguages.map(lang => {
               const isActive = rules.languages.includes(lang);
               return (
                 <button 
                  key={lang}
                  onClick={() => handleLanguageToggle(lang)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isActive ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                 >
                   {lang}
                 </button>
               )
             })}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <MonitorIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <Label htmlFor="resLimit" className="text-base font-semibold">{translateText('Maximum Resolution Cap', langKey) || 'Maximum Resolution Cap'}</Label>
                <p className="text-xs text-slate-500">{translateText('Only streams at or below this resolution will be returned.', langKey) || 'Only streams at or below this resolution will be returned.'}</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <select
              id="resLimit"
              value={rules.resLimit}
              onChange={(e) => update('resLimit', parseInt(e.target.value))}
              className="mt-2 flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="5">{translateText('Any Resolution (No Limit)', langKey) || 'Any Resolution (No Limit)'}</option>
              <option value="4">{translateText('Limit to 4K / 2160p', langKey) || 'Limit to 4K / 2160p'}</option>
              <option value="3">{translateText('Limit to Full HD / 1080p', langKey) || 'Limit to Full HD / 1080p'}</option>
              <option value="2">{translateText('Limit to HD / 720p', langKey) || 'Limit to HD / 720p'}</option>
              <option value="1">{translateText('Limit to SD / 480p', langKey) || 'Limit to SD / 480p'}</option>
            </select>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-2 rounded-lg">
                <VideoIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <Label htmlFor="excludeCams" className="text-base font-semibold">{translateText('Exclude CAM / TS', langKey) || 'Exclude CAM / TS'}</Label>
                <p className="text-xs text-slate-500">{translateText('Filter out low-quality theater recordings.', langKey) || 'Filter out low-quality theater recordings.'}</p>
              </div>
            </div>
            <Switch 
              id="excludeCams"
              checked={rules.excludeCams}
              onCheckedChange={(c) => update('excludeCams', c)}
            />
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
