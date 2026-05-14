import React, { useState, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, ArrowRight, RefreshCw, Layers, Server } from 'lucide-react';
import { useConfig } from '../ConfigContext';
import { translateText, SupportedLanguage } from '../data/translations';
import { getCustomArtUrl } from '../lib/utils';
import baseStreamsWithDebrid from '../data/streams-with-debrid.json';
import baseStreamsWithoutDebrid from '../data/streams-without-debrid.json';

const STYLE_PREVIEWS = {
  "default": {
      debrid: { 
          name: "{stream.resolution::exists[\"{stream.resolution::replace('2160p','4K')::replace('1080p','HD')::replace('720p','SD')}\"||\"\"]} {stream.quality::exists[\"{stream.quality::replace('REMUX','+')::replace('BluRay','⭐⭐⭐⭐⭐')::replace('WEB-DL','⭐⭐⭐⭐')::replace('WEBRip','⭐⭐⭐⭐')}\"||\"\"]} {service.cached::istrue[\"⚡\"||\"⏳\"]}", 
          description: "{stream.type::=usenet[\"📦 USN \"||\"\"]}{stream.title::exists[\"🎬 {stream.title}\"||\"\"]}{stream.seasonEpisode::exists[\" - {stream.seasonEpisode::join(' ')}\"||\"\"]}{stream.year::exists[\" ({stream.year})\"||\"\"]}\n{service.cached::istrue[\"🟢 INSTANT PLAY\"||\"🔴 NEEDS TO DOWNLOAD\"]}\n─────────────\n{stream.languageEmojis::exists[\"Languages: {stream.languageEmojis}\"||\"\"]}\n{stream.quality::exists[\"✨ {stream.quality::replace('REMUX','+')::replace('BluRay','Premium Quality')::replace('WEB-DL','Streaming Quality')::replace('WEBRip','Streaming Quality')}\"||\"\"]}{stream.visualTags::~HDR::istrue[\" | 🌈 HDR\"||\"\"]}{stream.visualTags::~DV::istrue[\" | 🎥 Dolby Vision\"||\"\"]}{stream.audioTags::exists[\" | 🔊 {stream.audioTags::join(', ')}\"||\"\"]}\n─────────────\n📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]}{service.name::exists[\" | ☁️ {service.name}\"||\"\"]}{service.cached::isfalse[\" | 👥 {stream.seeders}\"||\"\"]}{addon.name::exists[\" | 🛰️ {addon.name}\"||\"\"]}" 
      },
      torrent: { 
          name: "{stream.resolution::exists[\"{stream.resolution::replace('2160p','4K')::replace('1080p','HD')::replace('720p','SD')}\"||\"\"]} {stream.quality::exists[\"{stream.quality::replace('REMUX','+')::replace('BluRay','⭐⭐⭐⭐⭐')::replace('WEB-DL','⭐⭐⭐⭐')::replace('WEBRip','⭐⭐⭐⭐')}\"||\"\"]} 👥 {stream.seeders}", 
          description: "{stream.title::exists[\"🎬 {stream.title}\"||\"\"]}{stream.seasonEpisode::exists[\" - {stream.seasonEpisode::join(' ')}\"||\"\"]}{stream.year::exists[\" ({stream.year})\"||\"\"]}\n─────────────\n{stream.languageEmojis::exists[\"Languages: {stream.languageEmojis}\"||\"\"]}\n{stream.quality::exists[\"✨ {stream.quality::replace('REMUX','+')::replace('BluRay','Premium Quality')::replace('WEB-DL','Streaming Quality')::replace('WEBRip','Streaming Quality')}\"||\"\"]}{stream.visualTags::~HDR::istrue[\" | 🌈 HDR\"||\"\"]}{stream.visualTags::~DV::istrue[\" | 🎥 Dolby Vision\"||\"\"]}{stream.audioTags::exists[\" | 🔊 {stream.audioTags::join(', ')}\"||\"\"]}\n─────────────\n📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]} | 👥 {stream.seeders}{addon.name::exists[\" | 🛰️ {addon.name}\"||\"\"]}" 
      }
  },
  "essential": {
      debrid: { name: "{stream.title::exists[\"{stream.title}\"||\"\"]}", description: "📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]} - {stream.languageEmojis::exists[\"{stream.languageEmojis}\"||\"\"]}" },
      torrent: { name: "{stream.title::exists[\"{stream.title}\"||\"\"]}", description: "👥 {stream.seeders} - 📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]} - {stream.languageEmojis::exists[\"{stream.languageEmojis}\"||\"\"]}" }
  },
  "complex": {
      debrid: { name: "[{service.name::exists[\"{service.name}\"||\"P2P\"]}] {stream.title::exists[\"{stream.title}\"||\"\"]} 📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]}", description: "{stream.visualTags::exists[\"{stream.visualTags::join(', ')}\"||\"\"]} {stream.audioTags::exists[\"{stream.audioTags::join(', ')}\"||\"\"]}" },
      torrent: { name: "[P2P] {stream.title::exists[\"{stream.title}\"||\"\"]} 📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]}", description: "👥 {stream.seeders} · {stream.visualTags::exists[\"{stream.visualTags::join(', ')}\"||\"\"]} {stream.audioTags::exists[\"{stream.audioTags::join(', ')}\"||\"\"]}" }
  },
  "pro": {
      debrid: { name: "{stream.title::exists[\"{stream.title}\"||\"\"]} | {stream.quality::exists[\"{stream.quality}\"||\"\"]}", description: "📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]} · ✨ {stream.visualTags::exists[\"{stream.visualTags::join(', ')}\"||\"\"]} · 🔊 {stream.audioTags::exists[\"{stream.audioTags::join(', ')}\"||\"\"]}" },
      torrent: { name: "{stream.title::exists[\"{stream.title}\"||\"\"]} | {stream.quality::exists[\"{stream.quality}\"||\"\"]}", description: "👥 {stream.seeders} · 📂 {stream.size::>0[\"{stream.size::bytes}\"||\"\"]} · ✨ {stream.visualTags::exists[\"{stream.visualTags::join(', ')}\"||\"\"]} · 🔊 {stream.audioTags::exists[\"{stream.audioTags::join(', ')}\"||\"\"]}" }
  }
};

