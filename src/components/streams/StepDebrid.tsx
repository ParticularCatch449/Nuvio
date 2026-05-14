import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useConfig } from '../../ConfigContext';
import { SupportedLanguage, translateText } from '../../data/translations';
import { ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

export function StepDebrid({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { streamsConfig, setStreamsConfig, aioMeta, setAioMeta } = useConfig();
  const langKey = ((aioMeta?.config?.language) || 'en-US') as SupportedLanguage;
  const defs = streamsConfig.debrid;
  

  const updateDebrid = (key: keyof typeof defs, field: 'enabled' | 'key', value: boolean | string) => {
    setStreamsConfig(prev => ({
      ...prev,
      debrid: {
        ...prev.debrid,
        [key]: { ...prev.debrid[key], [field]: value }
      }
    }));
  };

  const providers = [
    { id: 'tb', name: 'TorBox', link: 'https://torbox.app/settings', purchaseLink: 'https://torbox.app/subscription?referral=1469bf2b-09fb-4c7e-a29f-6925fda84668' },
    { id: 'rd', name: 'Real-Debrid', link: 'https://real-debrid.com/apitoken', purchaseLink: 'https://real-debrid.com/premium' },
    { id: 'ad', name: 'AllDebrid', link: 'https://alldebrid.com/apikeys', purchaseLink: 'https://alldebrid.com/offer' },
    { id: 'pm', name: 'Premiumize', link: 'https://www.premiumize.me/account', purchaseLink: 'https://www.premiumize.me/premium' },
    { id: 'dl', name: 'DebridLink', link: 'https://debrid-link.fr/webapp/apikey', purchaseLink: 'https://debrid-link.fr/premium' }
  ] as const;

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-slate-900 border-b pb-4">{translateText('Debrid Providers', langKey) || 'Debrid Providers'}</h2>
          <p className="text-slate-500 text-sm mt-4">
            {translateText("Enable and configure the debrid providers you want to use for streaming. You must provide an API key for each enabled provider.", langKey) || "Enable and configure the debrid providers you want to use for streaming. You must provide an API key for each enabled provider."}
          </p>
        </div>

        <div className="space-y-4">
          {providers.map(provider => (
            <div key={provider.id} className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <KeyRound className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <Label htmlFor={`enable-${provider.id}`} className="text-base font-semibold">{provider.name}</Label>
                    <div className="flex gap-3">
                      <a href={provider.link} target="_blank" rel="noreferrer" className="block text-xs text-primary hover:underline mt-1">{translateText('Get API Key', langKey) || 'Get API Key'}</a>
                      <a href={provider.purchaseLink} target="_blank" rel="noreferrer" className="block text-xs text-primary hover:underline mt-1 opacity-80">{translateText('Purchase Plan', langKey) || 'Purchase Plan'}</a>
                    </div>
                  </div>
                </div>
                <Switch 
                  id={`enable-${provider.id}`}
                  checked={defs[provider.id].enabled}
                  onCheckedChange={(c) => updateDebrid(provider.id, 'enabled', c)}
                />
              </div>
              
              {defs[provider.id].enabled && (
                <div className="pt-2 animate-in fade-in border-t border-slate-100">
                  <Label htmlFor={`key-${provider.id}`} className="text-sm text-slate-600 mb-2 block">{translateText('API Key', langKey) || 'API Key'}</Label>
                  <Input 
                    id={`key-${provider.id}`}
                    type="password"
                    placeholder={`Enter ${provider.name} API Key`}
                    value={defs[provider.id].key}
                    onChange={(e) => updateDebrid(provider.id, 'key', e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
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
