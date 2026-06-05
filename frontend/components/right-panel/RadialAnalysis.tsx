'use client';

import { HelpCircleIcon } from 'lucide-react';
import React from 'react';
import { radialAnalysisOptions } from '@/lib/data';
import { useStore } from '@/lib/hooks';
import type { RadialAnalysisSetting } from '@/lib/interface';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { VirtualizedCombobox } from '../VirtualizedCombobox';

export function RadialAnalysis() {
  const [minScore, setMinScore] = React.useState(0);
  const [isGeneDegree, setIsGeneDegree] = React.useState(true);
  const radioOptions = useStore(state => state.radioOptions);
  const radialAnalysis = useStore(state => state.radialAnalysis);

  const updateRadialAnalysis = (value: number | string, key: keyof RadialAnalysisSetting) => {
    useStore.setState({ radialAnalysis: { ...radialAnalysis, [key]: value } });
  };

  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).has('file')) return;
    const cachedScore = Number(JSON.parse(localStorage.getItem('graphConfig') ?? '{}').minScore) ?? 0;
    setMinScore(cachedScore);
    updateRadialAnalysis(cachedScore, 'edgeWeightCutOff');
  }, []);

  return (
    <div className="w-full flex flex-col gap-3 min-w-0">

      {radialAnalysisOptions.map((option) => (
        <div 
          key={option.key} 
          className="flex flex-col gap-2 rounded-lg border border-gray-50 bg-white p-2.5 shadow-3xs"
        >

          <div className="flex items-center justify-between w-full">
            <Label htmlFor={option.key} className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <span>{option.label}</span>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0">
                    <HelpCircleIcon className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  align="start" 
                  sideOffset={4} 
                  className="max-w-xs p-2.5 text-xs bg-emerald-600 text-white border border-gray-200 shadow-md rounded-lg leading-relaxed"
                >
                  {option.tooltip}
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              id={`input-${option.key}`}
              className="h-6.5 w-16 text-right font-mono text-xs rounded-md border-gray-200 focus-visible:ring-teal-500 bg-gray-50/50 p-1"
              min={option.min}
              max={option.max}
              step={option.step}
              value={radialAnalysis[option.key] ?? option.min}
              onChange={e => {
                const val = parseFloat(e.target.value);
                updateRadialAnalysis(isNaN(val) ? option.min : val, option.key as keyof RadialAnalysisSetting);
              }}
            />
          </div>

          <div className="flex items-center w-full px-1 py-1">
            <Slider
              id={option.key}
              className="w-full"
              min={option.key === 'edgeWeightCutOff' ? minScore : option.min}
              max={option.key === 'candidatePrioritizationCutOff' && !isGeneDegree ? 1 : option.max}
              step={option.key === 'candidatePrioritizationCutOff' && !isGeneDegree ? 0.01 : option.step}
              value={[radialAnalysis[option.key] ?? option.min]}
              onValueChange={value => updateRadialAnalysis(value[0], option.key as keyof RadialAnalysisSetting)}
            />
          </div>

          {option.key === 'candidatePrioritizationCutOff' && (
            <div className="mt-1.5 border-t border-gray-50 pt-2 w-full">
              <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Prioritization Attribute Metric
              </Label>
              <VirtualizedCombobox
                data={['Gene Degree', ...radioOptions.database.TE, ...radioOptions.user.TE]}
                width="100%"
                align="start"
                value={radialAnalysis.nodeDegreeProperty}
                className="w-full h-8 text-xs text-gray-700 bg-gray-50/50 border border-gray-200 rounded-md shadow-2xs hover:bg-gray-50"
                onChange={value => {
                  if (typeof value !== 'string') return;
                  setIsGeneDegree(value === 'Gene Degree');
                  updateRadialAnalysis(value, 'nodeDegreeProperty');
                }}
              />
            </div>
          )}

        </div>
      ))}
    </div>
  );
}