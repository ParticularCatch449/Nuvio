import React from 'react';
import { ConfigProvider, useConfig } from './ConfigContext';
import { Wizard } from './components/Wizard';
import { Coffee, Globe } from 'lucide-react';
import { LANGUAGES, SupportedLanguage, translateText } from './data/translations';
import { getCustomArtUrl } from './lib/utils';

function Header() {
  const { aioMeta, setAioMeta } = useConfig();
  
  if (!aioMeta) return null;

  const currentLang = aioMeta.config.language || 'en-US';
  const langKey = currentLang as SupportedLanguage;

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value as SupportedLanguage;
    const customUrl = getCustomArtUrl(code);
    setAioMeta((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        config: {
          ...prev.config,
          language: code,
          posterRatingProvider: 'custom',
          customPosterUrlPattern: customUrl,
          customThumbnailUrlPattern: customUrl,
        }
      };
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-4 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-50/50 to-white shrink-0">
      <div className="brand text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          {translateText('Nuvio Account Builder', langKey) || 'Nuvio Account Builder'}
        </h1>
        <p className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide text-slate-500 mt-1 uppercase">
          {translateText("AIO Meta & Nuvio Configurator v2.1", langKey) || "AIO Meta & Nuvio Configurator v2.1"}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm w-full sm:w-auto justify-center">
          <Globe className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          <select 
            value={currentLang} 
            onChange={handleLangChange}
            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer appearance-none pr-4 w-full sm:w-auto text-center sm:text-left"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
        <a 
          href="https://ko-fi.com/particularcatch" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white bg-rose-500 font-semibold flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm hover:bg-rose-600 transition-all shadow-sm hover:shadow-md shrink-0 w-full sm:w-auto"
        >
          <Coffee className="w-4 h-4" /> {translateText('Support the Dev', langKey) || 'Support the Dev'}
        </a>
      </div>
    </header>
  );
}

function AppContent() {
  const { aioMeta } = useConfig();
  const currentLang = aioMeta?.config?.language || 'en-US';
  const isRtl = currentLang === 'ar-SA';

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className={`min-h-screen bg-white text-slate-900 flex flex-col font-sans ${isRtl ? '[&_svg]:mr-[unset] [&_svg]:ml-2 text-right [&_button_*]:ml-2 [&_button_*]:mr-[unset]' : ''}`}>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">
        <Wizard />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}
