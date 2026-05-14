import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useConfig } from '../ConfigContext';
import { SupportedLanguage, translateText } from '../data/translations';

export function StepApiKeys({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { aioMeta, setAioMeta } = useConfig();
  const langKey = ((aioMeta?.config?.language) || 'en-US') as SupportedLanguage;

  const [setupInAioMeta, setSetupInAioMeta] = useState(false);

  if (!aioMeta) return null;

  const apiKeys = aioMeta.config.apiKeys || {};

  const handleKeyChange = (key: string, value: string) => {
    setAioMeta(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        config: {
          ...prev.config,
          apiKeys: {
            ...prev.config.apiKeys,
            [key]: value
          }
        }
      }
    });
  };

  const keyInfo: Record<string, { label: string, link: string, desc: string, required?: boolean }> = {
    mdblist: { 
      label: translateText("MDBList API Key", langKey) || "MDBList API Key", 
      link: "https://mdblist.com/", 
      desc: translateText("(Used for all catalogies)", langKey) || "(Used for all catalogies)", 
      required: true 
    }
  };

  // Validation logic
  const requiredKeysPresent = !!(apiKeys.mdblist);
  const canContinue = requiredKeysPresent || setupInAioMeta;

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-slate-900 border-b pb-4">{translateText("API Integrations", langKey) || "API Integrations"}</h2>
          <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 mt-6">
            <h4 className="font-semibold text-blue-900 mb-2">{translateText("Why are these required?", langKey) || "Why are these required?"}</h4>
            <p className="text-blue-800 text-sm leading-relaxed mb-3">
              {translateText("Just like configuring the Integrations tab in AIO Meta, these API keys are essential. If you don't provide them, the collections will NOT work. They are used locally to fetch posters, ratings, and dynamically rank your streaming lists.", langKey) || "Just like configuring the Integrations tab in AIO Meta, these API keys are essential. If you don't provide them, the collections will NOT work. They are used locally to fetch posters, ratings, and dynamically rank your streaming lists."}
            </p>
            <p className="text-blue-700/80 text-xs italic">
              {translateText("These keys are bundled into your downloaded JSON file and remain fully local to your media center—they are not uploaded to us.", langKey) || "These keys are bundled into your downloaded JSON file and remain fully local to your media center—they are not uploaded to us."}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
          {Object.keys(keyInfo).map((keyName) => {
            const info = keyInfo[keyName];
            if (!info) return null;

            return (
              <div key={keyName} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={keyName} className="text-sm font-semibold text-slate-900">
                    {info.label} {info.required && <span className="text-rose-500">*</span>}
                  </Label>
                  {info.link && (
                    <a href={info.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
                      {translateText("Get Key", langKey) || "Get Key"} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <Input
                  id={keyName}
                  value={apiKeys[keyName] || ''}
                  onChange={(e) => handleKeyChange(keyName, e.target.value)}
                  placeholder={(translateText("Enter your {{key}} key", langKey) || `Enter your ${keyName} key`).replace('{{key}}', keyName)}
                  className={`rounded-lg shadow-sm font-mono text-sm ${info.required && !apiKeys[keyName] && !setupInAioMeta ? 'border-rose-300' : ''}`}
                />
                {info.desc && <p className="text-xs text-slate-500 leading-tight">{info.desc}</p>}
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
          <input 
            type="checkbox" 
            id="bypassKeys" 
            checked={setupInAioMeta}
            onChange={(e) => setSetupInAioMeta(e.target.checked)}
            className="mt-1 shrink-0 scale-125 accent-amber-600 cursor-pointer"
          />
          <Label htmlFor="bypassKeys" className="text-sm text-amber-800 leading-relaxed cursor-pointer flex-1">
            <strong className="block mb-1">{translateText("Set up API keys later in AIO Meta Data", langKey) || "Set up API keys later in AIO Meta Data"}</strong>
            {translateText("I understand that the integration will not work until the required API keys (MDBList) are configured. I choose to configure them later within AIO Meta.", langKey) || "I understand that the integration will not work until the required API keys (MDBList) are configured. I choose to configure them later within AIO Meta."}
          </Label>
        </div>
      </div>

      <div className="w-full flex justify-between pt-8 mt-8 border-t border-slate-200 shrink-0">
        <Button variant="outline" onClick={onPrev} className="gap-2 rounded-xl text-slate-600 px-6 py-5 font-medium transition-colors hover:bg-slate-100">
          <ArrowLeft className="w-4 h-4" /> {translateText("Back", langKey) || "Back"}
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canContinue}
          className="gap-2 px-8 py-5 rounded-xl hover:shadow-md transition-all font-medium disabled:opacity-50"
        >
          {translateText("Continue", langKey) || "Continue"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
