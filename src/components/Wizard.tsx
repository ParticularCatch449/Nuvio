import React, { useState, useMemo } from 'react';
import { StepWelcome } from './StepWelcome';
import { StepLanguage } from './StepLanguage';
import { StepApiKeys } from './StepApiKeys';
import { StepCollections } from './StepCollections';
import { StepExport } from './StepExport';
import { useConfig } from '../ConfigContext';
import { SupportedLanguage, translateText } from '../data/translations';

// We will need these components created shortly.
// But for now, we'll placeholder them or actually I should create them first?
// I will just use placeholder components if they aren't imported or I'll create them.

import { StepDebrid } from './streams/StepDebrid';
import { StepPerformance } from './streams/StepPerformance';
import { StepStreamRules } from './streams/StepStreamRules';
import { StepVisualStyle } from './streams/StepVisualStyle';
import { StepScrapers } from './streams/StepScrapers';

type StepRoute = { id: string, title: string, component: React.FC<any> };

export function Wizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const { aioMeta, setupMode, setSetupMode, streamsConfig } = useConfig();
  
  const langKey = ((aioMeta?.config?.language) || 'en-US') as SupportedLanguage;

  const steps = useMemo(() => {
    if (!setupMode) {
      return [{ id: 'welcome', title: 'Welcome', component: StepWelcome }];
    }

    const availableSteps: StepRoute[] = [
      { id: 'welcome', title: 'Welcome', component: StepWelcome }
    ];

    if (setupMode === 'streams' || setupMode === 'both') {
      availableSteps.push({ id: 'debrid', title: 'Debrid Providers', component: StepDebrid });
      
      const hasDebrid = streamsConfig.debrid.tb.enabled || streamsConfig.debrid.rd.enabled || streamsConfig.debrid.ad.enabled || streamsConfig.debrid.pm.enabled || streamsConfig.debrid.dl.enabled;
      if (hasDebrid) {
        availableSteps.push({ id: 'scrapers', title: 'Additional Scrapers', component: StepScrapers });
      }

      availableSteps.push({ id: 'performance', title: 'Performance', component: StepPerformance });
      availableSteps.push({ id: 'rules', title: 'Stream Rules', component: StepStreamRules });
      availableSteps.push({ id: 'visual', title: 'Visuals', component: StepVisualStyle });
    }

    if (setupMode === 'collections' || setupMode === 'both') {
      availableSteps.push({ id: 'language', title: 'Language', component: StepLanguage });
      availableSteps.push({ id: 'apikeys', title: 'API Keys', component: StepApiKeys });
      availableSteps.push({ id: 'collections', title: 'Collections', component: StepCollections });
    }

    availableSteps.push({ id: 'export', title: 'Export', component: StepExport });

    return availableSteps;
  }, [setupMode, streamsConfig]);

  const nextStep = () => setStepIndex((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => {
    if (stepIndex === 1) {
      // Going back to Welcome step, let's also clear the mode so they can reselect!
      setSetupMode(null);
    }
    setStepIndex((s) => Math.max(s - 1, 0));
  };

  // If the user somehow changes setupMode making the current index out of bounds
  const safeIndex = Math.min(stepIndex, steps.length - 1);
  const CurrentComponent = steps[safeIndex].component;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Stepper only show if setupMode is selected */}
      {setupMode && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-slate-200">
          {steps.slice(1).map((s, idx) => {
            // idx is 0-based for the stepper (ignoring Welcome step)
            // stepIndex = 0 is Welcome. So visual step is stepIndex - 1.
            const visualCurrentStep = safeIndex - 1;
            return (
              <React.Fragment key={idx}>
                <div className={`flex flex-col items-center gap-2 ${visualCurrentStep >= idx ? 'opacity-100' : 'opacity-50'} transition-opacity sm:flex-row`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold shrink-0 shadow-sm
                    ${visualCurrentStep === idx ? 'border-primary bg-primary text-white' : 
                      visualCurrentStep > idx ? 'border-primary text-primary bg-white' : 'border-slate-300 text-slate-500 bg-slate-50'}`}>
                    {idx + 1}
                  </div>
                  <div className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${visualCurrentStep >= idx ? 'text-slate-900' : 'text-slate-500'}`}>
                    {translateText(s.title, langKey) || s.title}
                  </div>
                </div>
                {idx < steps.length - 2 && (
                  <div className={`flex-1 h-0.5 min-w-[2rem] mx-2 lg:mx-4 rounded-full ${visualCurrentStep > idx ? 'bg-primary' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className="relative flex flex-col pt-4">
        <CurrentComponent onNext={nextStep} onPrev={prevStep} />
      </div>
    </div>
  );
}
