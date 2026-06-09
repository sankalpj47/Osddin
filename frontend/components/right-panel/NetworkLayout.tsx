'use client';

import { HelpCircleIcon, PlayIcon, SquareIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { forceLayoutOptions } from '@/lib/data';
import { useStore } from '@/lib/hooks';
import type { ForceSettings } from '@/lib/interface';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function NetworkLayout() {
  const { start, stop } = useStore(state => state.forceWorker);
  const forceSettings = useStore(state => state.forceSettings);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  const handleGraphAnimation = (checked: boolean) => {
    setIsAnimating(checked);
    checked ? start() : stop();
  };

  const updateForceSetting = (value: number[] | string, key: keyof ForceSettings) => {
    useStore.setState({
      forceSettings: {
        ...forceSettings,
        [key]: typeof value === 'string' ? Number.parseFloat(value) : value[0],
      },
    });
  };

  const networkAnimationControlId = useId();

  return (
    <div className="w-full flex flex-col gap-4 min-w-0">
      
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-2.5">
        <div className="flex flex-col">
          <Label htmlFor={networkAnimationControlId} className="text-xs font-bold text-gray-700 cursor-pointer">
            Physics Simulation
          </Label>
          <span className="text-[10px] text-gray-400 mt-0.5">
            {isAnimating ? 'Live computing layouts...' : 'Physics engine paused'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            {isAnimating && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isAnimating ? 'bg-primary' : 'bg-gray-300'}`}></span>
          </span>
          <Switch 
            id={networkAnimationControlId} 
            checked={isAnimating} 
            onCheckedChange={handleGraphAnimation} 
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {forceLayoutOptions.map(option => (
          <div key={option.key} className="flex flex-col gap-2 rounded-lg border border-gray-50 bg-white p-2.5 shadow-3xs">
            
            <div className="flex items-center justify-between w-full">
              <Label htmlFor={option.key} className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <span>{option.label}</span>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                      <HelpCircleIcon className="size-3.5" />
                    </button>
                  </TooltipTrigger>
            
                  <TooltipContent 
                    side="top" 
                    align="start" 
                    sideOffset={4} 
                    className="max-w-xs p-2.5 text-xs border-none shadow-md rounded-lg leading-relaxed font-medium"
                  >
                    {option.tooltip}
                  </TooltipContent>
                </Tooltip>
              </Label>
              
              <Input
                type="number"
                id={`input-${option.key}`}
                className="h-6.5 w-16 text-right font-mono text-xs rounded-md border-gray-200 focus-visible:ring-primary bg-gray-50/50 p-1"
                min={option.min}
                max={option.max}
                step={option.step}
                value={forceSettings[option.key] ?? option.min}
                onChange={e => e.target.value && updateForceSetting(e.target.value, option.key)}
              />
            </div>

            <div className="flex items-center w-full px-1 py-1">
              <Slider
                id={option.key}
                className="w-full data-[disabled]:opacity-"
                min={option.min}
                max={option.max}
                step={option.step}
                value={[forceSettings[option.key] ?? option.min]}
                onValueChange={value => updateForceSetting(value, option.key)}
              />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}