import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Search, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useConfig } from '../ConfigContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { translateText, SupportedLanguage } from '../data/translations';

function TriStateCheck({ state, onClick }: { state: 'checked' | 'unchecked' | 'partial', onClick: () => void }) {
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(); }} className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border cursor-pointer transition-colors ${state === 'checked' ? 'border-primary bg-primary text-white' : state === 'partial' ? 'border-primary bg-primary/20 text-primary' : 'border-slate-300 bg-white text-transparent hover:border-slate-400'}`}>
      {state === 'checked' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
      {state === 'partial' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
    </div>
  )
}

export function StepCollections({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { aioMeta, setAioMeta, nuvioCols, setNuvioCols } = useConfig();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'nameAsc' | 'nameDesc' | 'statusEnabled' | 'statusDisabled'>('default');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  if (!aioMeta || !nuvioCols) return null;
  const lang = (aioMeta.config.language as SupportedLanguage) || 'en-US';

  const toggleNode = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const aioCatalogsMap = useMemo(() => {
    const map = new Map();
    aioMeta.config.catalogs.forEach(c => map.set(c.id, c));
    return map;
  }, [aioMeta.config.catalogs]);

  const toggleCatalogs = (catalogIds: string[]) => {
    setAioMeta(prev => {
      if (!prev) return prev;
      
      const relevantCatalogs = prev.config.catalogs.filter(c => catalogIds.includes(c.id));
      const allEnabled = relevantCatalogs.every(c => c.enabled);
      
      const newState = !allEnabled;
      
      const newCatalogs = prev.config.catalogs.map(c => 
        catalogIds.includes(c.id) ? { ...c, enabled: newState } : c
      );
      
      const enabledCount = newCatalogs.filter(c => c.enabled).length;
      return {
        ...prev,
        config: {
          ...prev.config,
          catalogs: newCatalogs
        },
        metadata: {
          ...prev.metadata,
          enabledCatalogs: enabledCount
        }
      };
    });
  };

  const toggleAllCatalogs = () => {
    setAioMeta(prev => {
      if (!prev) return prev;
      const allEnabled = prev.config.catalogs.every(c => c.enabled);
      return {
        ...prev,
        config: {
          ...prev.config,
          catalogs: prev.config.catalogs.map(c => ({ ...c, enabled: !allEnabled }))
        },
        metadata: {
          ...prev.metadata,
          enabledCatalogs: !allEnabled ? prev.config.catalogs.length : 0
        }
      };
    });
  };

  const allSelected = aioMeta.config.catalogs.every((c: any) => c.enabled);

  const findAioCatalog = (catalogId: string) => {
    if (!catalogId) return null;
    if (aioCatalogsMap.has(catalogId)) return aioCatalogsMap.get(catalogId);
    
    let clean = catalogId.replace(/_(movie|series)$/, '');
    if (aioCatalogsMap.has(clean)) return aioCatalogsMap.get(clean);

    return null;
  };

  const enabledCount = aioMeta.config.catalogs.filter((c: any) => c.enabled).length;
  const maxLimit = 250;

  const canReorder = search === '' && sortBy === 'default';

  const filteredTreeData = useMemo(() => {
    let resultBanners = nuvioCols.map(col => {
      let resultFolders = col.folders.map(folder => {
        let catalogs = (folder.catalogSources || folder.sources || [])
          .map((src: any) => findAioCatalog(src.catalogId))
          .filter(Boolean);
        
        if (search) {
          const s = search.toLowerCase();
          catalogs = catalogs.filter(c => 
            c.name.toLowerCase().includes(s) || 
            c.id.toLowerCase().includes(s)
          );
        }

        switch (sortBy) {
          case 'nameAsc':
            catalogs.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'nameDesc':
            catalogs.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case 'statusEnabled':
            catalogs.sort((a, b) => (b.enabled ? 1 : 0) - (a.enabled ? 1 : 0));
            break;
          case 'statusDisabled':
            catalogs.sort((a, b) => (a.enabled ? 1 : 0) - (b.enabled ? 1 : 0));
            break;
        }

        return {
          id: folder.id || `${col.title}-${folder.title}`,
          title: translateText(folder.title, lang) || 'General',
          catalogs
        };
      }).filter(f => f.catalogs.length > 0);

      return {
        id: col.id || col.title,
        title: translateText(col.title, lang),
        showAllTab: col.showAllTab !== false,
        folders: resultFolders
      };
    }).filter(b => b.folders.length > 0);

    const usedCatalogs = new Set();
    nuvioCols.forEach(col => {
      col.folders.forEach((f: any) => {
        (f.catalogSources || f.sources || []).forEach((src: any) => {
          const matched = findAioCatalog(src.catalogId);
          if (matched) usedCatalogs.add(matched.id);
        });
      });
    });

    let unusedCatalogs = aioMeta.config.catalogs.filter(c => !usedCatalogs.has(c.id));
    if (search) {
      const s = search.toLowerCase();
      unusedCatalogs = unusedCatalogs.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.id.toLowerCase().includes(s)
      );
    }

    switch (sortBy) {
      case 'nameAsc':
        unusedCatalogs.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        unusedCatalogs.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'statusEnabled':
        unusedCatalogs.sort((a, b) => (b.enabled ? 1 : 0) - (a.enabled ? 1 : 0));
        break;
      case 'statusDisabled':
        unusedCatalogs.sort((a, b) => (a.enabled ? 1 : 0) - (b.enabled ? 1 : 0));
        break;
    }

    if (unusedCatalogs.length > 0) {
      resultBanners.push({
        id: 'uncategorized',
        title: translateText('Unassigned Catalogs', lang) || 'Unassigned Catalogs',
        folders: [
          {
            id: 'uncat-folder',
            title: translateText('Other Collections', lang) || 'Other Collections',
            catalogs: unusedCatalogs
          }
        ]
      });
    }

    return resultBanners;
  }, [nuvioCols, aioCatalogsMap, search, aioMeta.config.catalogs, sortBy, lang]);

  const toggleDiscover = (bannerId: string) => {
    setNuvioCols(prev => {
      if (!prev) return prev;
      return prev.map(col => {
        if ((col.id || col.title) === bannerId) {
          return { ...col, showAllTab: col.showAllTab === false ? true : false };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !canReorder) return;
    const { source, destination, type } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'banner') {
      setNuvioCols(prev => {
        if (!prev) return prev;
        const newItems = Array.from(prev);
        const [reorderedItem] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, reorderedItem);
        return newItems;
      });
    } else if (type === 'folder') {
      setNuvioCols(prev => {
        if (!prev) return prev;
        return prev.map(col => {
          const colId = col.id || col.title;
          if (colId === source.droppableId) {
            const newFolders = Array.from(col.folders);
            const [reorderedItem] = newFolders.splice(source.index, 1);
            newFolders.splice(destination.index, 0, reorderedItem);
            return { ...col, folders: newFolders };
          }
          return col;
        });
      });
    }
  };

  const renderCatalog = (catalog: any) => {
    return (
      <div 
        key={catalog.id} 
        className={`p-3 rounded-lg border flex items-center gap-3 bg-white transition-colors cursor-pointer
          ${catalog.enabled ? 'border-primary/40 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'}`}
        onClick={() => toggleCatalogs([catalog.id])}
      >
        <TriStateCheck 
          state={catalog.enabled ? 'checked' : 'unchecked'} 
          onClick={() => toggleCatalogs([catalog.id])} 
        />
        <div className="list-info min-w-0 flex-1 flex flex-col justify-center">
          <h4 className="text-sm font-semibold text-slate-900 leading-tight truncate">{catalog.name}</h4>
          <p className="text-xs text-slate-500 truncate mt-1">{catalog.source}</p>
        </div>
      </div>
    );
  };

  const renderFolder = (folder: any, index: number, isDraggable: boolean, isLastLevel: boolean = false) => {
    const isExpanded = expandedNodes[folder.id];
    const enabledCount = folder.catalogs.filter((c: any) => c.enabled).length;
    const totalCount = folder.catalogs.length;
    const state = enabledCount === totalCount ? 'checked' : enabledCount === 0 ? 'unchecked' : 'partial';

    const renderContent = (dragHandleProps: any = {}) => (
      <div className={`border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden mb-3 transition-opacity ${!isDraggable ? 'ml-0' : ''}`}>
        <div 
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={(e) => toggleNode(folder.id, e)}
        >
          {isDraggable && !isLastLevel && (
             <div {...dragHandleProps} onClick={(e) => e.stopPropagation()} className="drag-handle touch-none cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1">
               <GripVertical className="w-5 h-5" />
             </div>
          )}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
            <TriStateCheck 
              state={state} 
              onClick={() => toggleCatalogs(folder.catalogs.map((c: any) => c.id))} 
            />
            <h4 className="text-sm font-semibold text-slate-800 truncate">{folder.title || translateText('General', lang) || 'General'}</h4>
          </div>
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full shrink-0">{enabledCount}/{totalCount}</span>
        </div>

        {isExpanded && (
          <div className="border-t border-slate-100 p-4 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-3">
            {folder.catalogs.map(renderCatalog)}
          </div>
        )}
      </div>
    );

    if (!isDraggable) return <React.Fragment key={folder.id}>{renderContent()}</React.Fragment>;

    return (
      /* @ts-ignore - known type issue with react 18 / dnd */
      <Draggable key={folder.id} draggableId={folder.id} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef} 
            {...provided.draggableProps} 
            style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1 }}
          >
            {renderContent(provided.dragHandleProps)}
          </div>
        )}
      </Draggable>
    );
  };

  const renderBanner = (banner: any, index: number) => {
    const isExpanded = expandedNodes[banner.id];
    const allCatalogs = banner.folders.flatMap((f: any) => f.catalogs);
    const enabledCount = allCatalogs.filter((c: any) => c.enabled).length;
    const totalCount = allCatalogs.length;
    const state = enabledCount === totalCount ? 'checked' : enabledCount === 0 ? 'unchecked' : 'partial';

    const isUncat = banner.id === 'uncategorized';
    const isDraggableBanner = canReorder && !isUncat;

    const renderContent = (dragHandleProps: any = {}) => (
      <div className={`mb-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all ${isUncat ? 'border-dashed border-slate-300' : ''}`}>
        <div 
          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={(e) => toggleNode(banner.id, e)}
        >
          {isDraggableBanner && (
             <div {...dragHandleProps} onClick={(e) => e.stopPropagation()} className="drag-handle touch-none cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 -m-1">
               <GripVertical className="w-6 h-6" />
             </div>
          )}
          <div className="flex-1 flex items-center gap-3">
            {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />}
            <TriStateCheck 
              state={state} 
              onClick={() => toggleCatalogs(allCatalogs.map((c: any) => c.id))} 
            />
            <h3 className="text-base text-slate-900 font-bold tracking-tight">{banner.title}</h3>
          </div>
          <span className="text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full shrink-0">{enabledCount}/{totalCount}</span>
        </div>
        
        {isExpanded && (
          <div className="border-t border-slate-100 p-4 bg-slate-50">
            {!isUncat && (
              <div className="mb-4 flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div>
                  <label htmlFor={`discover-${banner.id}`} className="text-sm font-bold text-slate-800 cursor-pointer block">
                    {translateText("Show on Discover Page", lang) || "Show on Discover Page"}
                  </label>
                  <span className="text-xs text-slate-500">
                    {translateText("Turn this off to only show the collection on the home page.", lang) || "Turn this off to only show the collection on the home page."}
                  </span>
                </div>
                <input 
                  type="checkbox" 
                  id={`discover-${banner.id}`} 
                  checked={banner.showAllTab !== false}
                  onChange={() => toggleDiscover(banner.id)}
                  className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer accent-primary"
                />
              </div>
            )}
            {isDraggableBanner ? (
              <Droppable droppableId={banner.id} type="folder">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {banner.folders.map((f: any, i: number) => renderFolder(f, i, true, false))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ) : (
              <div>
                {banner.folders.map((f: any, i: number) => renderFolder(f, i, false, true))}
              </div>
            )}
          </div>
        )}
      </div>
    );

    if (!isDraggableBanner) return <React.Fragment key={banner.id}>{renderContent()}</React.Fragment>;

    return (
      /* @ts-ignore - known type issue with react 18 / dnd */
      <Draggable key={banner.id} draggableId={banner.id} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef} 
            {...provided.draggableProps}
            style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.9 : 1 }}
          >
             {renderContent(provided.dragHandleProps)}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 text-slate-900 border-b pb-3">{translateText("Catalog Selection", lang) || "Catalog Selection"}</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
            {translateText("Toggle the collections you want to display in Nuvio. Check a category to enable all items inside it. You can also reorder collections using the drag handles on the left. Limit is 250 collections.", lang)?.replace('250', maxLimit.toString()) || 
             `Toggle the collections you want to display in Nuvio. Check a category to enable all items inside it. You can also reorder collections using the drag handles on the left. Limit is ${maxLimit} collections.`}
          </p>
        </div>

        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-xl flex flex-col gap-2 shrink-0 shadow-sm">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-medium tracking-wide">{translateText("Selected Collections", lang) || "Selected Collections"}</span>
            <span className="text-2xl font-bold">{enabledCount}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${enabledCount > maxLimit ? 'bg-amber-400' : 'bg-primary'}`}
              style={{ width: `${Math.min((enabledCount / (Math.ceil(Math.max(enabledCount, 1) / maxLimit) * maxLimit)) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 font-medium shrink-0">
            {enabledCount > maxLimit 
              ? (translateText("You have exceeded %limit% collections. Your AIO Meta Data export will be split into %count% files automatically.", lang)?.replace('%limit%', maxLimit.toString()).replace('%count%', Math.ceil(enabledCount / maxLimit).toString()) || `You have exceeded ${maxLimit} collections. Your AIO Meta Data export will be split into ${Math.ceil(enabledCount / maxLimit)} files automatically.`) 
              : (translateText("%slots% slots remaining before splitting AIO Meta Data into a second profile.", lang)?.replace('%slots%', (maxLimit - enabledCount).toString()) || `${maxLimit - enabledCount} slots remaining before splitting AIO Meta Data into a second profile.`)}
          </p>
        </div>

        <div className="relative shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Button variant="outline" onClick={toggleAllCatalogs} className="shrink-0 rounded-xl h-12 text-sm font-medium border-slate-300">
            {allSelected ? (translateText("Deselect All", lang) || "Deselect All") : (translateText("Select All", lang) || "Select All")}
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder={translateText("Search collections...", lang) || "Search collections..."} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 bg-white border-slate-200 rounded-xl h-12 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm font-medium w-full"
            />
          </div>
          <div className="relative w-full sm:w-48 shrink-0">
             <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 h-12 text-sm text-slate-900 font-medium shadow-sm appearance-none cursor-pointer placeholder:text-slate-400"
             >
               <option value="default">{translateText("Sort: Default", lang) || "Sort: Default"}</option>
               <option value="nameAsc">{translateText("Name: A-Z", lang) || "Name: A-Z"}</option>
               <option value="nameDesc">{translateText("Name: Z-A", lang) || "Name: Z-A"}</option>
               <option value="statusEnabled">{translateText("Status: Enabled", lang) || "Status: Enabled"}</option>
               <option value="statusDisabled">{translateText("Status: Disabled", lang) || "Status: Disabled"}</option>
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
               <ChevronDown className="w-4 h-4 text-slate-400" />
             </div>
          </div>
        </div>

        <div className="mt-2 pr-3 pb-4 relative">
          <DragDropContext onDragEnd={handleDragEnd}>
            {canReorder ? (
              <Droppable droppableId="banners-list" type="banner">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="pb-4">
                    {filteredTreeData.map((b: any, i: number) => renderBanner(b, i))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ) : (
              <div className="pb-4">
                {filteredTreeData.map((b: any, i: number) => renderBanner(b, i))}
                {filteredTreeData.length === 0 && (
                  <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                    {translateText("No collections found matching", lang) || "No collections found matching"} "{search}"
                  </div>
                )}
              </div>
            )}
          </DragDropContext>
        </div>
      </div>

      <div className="w-full flex justify-between pt-6 mt-4 border-t border-slate-200 shrink-0">
        <Button variant="outline" onClick={onPrev} className="gap-2 rounded-xl text-slate-600 px-6 py-5 font-medium transition-colors hover:bg-slate-100">
          <ArrowLeft className="w-4 h-4" /> {translateText("Back", lang) || "Back"}
        </Button>
        <Button onClick={onNext} className="gap-2 px-8 py-5 rounded-xl hover:shadow-md transition-all font-medium">
          {translateText("Generate Config", lang) || "Generate Config"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
