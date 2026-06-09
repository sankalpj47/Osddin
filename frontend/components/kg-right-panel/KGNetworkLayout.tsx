'use client';

import { ChevronsUpDownIcon, HelpCircleIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useId } from 'react';
import { forceLayoutOptions } from '@/lib/data';
import { useKGStore } from '@/lib/hooks';
import type { ForceSettings } from '@/lib/interface';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function KGNetworkLayout() {
  const { start, stop } = useKGStore(state => state.forceWorker);
  const forceSettings = useKGStore(state => state.forceSettings);

  const handleGraphAnimation = (checked: boolean) => {
    checked ? start() : stop();
  };

  const updateForceSetting = (value: number[] | string, key: keyof ForceSettings) => {
    useKGStore.setState({
      forceSettings: {
        ...forceSettings,
        [key]: typeof value === 'string' ? Number.parseFloat(value) : value[0],
      },
    });
  };

  const networkAnimationControlId = useId();

  return (
    <Collapsible defaultOpen className='mb-2 rounded-xl border border-gray-200 bg-white p-2 text-xs shadow-sm'>
      <div className='flex w-full items-center justify-between'>
        <p className='font-bold text-gray-800'>Network Layout</p>
        <CollapsibleTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-6 border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          >
            <ChevronsUpDownIcon size={15} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className='mt-1 flex flex-col gap-1.5'>
        <div className='group flex items-center justify-between rounded-lg p-1 transition-colors hover:bg-gray-50'>
          <Label
            htmlFor={networkAnimationControlId}
            className='cursor-pointer font-semibold text-gray-500 text-xs transition-colors group-has-[button[data-state=checked]]:text-gray-900'
          >
            Animation Engine
          </Label>
          <Switch
            id={networkAnimationControlId}
            defaultChecked
            onCheckedChange={handleGraphAnimation}
            className='origin-right scale-75'
          />
        </div>

        <hr className='my-0.5 border-gray-100' />

        {forceLayoutOptions.map(option => (
          <div
            key={option.key}
            className='group flex items-center justify-between rounded-lg p-1 transition-colors hover:bg-gray-50'
          >
            <div className='flex items-center space-x-2'>
              <div className='size-1.5 rounded-full bg-primary/30 transition-colors group-hover:bg-primary' />
              <Label className='flex items-center gap-1 font-semibold text-gray-700 text-xs'>
                {option.label}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircleIcon size={12} className='text-gray-400 transition-colors hover:text-primary' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-60' align='end'>
                    {option.tooltip}
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-5 text-gray-400 opacity-80 transition-colors hover:bg-gray-100 hover:text-primary data-[state=open]:bg-gray-100 data-[state=open]:text-primary'
                >
                  <SlidersHorizontalIcon className='size-3.5' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-56 border-gray-200 bg-white p-3 shadow-sm'
                side='right'
                align='center'
                sideOffset={10}
              >
                <div className='space-y-3'>
                  <div className='border-gray-100 border-b pb-1 font-semibold text-[11px] text-gray-500 uppercase tracking-wide'>
                    Fine-tune Value
                  </div>
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor={option.key} className='font-semibold text-gray-700 text-xs'>
                        Intensity
                      </Label>
                      <Input
                        type='number'
                        className='h-6 w-14 border-gray-200 p-0.5 text-center text-xs focus-visible:ring-primary'
                        min={option.min}
                        max={option.max}
                        step={option.step}
                        value={forceSettings[option.key]}
                        onChange={e => e.target.value && updateForceSetting(e.target.value, option.key)}
                      />
                    </div>
                    <Slider
                      id={option.key}
                      className='w-full'
                      min={option.min}
                      max={option.max}
                      step={option.step}
                      value={[forceSettings[option.key]]}
                      onValueChange={value => updateForceSetting(value, option.key)}
                    />
                    <div className='flex items-center justify-between font-mono text-[10px] text-gray-500'>
                      <span>{option.min}</span>
                      <span>{option.max}</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
