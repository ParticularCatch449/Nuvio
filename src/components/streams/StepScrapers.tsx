import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useConfig } from '../../ConfigContext';
import { SupportedLanguage, translateText } from '../../data/translations';

export function StepScrapers({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { streamsConfig, setStreamsConfig, aioMeta } = useConfig();
  const langKey = ((aioMeta?.config?.language) || 'en-US') as SupportedLanguage;

  const handleToggle = (checked: boolean) => {
    setStreamsConfig(prev => ({
      ...prev,
      debrid: {
        ...prev.debrid,
        do: { ...prev.debrid.do, enabled: checked }
      }
    }));
  };

  const handleKeyChange = (value: string) => {
    setStreamsConfig(prev => ({
      ...prev,
      debrid: {
        ...prev.debrid,
        do: { ...prev.debrid.do, key: value }
      }
    }));
  };

  const hasDebrid = streamsConfig.debrid.tb.enabled || streamsConfig.debrid.rd.enabled || streamsConfig.debrid.ad.enabled || streamsConfig.debrid.pm.enabled || streamsConfig.debrid.dl.enabled;
  const showDebridOptions = hasDebrid;

  const handleToggleHttp = (checked: boolean) => {
    setStreamsConfig(prev => ({
      ...prev,
      httpStreaming: { 
        ...prev.httpStreaming, 
        enabled: checked,
        // Auto-add based on debrid status
        hdhub: checked,
        sootio: checked && hasDebrid
      }
    }));
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
      <div className="space-y-6 pb-20">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-slate-900 border-b pb-4">{translateText('Additional Scrapers', langKey) || 'Additional Scrapers'}</h2>
          <p className="text-slate-500 text-sm mt-4">
            {translateText('Enable and configure additional stream scrapers and HTTP streaming options.', langKey) || 'Enable and configure additional stream scrapers and HTTP streaming options.'}
          </p>
        </div>

        {/* HTTP Streaming Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                id="http-streaming"
                checked={streamsConfig.httpStreaming.enabled}
                onCheckedChange={handleToggleHttp}
              />
              <div>
                <Label htmlFor="http-streaming" className="font-semibold text-slate-800 cursor-pointer">{translateText("Use HTTP", langKey) || "Use HTTP"}</Label>
                <p className="text-xs text-slate-500">
                  {hasDebrid 
                    ? (translateText("Automatically adds Sootio and HdHub scrapers.", langKey) || "Automatically adds Sootio and HdHub scrapers.")
                    : (translateText("Automatically adds HdHub scraper.", langKey) || "Automatically adds HdHub scraper.")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Debridio Scraper (Only if Debrid is active) */}
        {showDebridOptions && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  id="scraper-do"
                  checked={streamsConfig.debrid.do.enabled}
                  onCheckedChange={handleToggle}
                />
                <Label htmlFor="scraper-do" className="font-semibold text-slate-800 cursor-pointer">{translateText("Debridio Scraper", langKey) || "Debridio Scraper"}</Label>
              </div>
              <a href="https://debridio.net/" target="_blank" rel="noreferrer" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium bg-primary/5 px-2 py-1 rounded-md transition-colors">
                {translateText('Get API Key', langKey) || 'Get API Key'}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {streamsConfig.debrid.do.enabled && (
              <div className="p-4 bg-slate-50 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wider font-semibold">
                  {translateText('API Key', langKey) || 'API Key'}
                </Label>
                <Input
                  type="password"
                  placeholder="Enter your Debridio API Key..."
                  value={streamsConfig.debrid.do.key || ''}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  className="font-mono text-sm bg-white border-slate-200 focus-visible:ring-primary/20"
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-between items-center z-10">
        <div className="max-w-5xl mx-auto w-full flex justify-between">
          <Button variant="outline" onClick={onPrev} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {translateText('Back', langKey) || 'Back'}
          </Button>
          <Button onClick={onNext} className="gap-2 px-8">
            {translateText('Continue', langKey) || 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