export function StepExport({ onPrev }: { onPrev: () => void }) {
  const { aioMeta, nuvioCols, setupMode, streamsConfig } = useConfig();
  const [downloadedAio, setDownloadedAio] = useState(false);
  const [downloadedAio1, setDownloadedAio1] = useState(false);
  const [downloadedAio2, setDownloadedAio2] = useState(false);
  const [downloadedNuvio, setDownloadedNuvio] = useState(false);
  const [downloadedStreams, setDownloadedStreams] = useState<Record<string, boolean>>({});

  if (!aioMeta || !nuvioCols) return null;

  const lang = (aioMeta.config.language as SupportedLanguage) || 'en-US';

  // Compute clean Nuvio Collections
  const getSortedEnabledCatalogs = () => {
    const orderedIds: string[] = [];
    nuvioCols.forEach((col: any) => {
      col.folders?.forEach((folder: any) => {
        folder.catalogSources?.forEach((src: any) => {
          if (src.catalogId && !orderedIds.includes(src.catalogId)) {
            orderedIds.push(src.catalogId);
          }
        });
        folder.sources?.forEach((src: any) => {
          if (src.catalogId && !orderedIds.includes(src.catalogId)) {
            orderedIds.push(src.catalogId);
          }
        });
      });
    });

    const orderMap = new Map();
    orderedIds.forEach((id, index) => {
      orderMap.set(id, index);
      const baseId = id.replace(/_(movie|series)$/, '');
      if (!orderMap.has(baseId)) orderMap.set(baseId, index);
    });

    const enabled = aioMeta.config.catalogs.filter((c: any) => c.enabled);
    enabled.sort((a: any, b: any) => {
      const aIdx = orderMap.has(a.id) ? orderMap.get(a.id) : 999999;
      const bIdx = orderMap.has(b.id) ? orderMap.get(b.id) : 999999;
      return aIdx - bIdx;
    });
    return enabled;
  };

  const computeCleanNuvio = (catalogIdsAllowed?: Set<string>) => {
    const enabledCatalogIds = catalogIdsAllowed || new Set(aioMeta.config.catalogs.filter((c: any) => c.enabled).map((c: any) => c.id));
    
    // Deep clone and filter
    const cleanNuvio = JSON.parse(JSON.stringify(nuvioCols));
    
    cleanNuvio.forEach((col: any) => {
      const originalColTitle = col.title || '';
      // Translate banner title
      col.title = translateText(col.title, lang) || col.title;

      if (col.folders) {
        let allFoldersSingleSource = true;
        
        col.folders.forEach((folder: any) => {
          // Translate folder title
          folder.title = translateText(folder.title, lang) || folder.title;
          
          const lowerOriginalTitle = originalColTitle.toLowerCase();
          const shouldHideTitle = [
            'actors', 'franchises', 'streaming platforms', 'directors',
            'awards', 'international', 'production studios'
          ].some(c => lowerOriginalTitle.includes(c));

          folder.hideTitle = shouldHideTitle || lang === 'en-US';

          if (folder.catalogSources) {
            folder.catalogSources = folder.catalogSources.filter((src: any) => {
              if (enabledCatalogIds.has(src.catalogId)) return true;
              if (src.catalogId && enabledCatalogIds.has(src.catalogId.replace(/_(movie|series)$/, ''))) {
                return true;
              }
              return false;
            });
          }
          if (folder.sources) {
            folder.sources = folder.sources.filter((src: any) => {
              if (enabledCatalogIds.has(src.catalogId)) return true;
              if (src.catalogId && enabledCatalogIds.has(src.catalogId.replace(/_(movie|series)$/, ''))) {
                return true;
              }
              return false;
            });
          }
          
          const maxCount = Math.max(
            folder.catalogSources ? folder.catalogSources.length : 0,
            folder.sources ? folder.sources.length : 0
          );
          
          if (maxCount > 1) {
            allFoldersSingleSource = false;
          }
        });
        
        // Remove empty folders
        col.folders = col.folders.filter((folder: any) => folder.catalogSources?.length > 0 || folder.sources?.length > 0);
        
        if (allFoldersSingleSource && col.folders.length > 0) {
          col.viewMode = "TABBED_GRID";
        }
      }
    });

    // Remove empty collections
    return cleanNuvio.filter((n: any) => n.folders?.length > 0);
  };

  const downloadFile = (filename: string, content: string, setter: (val: boolean) => void) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setter(true);
  };

  const cleanAioFile = (fileObj: any) => {
    const cleaned = JSON.parse(JSON.stringify(fileObj));
    return cleaned;
  };

  const handleDownloadAio = (part: 1 | 2 | 'all') => {
    const enabledCatalogs = getSortedEnabledCatalogs();
    const processAioExport = (catalogsSubset: any[]) => {
      const allowedIds = new Set(catalogsSubset.map(c => c.id));
      const file = cleanAioFile(aioMeta);

      // Do not use random TMDB keys anymore

      // Remove apiKeysExcluded to carry over API Keys into AIO Meta Data
      // AIO Meta ui checks metadata.apiKeysExcluded, so we explicitly set it to false
      if (!file.metadata) file.metadata = {};
      file.metadata.apiKeysExcluded = false;
      
      // Set rating poster provider to custom and apply language-specific patterns
      file.config.posterRatingProvider = "custom";
      const customUrl = getCustomArtUrl(file.config.language || 'en-US');
      file.config.customPosterUrlPattern = customUrl;
      file.config.customThumbnailUrlPattern = customUrl;

      // Remove completely those that are not in this subset and sort to match nuvio collections order
      const sortMap = new Map();
      catalogsSubset.forEach((c, idx) => sortMap.set(c.id, idx));
      
      file.config.catalogs = file.config.catalogs.filter((c: any) => allowedIds.has(c.id));
      file.config.catalogs.sort((a: any, b: any) => {
        const aIdx = sortMap.has(a.id) ? sortMap.get(a.id) : 999999;
        const bIdx = sortMap.has(b.id) ? sortMap.get(b.id) : 999999;
        return aIdx - bIdx;
      });

      // Define logical catalogs to forcefully show on the home screen
      const homeEnabledIds = new Set([
        "mdblist.86934", // New Streaming Releases: Movies
        "mdblist.2194", // New Streaming Releases: Series
      ]);

      // All catalogs should be hidden from home, EXCEPT the two specifies above
      file.config.catalogs.forEach((c: any) => {
        c.enabled = true;
        c.showInHome = homeEnabledIds.has(c.id);
      });
      
      // If gemini API key is provided, enable AI search
      if (file.config.apiKeys && file.config.apiKeys.gemini && file.config.apiKeys.gemini.trim() !== "") {
        file.config.search = file.config.search || {};
        file.config.search.enabled = true;
        file.config.search.ai_enabled = true;
        file.config.search.ai_provider = "gemini";
        file.config.search.ai_model = "gemini-2.5-flash-lite";
        file.config.search.engineEnabled = file.config.search.engineEnabled || {};
        file.config.search.engineEnabled["gemini.search"] = true;
        
        if (file.config.search.searchOrder && !file.config.search.searchOrder.includes("gemini.search")) {
          const insertIdx = file.config.search.searchOrder.indexOf("tvdb.collections.search");
          if (insertIdx !== -1) {
            file.config.search.searchOrder.splice(insertIdx + 1, 0, "gemini.search");
          } else {
            file.config.search.searchOrder.push("gemini.search");
          }
        }
      }

      return file;
    };

    if (part === 'all') {
      const exportAio = processAioExport(enabledCatalogs);
      downloadFile('aio_meta.json', JSON.stringify(exportAio, null, 2), setDownloadedAio);
    } else if (part === 1) {
      const exportAio1 = processAioExport(enabledCatalogs.slice(0, 250));
      downloadFile('aio_meta_part1.json', JSON.stringify(exportAio1, null, 2), setDownloadedAio1);
    } else if (part === 2) {
      const exportAio2 = processAioExport(enabledCatalogs.slice(250));
      downloadFile('aio_meta_part2.json', JSON.stringify(exportAio2, null, 2), setDownloadedAio2);
    }
  };

  const handleDownloadNuvio = () => {
    const enabledCatalogs = getSortedEnabledCatalogs();
    const enabledCatalogIds = new Set<string>(enabledCatalogs.map((c: any) => c.id as string));
    const cleanNuvio = computeCleanNuvio(enabledCatalogIds);
    downloadFile('nuvio_collections.json', JSON.stringify(cleanNuvio, null, 2), setDownloadedNuvio);
  };

  const buildStreamsIterations = () => {
    const iter = [];
    const langs = streamsConfig.rules.languages;
    if (langs.length > 1) {
      langs.forEach(lang => {
        if (lang === 'English') return;
        iter.push({ lang, filename: `Nuvio_Streams_${lang}.json`, name: `Nuvio Streams (${lang})` });
      });
      if (langs.includes('English')) {
        iter.push({ lang: 'English', filename: `Nuvio_Streams_English.json`, name: `Nuvio Streams (English)` });
      }
    } else if (langs.length === 1) {
      iter.push({ lang: langs[0], filename: 'nuvio_streams_config.json', name: 'Nuvio Streams' });
    } else {
      iter.push({ lang: 'English', filename: 'nuvio_streams_config.json', name: 'Nuvio Streams' });
    }
    return iter;
  };

  const handleDownloadStreams = (iterInfo: any) => {
    const hasDebrid = streamsConfig.debrid.rd.enabled || streamsConfig.debrid.tb.enabled || streamsConfig.debrid.pm.enabled || streamsConfig.debrid.ad.enabled || streamsConfig.debrid.dl.enabled;
    const baseObj = hasDebrid ? baseStreamsWithDebrid : baseStreamsWithoutDebrid;
    const base = JSON.parse(JSON.stringify(baseObj));

    base.addonName = iterInfo.name;
    // Removed Dave logo
    base.addonLogo = "https://raw.githubusercontent.com/ParticularCatch449/aio-tvflix-builder/main/Untitled-design_20250422_200739_0000.png?raw=true"; 

    // Do not export TMDB keys
    delete base.tmdbApiKey;
    delete base.tmdbAccessToken;
    base.tvdbApiKey = aioMeta.config.apiKeys.tvdb || '';

    // Automatically disable all catalogues from the aiostreams file
    if (base.addons && Array.isArray(base.addons)) {
      base.addons.forEach((addon: any) => {
        if (addon.options && Array.isArray(addon.options.resources)) {
          addon.options.resources = addon.options.resources.filter((r: string) => r !== "catalog");
        }
      });
    }

    base.resultLimits = { resolution: streamsConfig.rules.resLimit };

    if (base.autoPlay) base.autoPlay.method = streamsConfig.rules.autoplayMethod;
    base.excludeUncached = !!streamsConfig.performance.excludeUncached;

    // Bitrate Limits Calculation
    if (streamsConfig.performance.limitSpeed) {
        const mbps = streamsConfig.performance.internetSpeed || 100;
        const maxBitrate = Math.floor(mbps * 1000000 * 0.8);
        base.bitrate = {
            global: {
                movies: [0, maxBitrate],
                series: [0, maxBitrate],
                anime: [0, maxBitrate]
            }
        };
    }

    // Sort Preference
    const sortPref = streamsConfig.performance.sortPref;
    const sizeSortDir = sortPref === 'speed' ? 'asc' : 'desc';
    if (base.sortCriteria && base.sortCriteria.global) {
        const sizeObj = base.sortCriteria.global.find((x: any) => x.key === 'size');
        if (sizeObj) sizeObj.direction = sizeSortDir;
    }

    // Audio Languages
    if (iterInfo.lang === 'English') {
        base.requiredLanguages = [];
        base.preferredLanguages = ["English"];
    } else {
        base.requiredLanguages = [iterInfo.lang];
        base.preferredLanguages = [];
    }

    // Sort Logic: Language then Resolution
    if (base.sortCriteria && base.sortCriteria.global) {
        base.sortCriteria.global = base.sortCriteria.global.filter((x: any) => x.key !== 'language');
        base.sortCriteria.global.unshift({ "key": "language", "direction": "desc" });

        base.sortCriteria.global = base.sortCriteria.global.filter((x: any) => x.key !== 'resolution');
        base.sortCriteria.global.unshift({ "key": "resolution", "direction": "desc" });
    }

    // Stremio visual formatting
    if (streamsConfig.visual.style === 'custom') {
        if (base.formatter) {
            base.formatter.definition = {
                name: streamsConfig.visual.customName,
                description: streamsConfig.visual.customDesc
            };
        }
    } else if (streamsConfig.visual.style !== 'default') {
        const selectedStyle = STYLE_PREVIEWS[streamsConfig.visual.style as keyof typeof STYLE_PREVIEWS];
        const formatData = hasDebrid ? selectedStyle.debrid : selectedStyle.torrent;
        if (base.formatter) {
            base.formatter.definition = formatData;
        }
    }

    // Inject Debrid Provider credentials
    if (hasDebrid && base.services) {
      const debridMap: Record<string, string> = { rd: 'realdebrid', tb: 'torbox', ad: 'alldebrid', pm: 'premiumize', dl: 'debridlink' };
      for (const [key, id] of Object.entries(debridMap)) {
        const svc = base.services.find((s: any) => s.id === id);
        const conf = streamsConfig.debrid[key as keyof typeof streamsConfig.debrid];
        if (svc) {
          svc.enabled = conf.enabled;
          if (svc.enabled) {
            svc.credentials = svc.credentials || {};
            svc.credentials.apiKey = conf.key || "";
          }
        }
      }
    }

    if (hasDebrid && base.presets) {
      if (streamsConfig.debrid.rd.enabled) {
        base.presets.push({
            "type": "realdebrid",
            "instanceId": "rd1",
            "enabled": true,
            "options": {
                "name": "Real-Debrid Scraper",
                "timeout": 6000,
                "resources": ["stream"],
                "realdebridApiKey": streamsConfig.debrid.rd.key || "",
                "mediaTypes": []
            }
        });
      }
      if (streamsConfig.debrid.tb.enabled) {
        base.presets.push({
            "type": "torbox",
            "instanceId": "tb1",
            "enabled": true,
            "options": {
                "name": "Torbox Scraper",
                "timeout": 6000,
                "resources": ["stream"],
                "torboxApiKey": streamsConfig.debrid.tb.key || "",
                "mediaTypes": []
            }
        });
      }
      if (streamsConfig.debrid.ad.enabled) {
        base.presets.push({
            "type": "alldebrid",
            "instanceId": "ad1",
            "enabled": true,
            "options": {
                "name": "AllDebrid Scraper",
                "timeout": 6000,
                "resources": ["stream"],
                "alldebridApiKey": streamsConfig.debrid.ad.key || "",
                "mediaTypes": []
            }
        });
      }
      if (streamsConfig.debrid.pm.enabled) {
        base.presets.push({
            "type": "premiumize",
            "instanceId": "pm1",
            "enabled": true,
            "options": {
                "name": "Premiumize Scraper",
                "timeout": 6000,
                "resources": ["stream"],
                "premiumizeApiKey": streamsConfig.debrid.pm.key || "",
                "mediaTypes": []
            }
        });
      }
      if (streamsConfig.debrid.dl.enabled) {
        base.presets.push({
            "type": "debridlink",
            "instanceId": "dl1",
            "enabled": true,
            "options": {
                "name": "DebridLink Scraper",
                "timeout": 6000,
                "resources": ["stream"],
                "debridlinkApiKey": streamsConfig.debrid.dl.key || "",
                "mediaTypes": []
            }
        });
      }
      if (streamsConfig.debrid.do.enabled) {
        base.presets.push({
            "type": "debridio",
            "instanceId": "1d0",
            "enabled": true,
            "options": {
                "name": "Debridio Scraper",
                "timeout": 4000,
                "resources": ["stream"],
                "debridioApiKey": streamsConfig.debrid.do.key || "",
                "mediaTypes": []
            }
        });
      }
    }
    
    // Group Sorting Logic setup
    if (base.groups) {
        const fallthroughCond = "(count(resolution(cached(totalStreams), '2160p')) < 5 and count(resolution(cached(totalStreams), '1080p')) < 5 and count(resolution(cached(totalStreams), '720p')) < 5)";
        if (hasDebrid) {
            let group1 = ["1c5"];
            if (streamsConfig.debrid.do.enabled) {
                group1.push("1d0");
            }
            if (streamsConfig.rules.enableAnime) {
                group1.push("f89"); // AnimeTosho
            }
            
            let group2 = ["12a", "e7b"]; // StremThru Torz, Zilean
            
            let group3: string[] = []; // TorrentsDB removed per instructions
            if (streamsConfig.rules.enableAnime) {
                group3.push("1bd"); // SeaDex
            }
            
            base.groups.groupings = [
              {
                "addons": group1,
                "condition": "true"
              },
              {
                "addons": group2,
                "condition": `${fallthroughCond} and totalTimeTaken < 5000`
              }
            ];

            if (group3.length > 0) {
              base.groups.groupings.push({
                "addons": group3,
                "condition": fallthroughCond
              });
            }
        } else {
            // No debrid
            // "with anime no debrid use the same as no anime"
            // removing torrentio since it's dead
            base.groups.groupings = [
              {
                "addons": ["1c5"], // Comet
                "condition": "true"
              },
              {
                "addons": ["e7b"], // StremThru Torz
                "condition": `${fallthroughCond} and totalTimeTaken < 5000`
              }
            ];
        }
    }

    base.useRuntimeFromMetadataProviders = false;
    base.runtimeFromMetadataProviders = false;
    if (!base.bitrate) base.bitrate = { global: {} };
    base.bitrate.useMetadataRuntime = false;

    if (streamsConfig.rules.excludeCams) {
        if (!base.keywordFilter) base.keywordFilter = {};
        if (!base.keywordFilter.global) base.keywordFilter.global = {};
        if (!base.keywordFilter.global.exclude) base.keywordFilter.global.exclude = [];
        base.keywordFilter.global.exclude = ["\\bcam\\b", "\\bhdcam\\b", "\\bts\\b", "\\bhdts\\b", "\\btelesync\\b", "\\btelecine\\b", "\\btc\\b"];
    }

    if (base.presets && base.groups && base.groups.groupings) {
        const activeAddonIds = new Set<string>();
        base.groups.groupings.forEach((g: any) => {
            if (g.addons) {
                g.addons.forEach((id: string) => activeAddonIds.add(id));
            }
        });
        
        const debridScraperIds = ["rd1", "tb1", "ad1", "pm1", "dl1", "1d0"]; 
        base.presets = base.presets.filter((p: any) => activeAddonIds.has(p.instanceId) || debridScraperIds.includes(p.instanceId));
    }

    if (base.presets) {
        base.presets.forEach((preset: any) => {
            if (preset.options && preset.options.resources) {
                preset.options.resources = preset.options.resources.filter((r: string) => r !== 'catalog');
            }
        });
    }

    if (base.services) {
        base.services = base.services.filter((s: any) => s.enabled === true);
    }

    downloadFile(iterInfo.filename, JSON.stringify(base, null, 2), () => {
      setDownloadedStreams(prev => ({ ...prev, [iterInfo.filename]: true }));
    });
  };

  const enabledCatalogs = getSortedEnabledCatalogs();
  const isSplitProfile = enabledCatalogs.length > 250;
  const streamIterations = buildStreamsIterations();

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 border-b pb-4">{translateText("You're All Set!", lang) || "You're All Set!"}</h2>
          <p className="text-slate-500 text-base leading-relaxed">
            {translateText("Download your configured files. Follow the instructions to install them.", lang) || "Download your configured files. Follow the instructions to install them."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          
          {/* STREAMS DOWNLOAD */}
          {(setupMode === 'streams' || setupMode === 'both') && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-start relative group transition-shadow hover:shadow-md">
              <div className="h-12 w-12 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{translateText("Streams Configuration", lang) || "Streams Configuration"}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1 leading-relaxed">
                {translateText("Use this optimized config file within AIO Streams. It contains your API keys, performance targets, and provider rules.", lang) || "Use this optimized config file within AIO Streams. It contains your API keys, performance targets, and provider rules."}
              </p>
              <div className="flex flex-col gap-3 w-full">
                {streamIterations.map((iter, idx) => (
                  <Button 
                    key={idx}
                    onClick={() => handleDownloadStreams(iter)} 
                    variant={downloadedStreams[iter.filename] ? "outline" : "default"}
                    className={`flex-1 gap-2 rounded-xl text-sm py-6 font-semibold transition-all ${downloadedStreams[iter.filename] ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800' : 'hover:shadow-md'}`}
                  >
                    <Download className="w-4 h-4" />
                    {downloadedStreams[iter.filename] ? `${translateText("Downloaded AIO Streams", lang) || "Downloaded AIO Streams"} ${iter.name.replace('Nuvio Streams', '').trim()}` : `${translateText("Download AIO Streams", lang) || "Download AIO Streams"} ${iter.name.replace('Nuvio Streams', '').trim()}`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* METADATA DOWNLOADS */}
          {(setupMode === 'collections' || setupMode === 'both') && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-start relative group transition-shadow hover:shadow-md">
                
                <div className="h-12 w-12 shrink-0 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{translateText("Metadata Configuration", lang) || "Metadata Configuration"}</h3>
                <p className="text-slate-500 text-sm mb-8 flex-1 leading-relaxed">
                  {translateText("Use this optimized config file within AIO Meta. It contains your API keys, settings, and enabled catalogs.", lang) || "Use this optimized config file within AIO Meta. It contains your API keys, settings, and enabled catalogs."}
                </p>
                
                {!isSplitProfile ? (
                  <Button 
                    onClick={() => handleDownloadAio('all')} 
                    variant={downloadedAio ? "outline" : "default"}
                    className={`w-full gap-2 rounded-xl text-sm py-6 font-semibold transition-all ${downloadedAio ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800' : 'hover:shadow-md'}`}
                  >
                    <Download className="w-4 h-4" />
                    {downloadedAio ? (translateText("Downloaded aio_meta.json", lang) || "Downloaded aio_meta.json") : (translateText("Download aio_meta.json", lang) || "Download aio_meta.json")}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3 w-full">
                    <Button 
                      onClick={() => handleDownloadAio(1)} 
                      variant={downloadedAio1 ? "outline" : "default"}
                      className={`w-full gap-2 rounded-xl text-sm py-6 font-semibold transition-all ${downloadedAio1 ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800' : 'hover:shadow-md'}`}
                    >
                      <Download className="w-4 h-4" />
                      {downloadedAio1 ? (translateText("Downloaded Part 1", lang) || "Downloaded Part 1") : (translateText("Download Part 1 (First 250)", lang) || "Download Part 1 (First 250)")}
                    </Button>
                    <Button 
                      onClick={() => handleDownloadAio(2)} 
                      variant={downloadedAio2 ? "outline" : "default"}
                      className={`w-full gap-2 rounded-xl text-sm py-6 font-semibold transition-all ${downloadedAio2 ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800' : 'hover:shadow-md'}`}
                    >
                      <Download className="w-4 h-4" />
                      {downloadedAio2 ? (translateText("Downloaded Part 2", lang) || "Downloaded Part 2") : (translateText("Download Part 2 (Remaining)", lang) || "Download Part 2 (Remaining)")}
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-start relative group transition-shadow hover:shadow-md">
                
                <div className="h-12 w-12 shrink-0 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{translateText("Nuvio Collections", lang) || "Nuvio Collections"}</h3>
                <p className="text-slate-500 text-sm mb-8 flex-1 leading-relaxed">
                  {translateText("Use this pruned layout file in Nuvio. It matches perfectly with the AIO Meta config you just built (empty folders automatically removed).", lang) || "Use this pruned layout file in Nuvio. It matches perfectly with the AIO Meta config you just built (empty folders automatically removed)."}
                </p>
                
                <Button 
                  onClick={handleDownloadNuvio} 
                  variant={downloadedNuvio ? "outline" : "default"}
                  className={`w-full gap-2 rounded-xl text-sm py-6 font-semibold transition-all ${downloadedNuvio ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800' : 'hover:shadow-md'}`}
                >
                  <Download className="w-4 h-4" />
                  {downloadedNuvio ? (translateText("Downloaded nuvio_collections.json", lang) || "Downloaded nuvio_collections.json") : (translateText("Download nuvio_collections.json", lang) || "Download nuvio_collections.json")}
                </Button>
              </div>
            </>
          )}
        </div>

        {((isSplitProfile && setupMode !== 'streams') || (streamIterations.length > 1 && setupMode !== 'collections')) && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-800 text-sm shadow-sm gap-3 flex items-start">
            <div className="bg-amber-100 p-2 rounded-lg shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="font-bold block text-base mb-1">{translateText("Important Notice regarding Multiple Addons:", lang) || "Important Notice regarding Multiple Addons:"}</strong>
              <p className="leading-relaxed">{translateText("You have generated multiple AIO Meta configurations (due to size limits) OR multiple AIO Streams configurations (for multiple languages). Since you need to install the addon multiple times into Nuvio/Stremio, you MUST create a", lang) || "You have generated multiple AIO Meta configurations (due to size limits) OR multiple AIO Streams configurations (for multiple languages). Since you need to install the addon multiple times into Nuvio/Stremio, you MUST create a"} <strong>{translateText("separate, distinct user account", lang) || "separate, distinct user account"}</strong> {translateText("on the AIO configurator websites for each JSON file you import. Installing the same account ID twice will cause them to overwrite each other.", lang) || "on the AIO configurator websites for each JSON file you import. Installing the same account ID twice will cause them to overwrite each other."}</p>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5 text-blue-800 text-sm shadow-sm gap-3 flex items-start">
          <div className="bg-blue-100 p-2 rounded-lg shrink-0 mt-0.5">
            <Server className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <strong className="font-bold block text-base mb-1">Trakt Integration</strong>
            <p className="leading-relaxed">To enable Trakt integration, you will need to go to your <strong className="font-semibold">Nuvio Catalogs</strong> section and link your Trakt account there. Import the layout file first to enable Trakt, then click Catalogs <ArrowRight className="w-3 h-3 inline-block mx-1" /> Trakt <ArrowRight className="w-3 h-3 inline-block mx-1" /> Sign in, and then save it.</p>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">{translateText("Comprehensive Installation Guide", lang) || "Comprehensive Installation Guide"}</h3>
          
          <div className="space-y-8">
            <div>
              <h4 className="font-bold text-sm tracking-wide text-slate-900 flex items-center gap-3">
                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                {translateText("Preparation", lang) || "Preparation"}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed mt-3 pl-9">
                {translateText("Use the download buttons above to get your custom configuration files.", lang) || "Use the download buttons above to get your custom configuration files."}
              </p>
            </div>

            {(setupMode === 'collections' || setupMode === 'both') && (
              <Fragment>
                <div>
                  <h4 className="font-bold text-sm tracking-wide text-slate-900 flex items-center gap-3">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span> 
                    {translateText("AIO Meta Data Setup", lang) || "AIO Meta Data Setup"}
                  </h4>
                  <div className="text-slate-600 text-sm leading-relaxed mt-3 pl-9 space-y-3">
                    <p>{translateText("1. Go to", lang) || "1. Go to"} <a href="https://aiometadata.viren070.me/configure/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">{translateText("AIO Meta Data Configurator", lang) || "AIO Meta Data Configurator"}</a>.</p>
                    <p>{translateText("2. Navigate to the", lang) || "2. Navigate to the"} <strong>{translateText("Configuration tab", lang) || "Configuration tab"}</strong> {translateText("and load the", lang) || "and load the"} <code className="bg-slate-200 text-slate-800 font-mono text-xs px-1.5 py-0.5 rounded">aio_meta.json</code> {translateText("you just downloaded.", lang) || "you just downloaded."}</p>
                    <p>{translateText("3. Verify your", lang) || "3. Verify your"} <strong>{translateText("API keys", lang) || "API keys"}</strong> {translateText("are present in the Integrations tab, and sync your Trakt TV in the catalogs section.", lang) || "are present in the Integrations tab, and sync your Trakt TV in the catalogs section."}</p>
                    <p>{translateText("4. Return to the Configuration tab, click", lang) || "4. Return to the Configuration tab, click"} <strong>{translateText("Save Configuration", lang) || "Save Configuration"}</strong>{translateText(", create a password, and copy the addon link to install into the", lang) || ", create a password, and copy the addon link to install into the"} <a href="https://nuvioapp.space/account?tab=addons" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">{translateText("Nuvio Addons tab", lang) || "Nuvio Addons tab"}</a>.</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm tracking-wide text-slate-900 flex items-center gap-3">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span> 
                    {translateText("Nuvio Collections Setup", lang) || "Nuvio Collections Setup"}
                  </h4>
                  <div className="text-slate-600 text-sm leading-relaxed mt-3 pl-9 space-y-3">
                    <p>{translateText("1. After installing the AIO addon in Nuvio, go to the", lang) || "1. After installing the AIO addon in Nuvio, go to the"} <a href="https://nuvioapp.space/account?tab=collections" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">{translateText("Collections tab", lang) || "Collections tab"}</a> {translateText("within the Nuvio interface.", lang) || "within the Nuvio interface."}</p>
                    <p>{translateText("2. Import the", lang) || "2. Import the"} <code className="bg-slate-200 text-slate-800 font-mono text-xs px-1.5 py-0.5 rounded">nuvio_collections.json</code> {translateText("file you generated here.", lang) || "file you generated here."}</p>
                    <p>{translateText("3. You should now see all of your selected collections flawlessly integrated!", lang) || "3. You should now see all of your selected collections flawlessly integrated!"}</p>
                  </div>
                </div>
              </Fragment>
            )}

            {(setupMode === 'streams' || setupMode === 'both') && (
              <div>
                <h4 className="font-bold text-sm tracking-wide text-slate-900 flex items-center gap-3">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">C</span> 
                  {translateText("Streams Setup", lang) || "Streams Setup"}
                </h4>
                <div className="text-slate-600 text-sm leading-relaxed mt-3 pl-9 space-y-3">
                  <p>{translateText("1. Go to", lang) || "1. Go to"} <a href="https://aiostreams.viren070.me/stremio/configure?menu=save-install" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">{translateText("AIO Streams Configurator", lang) || "AIO Streams Configurator"}</a>.</p>
                  <p>{translateText("2. Click the", lang) || "2. Click the"} <strong>{translateText("Save & Install", lang) || "Save & Install"}</strong> {translateText("tab.", lang) || "tab."}</p>
                  <p>{translateText("3. Click", lang) || "3. Click"} <strong>{translateText("Import", lang) || "Import"}</strong> {translateText("then", lang) || "then"} <strong>{translateText("Import Config", lang) || "Import Config"}</strong> {translateText("to load your stream JSON file.", lang) || "to load your stream JSON file."}</p>
                  <p>{translateText("4. Click Save, create a password, and click the", lang) || "4. Click Save, create a password, and click the"} <strong>{translateText("Copy Install Link", lang) || "Copy Install Link"}</strong> {translateText("button, then install it in the", lang) || "button, then install it in the"} <a href="https://nuvioapp.space/account?tab=addons" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">{translateText("Nuvio Addons tab", lang) || "Nuvio Addons tab"}</a>.</p>
                  {streamIterations.length > 1 && (
                    <div className="mt-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <strong>{translateText("Note on Multi-Language:", lang) || "Note on Multi-Language:"}</strong> {translateText("Since you selected multiple audio languages, you have multiple stream files to download. Repeat these steps for each file to create separate Stremio addons.", lang) || "Since you selected multiple audio languages, you have multiple stream files to download. Repeat these steps for each file to create separate Stremio addons."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex justify-between pt-8 mt-8 border-t border-slate-200 shrink-0">
        <Button variant="outline" onClick={onPrev} className="gap-2 rounded-xl text-slate-600 px-6 py-5 font-medium transition-colors hover:bg-slate-100">
          <ArrowLeft className="w-4 h-4" /> {translateText("Go Back", lang) || "Go Back"}
        </Button>
      </div>
    </div>
  );
}
