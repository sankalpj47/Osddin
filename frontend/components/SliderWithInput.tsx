'use client';
import { useState } from 'react';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

export default function SliderWithInput({
  min,
  max,
  step,
  id,
  defaultValue,
  label,
}: {
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  defaultValue: number;
  label?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const displayMin = min ?? 0;
  const displayMax = max ?? 100;

  return (
    <div className='w-full space-y-1.5 text-xs'>
      {label && (
        <div className='flex items-center justify-between gap-2'>
          <span className='truncate font-semibold text-gray-700'>{label}</span>
          <span className='rounded border border-teal-100 bg-teal-50 px-1.5 py-0.5 font-mono font-semibold text-[10px] text-teal-700'>
            {value}
          </span>
        </div>
      )}
      <div className='flex items-center gap-2'>
        <div className='min-w-0 flex-1 space-y-1'>
          <Slider
            min={min}
            max={max}
            step={step}
            id={id}
            name={id}
            value={[value]}
            onValueChange={e => setValue(e[0])}
            className='w-full'
          />
          <div className='flex items-center justify-between font-mono text-[10px] text-gray-500'>
            <span>{displayMin}</span>
            <span>{displayMax}</span>
          </div>
        </div>
        <Input
          type='number'
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label ?? id}
          onChange={e => setValue(Number(e.target.value))}
          className='h-9 w-16 border-gray-200 px-2 text-center text-xs focus-visible:ring-teal-600'
        />
      </div>
    </div>
  );
}
