'use client';

import type { CheckedState } from '@radix-ui/react-checkbox';
import { HelpCircleIcon } from 'lucide-react';
import { useId } from 'react';
import { useStore } from '@/lib/hooks';
import type { GraphStore } from '@/lib/interface';
import { Checkbox } from '../ui/checkbox';
import { ColorPicker } from '../ui/color-picker';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function NetworkStyle() {
  const defaultNodeSize = useStore(state => state.defaultNodeSize);
  const defaultNodeColor = useStore(state => state.defaultNodeColor);
  const defaultLabelDensity = useStore(state => state.defaultLabelDensity);
  const defaultLabelSize = useStore(state => state.defaultLabelSize);
  const showEdgeColor = useStore(state => state.showEdgeColor);
  const edgeOpacity = useStore(state => state.edgeOpacity);
  const highlightNeighborNodes = useStore(state => state.highlightNeighborNodes);

  const handleCheckBox = (checked: CheckedState, key: keyof GraphStore) => {
    if (checked === 'indeterminate') return;
    useStore.setState({ [key]: checked });
  };

  const handleDefaultChange = (value: number | string, key: keyof GraphStore) => {
    useStore.setState({ [key]: value });
  };

  const defaultNodeSizeId = useId();
  const defaultLabelSizeId = useId();
  const defaultLabelDensityId = useId();
  const showEdgeColorId = useId();
  const edgeOpacityId = useId();
  const highlightNeighborNodesId = useId();

  return (
    <div className="w-full flex flex-col gap-4 min-w-0">
      
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
          Geometry Scales
        </span>

        <div className="flex flex-col gap-2 rounded-lg border border-gray-50 bg-white p-2.5 shadow-3xs">
          <div className="flex items-center justify-between w-full">
            <Label htmlFor={defaultNodeSizeId} className="text-xs font-bold text-gray-700">
              Base Node Size
            </Label>
            <Input
              type="number"
              id={`input-${defaultNodeSizeId}`}
              className="h-6.5 w-16 text-right font-mono text-xs rounded-md border-gray-200 focus-visible:ring-teal-500 bg-gray-50/50 p-1"
              min={1}
              max={50}
              step={1}
              value={defaultNodeSize}
              onChange={e => handleDefaultChange(parseInt(e.target.value, 10) || 1, 'defaultNodeSize')}
            />
          </div>
          <div className="flex items-center w-full px-1 py-1">
            <Slider
              id={defaultNodeSizeId}
              className="w-full"
              min={1}
              max={50}
              step={1}
              value={[defaultNodeSize]}
              onValueChange={value => handleDefaultChange(value?.[0], 'defaultNodeSize')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-gray-50 bg-white p-2.5 shadow-3xs">
          <div className="flex items-center justify-between w-full">
            <Label htmlFor={defaultLabelSizeId} className="text-xs font-bold text-gray-700">
              Label Typography Size
            </Label>
            <Input
              type="number"
              id={`input-${defaultLabelSizeId}`}
              className="h-6.5 w-16 text-right font-mono text-xs rounded-md border-gray-200 focus-visible:ring-teal-500 bg-gray-50/50 p-1"
              min={1}
              max={25}
              step={1}
              value={defaultLabelSize}
              onChange={e => handleDefaultChange(parseInt(e.target.value, 10) || 1, 'defaultLabelSize')}
            />
          </div>
          <div className="flex items-center w-full px-1 py-1">
            <Slider
              id={defaultLabelSizeId}
              className="w-full"
              min={1}
              max={25}
              step={1}
              value={[defaultLabelSize]}
              onValueChange={value => handleDefaultChange(value?.[0], 'defaultLabelSize')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-gray-50 bg-white p-2.5 shadow-3xs">
          <div className="flex items-center justify-between w-full">
            <Label htmlFor={defaultLabelDensityId} className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <span>Label Visibility Density</span>
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
                  className="max-w-xs p-2.5 text-xs bg-primary text-white border-none shadow-md rounded-lg leading-relaxed font-medium"
                >
                  Adjust the density threshold for rendering text annotations across nodes and connector groups.
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              id={`input-${defaultLabelDensityId}`}
              className="h-6.5 w-16 text-right font-mono text-xs rounded-md border-gray-200 focus-visible:ring-teal-500 bg-gray-50/50 p-1"
              min={0}
              max={10}
              step={0.1}
              value={defaultLabelDensity}
              onChange={e => handleDefaultChange(parseFloat(e.target.value) || 0, 'defaultLabelDensity')}
            />
          </div>
          <div className="flex items-center w-full px-1 py-1">
            <Slider
              id={defaultLabelDensityId}
              className="w-full"
              min={0}
              max={10}
              step={0.1}
              value={[defaultLabelDensity]}
              onValueChange={value => handleDefaultChange(value?.[0], 'defaultLabelDensity')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-gray-50 bg-white p-2.5 shadow-3xs">
          <div className="flex items-center justify-between w-full">
            <Label htmlFor={edgeOpacityId} className="text-xs font-bold text-gray-700">
              Edge Link Opacity
            </Label>
            <Input
              type="number"
              id={`input-${edgeOpacityId}`}
              className="h-6.5 w-16 text-right font-mono text-xs rounded-md border-gray-200 focus-visible:ring-teal-500 bg-gray-50/50 p-1"
              min={0}
              max={1}
              step={0.1}
              value={edgeOpacity}
              onChange={e => handleDefaultChange(parseFloat(e.target.value) || 0, 'edgeOpacity')}
            />
          </div>
          <div className="flex items-center w-full px-1 py-1">
            <Slider
              id={edgeOpacityId}
              className="w-full"
              min={0}
              max={1}
              step={0.1}
              value={[edgeOpacity]}
              onValueChange={e => handleDefaultChange(e[0], 'edgeOpacity')}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-3.5">
        <span className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
          Visibility & Colors
        </span>

        <div className="grid grid-cols-1 gap-2 rounded-xl bg-gray-50/50 border border-gray-100 p-2.5">
          <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1 hover:bg-white/60 transition-colors">
            <Checkbox
              id={showEdgeColorId}
              checked={showEdgeColor}
              onCheckedChange={checked => handleCheckBox(checked, 'showEdgeColor')}
              className="border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
            />
            <Label htmlFor={showEdgeColorId} className="text-xs font-medium text-gray-600 cursor-pointer select-none grow">
              Show edge colors based on interaction type
            </Label>
          </div>

          <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1 hover:bg-white/60 transition-colors">
            <Checkbox
              id={highlightNeighborNodesId}
              checked={highlightNeighborNodes}
              onCheckedChange={checked => handleCheckBox(checked, 'highlightNeighborNodes')}
              className="border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
            />
            <Label htmlFor={highlightNeighborNodesId} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 cursor-pointer select-none grow">
              <span>Highlight neighbor genes</span>
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
                  className="max-w-xs p-2.5 text-xs bg-emerald-600 text-white border-none shadow-md rounded-lg leading-relaxed font-medium"
                >
                  When enabled, hovering over any marker dim-out irrelevant layers to emphasize local topological neighborhood connections.
                </TooltipContent>
              </Tooltip>
            </Label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          <Label htmlFor="defaultNodeColor" className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
            Default Node Canvas Color
          </Label>
          <ColorPicker color={defaultNodeColor} property="defaultNodeColor" className="w-full shadow-3xs border-gray-200 rounded-lg" />
        </div>
      </div>

    </div>
  );
}