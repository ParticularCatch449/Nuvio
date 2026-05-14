import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Globe } from 'lucide-react';
import { useConfig } from '../ConfigContext';
import { LANGUAGES, SupportedLanguage, translateText } from '../data/translations';

export function StepLanguage({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { aioMeta, setAioMeta } = useConfig();

  if (!aioMeta) return null;

  const currentLang = aioMeta.config.language || 'en-US';
  const langKey = currentLang as SupportedLanguage;

  const handleLangChange = (code: SupportedLanguage) => {
    setAioMeta((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        config: {
          ...prev.config,
          language: code,
        }
      };
    });
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 border-b pb-4">{translateText("Select Language", langKey) || "Select Language"}</h2>
          <p className="text-slate-500 text-base leading-relaxed max-w-3xl">
            {translateText("Choose your preferred language. This will set the language for TMDB metadata and automatically translate titles in your Nuvio collections.", langKey) || "Choose your preferred language. This will set the language for TMDB metadata and automatically translate titles in your Nuvio collections."}<br />
            <strong className="text-slate-700">{translateText("Note:", langKey) || "Note:"}</strong> {translateText("This language selection applies specifically to the AIO setup interface and your generated Nuvio Collections/Metadata. Audio streams are configured separately.", langKey) || "This language selection applies specifically to the AIO setup interface and your generated Nuvio Collections/Metadata. Audio streams are configured separately."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <div 
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={`cursor-pointer rounded-xl border p-6 flex flex-col gap-3 transition-all
                  ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' : 'border-slate-200 bg-white hover:border-primary/50 hover:shadow-sm'}`}
              >
                <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center
                  ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isSelected ? 'text-primary' : 'text-slate-900'}`}>{lang.label}</h3>
                  <p className="text-sm text-slate-500 mt-1">{lang.code}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full flex justify-between pt-8 mt-8 border-t border-slate-200 shrink-0">
        <Button variant="outline" onClick={onPrev} className="gap-2 rounded-xl text-slate-600 px-6 py-5 font-medium transition-colors hover:bg-slate-100">
          <ArrowLeft className="w-4 h-4" /> {translateText("Back", langKey) || "Back"}
        </Button>
        <Button onClick={onNext} className="gap-2 px-8 py-5 rounded-xl hover:shadow-md transition-all font-medium">
          {translateText("Continue", langKey) || "Continue"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
