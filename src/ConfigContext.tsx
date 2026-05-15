import React, { createContext, useContext, useState } from 'react';
import defaultAioMeta from './data/aioMetaBase.json';
import defaultNuvioCols from './data/nuvioCollections.json';

export interface Catalog {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  showInHome: boolean;
  source?: string;
  displayType?: string;
}

export interface AioMeta {
  version: string;
  exportedAt: string;
  config: {
    apiKeys: Record<string, string>;
    catalogs: Catalog[];
    [key: string]: any;
  };
  metadata: any;
}

export interface NuvioCollection {
  id: string;
  title: string;
  folders: {
    id: string;
    title: string;
    catalogSources: {
      type: string;
      addonId: string;
      catalogId: string;
    }[];
    [key: string]: any;
  }[];
  [key: string]: any;
}

export type SetupMode = 'streams' | 'collections' | 'both' | null;

export interface StreamsConfig {
  debrid: {
    tb: { enabled: boolean; key: string };
    rd: { enabled: boolean; key: string };
    ad: { enabled: boolean; key: string };
    pm: { enabled: boolean; key: string };
    dl: { enabled: boolean; key: string };
    do: { enabled: boolean; key: string };
  };
  performance: {
    limitSpeed: boolean;
    internetSpeed: number;
    sortPref: 'quality' | 'speed';
    excludeUncached: boolean;
  };
  rules: {
    enableAnime: boolean;
    autoplayMethod: 'matchingFile' | 'matchingIndex' | 'firstFile';
    languages: string[];
    resLimit: number;
    excludeCams: boolean;
  };
  visual: {
    style: 'default' | 'essential' | 'complex' | 'pro' | 'custom';
    customName: string;
    customDesc: string;
  };
  httpStreaming: {
    enabled: boolean;
    sootio: boolean;
    hdhub: boolean;
  };
}

const defaultStreamsConfig: StreamsConfig = {
  debrid: {
    tb: { enabled: false, key: '' },
    rd: { enabled: false, key: '' },
    ad: { enabled: false, key: '' },
    pm: { enabled: false, key: '' },
    dl: { enabled: false, key: '' },
    do: { enabled: false, key: '' },
  },
  performance: {
    limitSpeed: false,
    internetSpeed: 100,
    sortPref: 'quality',
    excludeUncached: false,
  },
  rules: {
    enableAnime: false,
    autoplayMethod: 'matchingFile',
    languages: ['English'],
    resLimit: 5,
    excludeCams: true,
  },
  visual: {
    style: 'default',
    customName: '',
    customDesc: '',
  },
  httpStreaming: {
    enabled: false,
    sootio: false,
    hdhub: false,
  }
};

interface ConfigContextType {
  aioMeta: AioMeta | null;
  nuvioCols: NuvioCollection[] | null;
  setupMode: SetupMode;
  streamsConfig: StreamsConfig;
  setAioMeta: React.Dispatch<React.SetStateAction<AioMeta | null>>;
  setNuvioCols: React.Dispatch<React.SetStateAction<NuvioCollection[] | null>>;
  setSetupMode: React.Dispatch<React.SetStateAction<SetupMode>>;
  setStreamsConfig: React.Dispatch<React.SetStateAction<StreamsConfig>>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aioMeta, setAioMeta] = useState<AioMeta | null>(defaultAioMeta as any);
  const [nuvioCols, setNuvioCols] = useState<NuvioCollection[] | null>(defaultNuvioCols as any);
  const [setupMode, setSetupMode] = useState<SetupMode>(null);
  const [streamsConfig, setStreamsConfig] = useState<StreamsConfig>(defaultStreamsConfig);

  return (
    <ConfigContext.Provider value={{
      aioMeta, nuvioCols, setupMode, streamsConfig,
      setAioMeta, setNuvioCols, setSetupMode, setStreamsConfig
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error("useConfig must be used within ConfigProvider");
  return context;
};

