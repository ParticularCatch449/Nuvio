import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Film, Server, Layers } from 'lucide-react';
import { useConfig } from '../ConfigContext';
import { SupportedLanguage, translateText } from '../data/translations';

export function StepWelcome({ onNext }: { onNext: () => void }) {
  const { aioMeta, setupMode, setSetupMode } = useConfig();
  const langKey = ((aioMeta?.config?.language) || 'en-US') as SupportedLanguage;

  const handleModeSelect = (mode: 'streams' | 'collections' | 'both') => {
    setSetupMode(mode);
  };

  const handleStart = () => {
    if (setupMode) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 border-b pb-4">{translateText('Welcome to Nuvio Account Builder', langKey) || 'Welcome to Nuvio Account Builder'}</h2>
          <p className="text-slate-500 text-base leading-relaxed max-w-3xl">
            {translateText('Configure your perfect Nuvio streaming experience. Choose whether you want to configure your streaming providers, curate your metadata catalogs and collections, or set up everything at once.', langKey) || 'Configure your perfect Nuvio streaming experience. Choose whether you want to configure your streaming providers, curate your metadata catalogs and collections, or set up everything at once.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <button
            onClick={() => handleModeSelect('streams')}
            className={`text-left rounded-xl border-2 p-6 flex flex-col gap-4 transition-all hover:shadow-md ${
              setupMode === 'streams' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="h-12 w-12 shrink-0 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{translateText('Streams Only', langKey) || 'Streams Only'}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {translateText('Configure your debrid providers (Real-Debrid, TorBox, etc.), performance limits, and stream sorting rules.', langKey) || 'Configure your debrid providers (Real-Debrid, TorBox, etc.), performance limits, and stream sorting rules.'}
              </p>
            </div>
          </button>
          
          <button
            onClick={() => handleModeSelect('collections')}
            className={`text-left rounded-xl border-2 p-6 flex flex-col gap-4 transition-all hover:shadow-md ${
              setupMode === 'collections' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="h-12 w-12 shrink-0 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{translateText('Collections Only', langKey) || 'Collections Only'}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {translateText('Curate your catalogs, customize integrations (TMDB, Trakt), and select exactly which collections sync.', langKey) || 'Curate your catalogs, customize integrations (TMDB, Trakt), and select exactly which collections sync.'}
              </p>
            </div>
          </button>
          
          <button
            onClick={() => handleModeSelect('both')}
            className={`text-left rounded-xl border-2 p-6 flex flex-col gap-4 transition-all hover:shadow-md ${
              setupMode === 'both' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="h-12 w-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{translateText('Complete Builder', langKey) || 'Complete Builder'}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {translateText('The ultimate setup. Configure all stream rules and hand-pick your entire collection metadata in one pass.', langKey) || 'The ultimate setup. Configure all stream rules and hand-pick your entire collection metadata in one pass.'}
              </p>
            </div>
          </button>
        </div>

      </div>

      <div className="w-full flex justify-end pt-8 mt-8 border-t border-slate-200">
        <Button 
          onClick={handleStart} 
          disabled={!setupMode}
          className="gap-2 px-8 py-6 rounded-xl hover:shadow-md transition-all text-base font-medium disabled:opacity-50"
        >
          {translateText("Get Started", langKey) || "Get Started"} <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
