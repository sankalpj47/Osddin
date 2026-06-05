'use client';
import { useLazyQuery } from '@apollo/client/react';
import {  SquareDashedMousePointerIcon, Upload, ChevronDown, ChevronRight ,RotateCcw} from 'lucide-react';
import { redirect } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { DISEASE_DEPENDENT_PROPERTIES, type DiseaseDependentProperties } from '@/lib/data';
import { GENE_PROPERTIES_QUERY, GET_HEADERS_QUERY } from '@/lib/gql';
import { useStore } from '@/lib/hooks';
import type {
  GenePropertiesData,
  GenePropertiesDataVariables,
  GetDiseaseData,
  GetHeadersData,
  GetHeadersVariables,
  OtherSection,
  RadioOptions,
} from '@/lib/interface';
import { envURL, genePropertyCategoryEnumToString, selectedRadioStringToEnum } from '@/lib/utils';
import { Export, FileSheet, MouseControlMessage } from '../app';
import { DiseaseMapCombobox } from '../DiseaseMapCombobox';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Spinner } from '../ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { GeneSearch, NodeColor, NodeSize } from '.';

export function LeftSideBar() {
  const diseaseName = useStore(state => state.diseaseName);
  const geneNames = useStore(state => state.geneNames); // Added to get active gene list count
  const geneIds = useStore(useShallow(state => state.geneNames.map(g => state.geneNameToID.get(g) ?? g)));
  const skipCommon = useRef<boolean>(false);
  const [diseaseData, setDiseaseData] = React.useState<GetDiseaseData | undefined>(undefined);
  const [diseaseMap, setDiseaseMap] = React.useState<string>('MONDO_0004976');

  const [activePropertyTab, setActivePropertyTab] = useState<'color' | 'size'>('color');

  const [isSeedGenesCollapsed, setIsSeedGenesCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const graphConfig = localStorage.getItem('graphConfig');
    if (!graphConfig) redirect('/');
    const diseaseMap = JSON.parse(graphConfig).diseaseMap;
    useStore.setState({
      diseaseName: diseaseMap || 'MONDO_0004976',
    });
    setDiseaseMap(diseaseMap);
    (async () => {
      try {
        const response = await fetch(`${envURL(process.env.NEXT_PUBLIC_BACKEND_URL)}/diseases`);
        if (!response.ok) {
          console.error('Failed to fetch disease data:', response.statusText);
          setDiseaseData([]);
          return;
        }
        const data = await response.json();
        setDiseaseData(data);
      } catch (error) {
        console.error('Error fetching disease data:', error);
        setDiseaseData([]);
      }
    })();
  }, []);

  const [fetchHeader, { loading, called }] = useLazyQuery<GetHeadersData, GetHeadersVariables>(GET_HEADERS_QUERY, {
    returnPartialData: true,
  });

  useEffect(() => {
    if (!diseaseName) return;
    fetchHeader({
      variables: {
        diseaseId: diseaseName,
        skipCommon: skipCommon.current,
      },
    })
      .then(val => {
        const data = val.data?.headers;
        if (!data) return;
        const radioOptions: RadioOptions = {
          database: {
            ...useStore.getState().radioOptions.database,
            DEG: [],
          },
          user: useStore.getState().radioOptions.user,
        };
        if (!skipCommon.current) {
          radioOptions.database.OpenTargets = data.openTargets ?? [];
          radioOptions.database.OT_Prioritization = data.targetPrioritization ?? [];
          radioOptions.database.Druggability = data.druggability ?? [];
          radioOptions.database.Pathway = data.pathway ?? [];
          radioOptions.database.TE = data.tissueSpecificity ?? [];
        }
        skipCommon.current = true;
        radioOptions.database.DEG = data.differentialExpression ?? [];
        useStore.setState({ radioOptions });
      })
      .catch(err => {
        console.error(err);
      });
  }, [diseaseName]);

  useEffect(() => {
    if (!geneIds) return;
    const universalData = useStore.getState().universalData;
    for (const gene of geneIds) {
      if (universalData[gene] === undefined) {
        universalData[gene] = {
          common: { Custom_Color: {}, OT_Prioritization: {}, Druggability: {}, Pathway: {}, TE: {} },
          user: { DEG: {}, OpenTargets: {}, Custom_Color: {}, Druggability: {}, Pathway: {}, TE: {}, OT_Prioritization: {} },
        };
      }
    }
  }, [geneIds]);

  const [fetchUniversal, { loading: universalLoading }] = useLazyQuery<GenePropertiesData, GenePropertiesDataVariables>(
    GENE_PROPERTIES_QUERY,
  );
  const selectedRadioNodeSize = useStore(state => state.selectedRadioNodeSize);
  const selectedRadioNodeColor = useStore(state => state.selectedRadioNodeColor);
  const radioOptions = useStore(state => state.radioOptions);
  const queriedFieldSet = useRef<Set<string>>(new Set());

  async function handlePropChange(val: string | Set<string>, type: 'color' | 'size') {
    const selectedRadio = type === 'color' ? selectedRadioNodeColor : selectedRadioNodeSize;
    if (!selectedRadio) return;
    const ddp = DISEASE_DEPENDENT_PROPERTIES.includes(selectedRadio as DiseaseDependentProperties);
    const properties = (val instanceof Set ? Array.from(val) : [val]).reduce<string[]>((acc, property) => {
      const key = `${ddp ? `${diseaseName}_` : ''}${selectedRadio}_${property}`;
      if (!queriedFieldSet.current.has(key) && !radioOptions.user[selectedRadio].includes(property)) {
        acc.push(property);
      }
      return acc;
    }, []);
    if (properties.length === 0) {
      useStore.setState({
        [type === 'color' ? 'selectedNodeColorProperty' : 'selectedNodeSizeProperty']: val,
      });
    } else {
      const result = await fetchUniversal({
        variables: {
          geneIds,
          config: [
            {
              category: selectedRadioStringToEnum(selectedRadio),
              properties,
              ...(ddp && { diseaseId: diseaseName }),
            },
          ],
        },
      });
      if (result.error) {
        console.error(result.error);
        return;
      }
      properties.forEach(p => {
        queriedFieldSet.current.add(`${ddp ? `${diseaseName}_` : ''}${selectedRadio}_${p}`);
      });
      const universalData = useStore.getState().universalData;
      for (const { ID, data } of result.data?.geneProperties ?? []) {
        const geneRecord = universalData[ID];

        for (const { key, score, category: categoryEnum, diseaseId } of data) {
          const category = genePropertyCategoryEnumToString(categoryEnum);
          if (diseaseId) {
            if (category !== 'DEG' && category !== 'OpenTargets') continue;
            if (geneRecord[diseaseId] === undefined) {
              geneRecord[diseaseId] = { DEG: {}, OpenTargets: {} } as OtherSection;
            }
            (geneRecord[diseaseId] as OtherSection)[category][key] = score;
          } else {
            if (category === 'DEG' || category === 'OpenTargets') continue;
            geneRecord.common[category][key] = score;
          }
        }
      }
      useStore.setState({
        universalData,
        [type === 'color' ? 'selectedNodeColorProperty' : 'selectedNodeSizeProperty']: val,
      });
    }
  }

  async function handleDiseaseChange(disease: string) {
    setDiseaseMap(disease);
    useStore.setState({ diseaseName: disease });
  }

  return (
    <ScrollArea className="flex h-full w-full min-w-0 flex-col bg-[#F8F9FA] p-4 text-gray-700 select-none">

      {/* 1. Disease Select dropdown context */}
      <div className="mb-4 flex flex-col">
        <div className="flex w-full items-center justify-between relative">
          <div className="min-w-0 grow">
            <DiseaseMapCombobox
              value={diseaseMap}
              onChange={d => typeof d === 'string' && handleDiseaseChange(d)}
              data={diseaseData}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm"
            />
          </div>
          {(!called || (called && loading) || diseaseData === undefined || universalLoading) && (
            <div className="fade-in zoom-in ml-2 animate-in duration-100">
              <Spinner size="small" />
            </div>
          )}
        </div>
      </div>

      {/* 2. Node Properties Container Block */}
      <div className="mb-4 flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Label className="mb-3 text-sm font-bold text-gray-800 tracking-tight">Node Properties</Label>

        <div className="mb-4 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActivePropertyTab('color')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${activePropertyTab === 'color'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Color
          </button>
          <button
            type="button"
            onClick={() => setActivePropertyTab('size')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${activePropertyTab === 'size'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Size
          </button>
        </div>

        <div className="text-sm">
          {activePropertyTab === 'color' ? (
            <NodeColor onPropChange={val => handlePropChange(val, 'color')} />
          ) : (
            <NodeSize onPropChange={val => handlePropChange(val, 'size')} />
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200">
        <div
          className="flex cursor-pointer items-center justify-between select-none"
          onClick={() => setIsSeedGenesCollapsed(!isSeedGenesCollapsed)}
        >
          <div className="flex items-center gap-2">
            <Label className="text-sm font-bold text-gray-800 tracking-tight cursor-pointer">
              #Seed Genes
            </Label>
            {isSeedGenesCollapsed && (
              <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-100">
                {geneNames?.length || 0} loaded
              </span>
            )}
          </div>
          <div className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-50">
            {isSeedGenesCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
          </div>
        </div>

   
        {!isSeedGenesCollapsed && (
          <div className="mt-3 grid grid-cols-1 animate-in fade-in slide-in-from-top-2 duration-150">
            <GeneSearch />
          </div>
        )}
      </div>

      <div className="mb-6 flex w-full items-center gap-3 px-1">

        <div className="flex-1">
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <SquareDashedMousePointerIcon className="size-3.5 text-gray-500" />
                <span>Shortcuts</span>
              </button>
            </TooltipTrigger>
            <TooltipContent align="start" side="top" sideOffset={6} className="max-w-xs p-3 text-xs leading-relaxed shadow-md rounded-xl border border-gray-200 bg-white">
              <ol className="space-y-2 text-gray-600">
                <li className="flex items-start gap-1">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><b>Shift (⇧) + Drag</b>: Select multiple genes.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><b>Cmd/Ctrl (⌘) + Hover</b>: Highlight neighbor genes.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><b>Cmd/Ctrl (⌘) + Click</b>: Append gene to search.</span>
                </li>
              </ol>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1">
          
          <Export />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#00796B] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#00695C]"
        >
          <Upload className="size-3.5" />
          Upload Files
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>

      <div className="hidden">
        <FileSheet />
      </div>
    </ScrollArea>
  );
}