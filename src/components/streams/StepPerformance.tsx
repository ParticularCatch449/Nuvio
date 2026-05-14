import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useConfig } from '../../ConfigContext';
import { SupportedLanguage, translateText } from '../../data/translations';
import { ArrowRight, ArrowLeft, Gauge, ShieldAlert, ArrowDownUp } from 'lucide-react';

export function StepPerformance({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { streamsConfig, setStreamsConfig, aioMeta } = useConfig();
  const langKey = ((aioMeta?.config?.language) || 'en-US') as SupportedLanguage;
  const perf = streamsConfig.performance;
  

  const update = (field: keyof typeof perf, value: any) => {
    setStreamsConfig(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        [field]: value
      }
    }));
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-slate-900 border-b pb-4">{translateText('Performance Limits', langKey) || 'Performance Limits'}</h2>
          <p className="text-slate-500 text-sm mt-4">
            {translateText("Configure how the streams addon resolves and sorts your content.", langKey) || "Configure how the streams addon resolves and sorts your content."}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2 rounded-lg">
                <Gauge className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <Label htmlFor="limitSpeed" className="text-base font-semibold">{translateText('Enable Internet Speed Limit', langKey) || 'Enable Internet Speed Limit'}</Label>
                <p className="text-xs text-slate-500">{translateText('Filters out streams that are too large for your connection.', langKey) || 'Filters out streams that are too large for your connection.'}</p>
              </div>
            </div>
            <Switch 
              id="limitSpeed"
              checked={perf.limitSpeed}
              onCheckedChange={(c) => update('limitSpeed', c)}
            />
          </div>
          {perf.limitSpeed && (
            <div className="pt-4 border-t animate-in fade-in flex items-center justify-between gap-4">
              <Label className="text-sm text-slate-600 block">{translateText('Download Speed (Mbps)', langKey) || 'Download Speed (Mbps)'}</Label>
              <div className="flex items-center gap-2 max-w-[150px]">
                <Input 
                  type="number"
                  min="1"
                  value={perf.internetSpeed}
                  onChange={(e) => update('internetSpeed', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <ArrowDownUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <Label htmlFor="sortPref" className="text-base font-semibold">{translateText('Stream Sorting Preference', langKey) || 'Stream Sorting Preference'}</Label>
                <p className="text-xs text-slate-500">{translateText('How would you like the streams to be ordered?', langKey) || 'How would you like the streams to be ordered?'}</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <select
              id="sortPref"
              value={perf.sortPref}
              onChange={(e) => update('sortPref', e.target.value)}
              className="mt-2 flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="quality">{translateText('Quality First (Highest resolution at the top)', langKey) || 'Quality First (Highest resolution at the top)'}</option>
              <option value="speed">{translateText('Speed First (Best cached sources first)', langKey) || 'Speed First (Best cached sources first)'}</option>
            </select>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-50 p-2 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <Label htmlFor="excludeUncached" className="text-base font-semibold">{translateText('Exclude Uncached Sources', langKey) || 'Exclude Uncached Sources'}</Label>
                <p className="text-xs text-slate-500">{translateText('Only show streams already cached on your debrid provider.', langKey) || 'Only show streams already cached on your debrid provider.'}</p>
              </div>
            </div>
            <Switch 
              id="excludeUncached"
              checked={perf.excludeUncached}
              onCheckedChange={(c) => update('excludeUncached', c)}
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
