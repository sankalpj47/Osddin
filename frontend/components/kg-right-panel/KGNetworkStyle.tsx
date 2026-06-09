'use client';

import type { CheckedState } from '@radix-ui/react-checkbox';
import { ChevronsUpDownIcon, HelpCircleIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useEffect, useId } from 'react';
import type { KGStore } from '@/lib/hooks';
import { useKGStore } from '@/lib/hooks';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function KGNetworkStyle() {
  const defaultNodeSize = useKGStore(state => state.defaultNodeSize);
  const defaultLabelDensity = useKGStore(state => state.defaultLabelDensity);
  const defaultLabelSize = useKGStore(state => state.defaultLabelSize);
  const showEdgeColor = useKGStore(state => state.showEdgeColor);
  const edgeOpacity = useKGStore(state => state.edgeOpacity);
  const edgeWidth = useKGStore(state => state.edgeWidth);
  const highlightNeighborNodes = useKGStore(state => state.highlightNeighborNodes);
  const proportionalSizing = useKGStore(state => state.proportionalSizing);
  const sigmaInstance = useKGStore(state => state.sigmaInstance);
  const graph = sigmaInstance?.getGraph();

  const handleCheckBox = (checked: CheckedState, key: keyof KGStore) => {
    if (checked === 'indeterminate') return;
    useKGStore.setState({ [key]: checked });
  };

  const handleDefaultChange = (value: number | string, key: keyof KGStore) => {
    useKGStore.setState({ [key]: value });
  };

  const defaultNodeSizeId = useId();
  const defaultLabelSizeId = useId();
  const defaultLabelDensityId = useId();
  const showEdgeColorId = useId();
  const edgeOpacityId = useId();
  const edgeWidthId = useId();
  const highlightNeighborNodesId = useId();
  const proportionalSizingId = useId();

  // Apply label density changes to Sigma instance
  useEffect(() => {
    sigmaInstance?.setSettings({
      labelDensity: defaultLabelDensity,
    });
  }, [defaultLabelDensity, sigmaInstance]);

  // Apply label size changes to Sigma instance
  useEffect(() => {
    sigmaInstance?.setSettings({
      labelSize: defaultLabelSize,
    });
  }, [defaultLabelSize, sigmaInstance]);

  // Apply node size changes to graph
  useEffect(() => {
    if (!graph) return;
    if (proportionalSizing) {
      let maxDegree = 0;
      let minDegree = Infinity;
      graph.forEachNode((node: string) => {
        const degree = graph.degree(node);
        if (degree > maxDegree) maxDegree = degree;
        if (degree < minDegree) minDegree = degree;
      });
      graph.forEachNode((node: string) => {
        const degree = graph.degree(node);
        const baseSize = defaultNodeSize;
        graph.setNodeAttribute(node, 'size', degree === 0 ? baseSize : baseSize * Math.sqrt(degree / maxDegree));
      });
    } else {
      graph.forEachNode((node: string) => {
        graph.setNodeAttribute(node, 'size', defaultNodeSize);
      });
    }
  }, [defaultNodeSize, proportionalSizing, graph]);

  // Apply edge opacity changes to graph
  useEffect(() => {
    if (!graph) return;
    graph.forEachEdge((edge: string, attributes) => {
      const color = attributes.color as string;
      const rgb = color.match(/\d+/g);
      if (rgb && rgb.length === 3) {
        const newColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${edgeOpacity})`;
        graph.setEdgeAttribute(edge, 'color', newColor);
      }
    });
  }, [edgeOpacity, graph]);

  // Apply edge width changes to graph
  useEffect(() => {
    if (!graph) return;
    graph.forEachEdge((edge: string) => {
      graph.setEdgeAttribute(edge, 'size', edgeWidth);
    });
  }, [edgeWidth, graph]);

  return (
    <Collapsible defaultOpen className='mb-2 rounded-xl border border-gray-200 bg-white p-2 text-xs shadow-sm'>
      <div className='flex w-full items-center justify-between'>
        <p className='font-bold text-gray-800'>Network Style</p>
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
        {/* Node Sizing and Configurations */}
        <div className='group flex items-center justify-between rounded-lg p-1 transition-colors hover:bg-gray-50'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id={proportionalSizingId}
              checked={proportionalSizing}
              onCheckedChange={checked => handleCheckBox(checked, 'proportionalSizing')}
            />
            <Label
              htmlFor={proportionalSizingId}
              className='flex cursor-pointer items-center gap-1 font-semibold text-gray-500 text-xs transition-colors group-has-:checked:text-gray-900'
            >
              Proportional Node Sizing
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircleIcon size={12} className='text-gray-400 transition-colors hover:text-primary' />
                </TooltipTrigger>
                <TooltipContent className='max-w-60' align='end'>
                  Size nodes proportionally based on their degree (number of connections)
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
                  Node Dimensions
                </div>
                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor={defaultNodeSizeId} className='font-semibold text-gray-700 text-xs'>
                      Node Size
                    </Label>
                    <Input
                      type='number'
                      className='h-6 w-12 border-gray-200 p-0.5 text-center text-xs focus-visible:ring-primary'
                      min={1}
                      max={50}
                      step={1}
                      value={defaultNodeSize}
                      onChange={e => handleDefaultChange(parseInt(e.target.value, 10) || 1, 'defaultNodeSize')}
                    />
                  </div>
                  <Slider
                    id={defaultNodeSizeId}
                    className='w-full'
                    min={1}
                    max={50}
                    step={1}
                    value={[defaultNodeSize]}
                    onValueChange={value => handleDefaultChange(value?.[0], 'defaultNodeSize')}
                  />
                  <div className='flex items-center justify-between font-mono text-[10px] text-gray-500'>
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Labels Density and Sizing Layout */}
        <div className='group flex items-center justify-between rounded-lg p-1 transition-colors hover:bg-gray-50'>
          <div className='flex items-center space-x-2'>
            <div className='flex size-3.5 select-none items-center justify-center rounded-sm border border-gray-200 bg-gray-50 font-bold text-[9px] text-gray-500'>
              Aa
            </div>
            <Label className='font-semibold text-gray-700 text-xs'>Label Density</Label>
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
              <div className='space-y-3.5'>
                <div className='border-gray-100 border-b pb-1 font-semibold text-[11px] text-gray-500 uppercase tracking-wide'>
                  Label Options
                </div>
                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor={defaultLabelSizeId} className='font-semibold text-gray-700 text-xs'>
                      Label Size
                    </Label>
                    <Input
                      type='number'
                      className='h-6 w-12 border-gray-200 p-0.5 text-center text-xs focus-visible:ring-primary'
                      min={1}
                      max={25}
                      step={1}
                      value={defaultLabelSize}
                      onChange={e => handleDefaultChange(parseInt(e.target.value, 10) || 1, 'defaultLabelSize')}
                    />
                  </div>
                  <Slider
                    id={defaultLabelSizeId}
                    className='w-full'
                    min={1}
                    max={25}
                    step={1}
                    value={[defaultLabelSize]}
                    onValueChange={value => handleDefaultChange(value?.[0], 'defaultLabelSize')}
                  />
                  <div className='flex items-center justify-between font-mono text-[10px] text-gray-500'>
                    <span>1</span>
                    <span>25</span>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <Label
                      htmlFor={defaultLabelDensityId}
                      className='flex items-center gap-1 font-semibold text-gray-700 text-xs'
                    >
                      Label Density
                    </Label>
                    <Input
                      type='number'
                      className='h-6 w-12 border-gray-200 p-0.5 text-center text-xs focus-visible:ring-primary'
                      min={0}
                      max={10}
                      step={0.1}
                      value={defaultLabelDensity}
                      onChange={e => handleDefaultChange(parseFloat(e.target.value) || 0, 'defaultLabelDensity')}
                    />
                  </div>
                  <Slider
                    id={defaultLabelDensityId}
                    className='w-full'
                    min={0}
                    max={10}
                    step={0.1}
                    value={[defaultLabelDensity]}
                    onValueChange={value => handleDefaultChange(value?.[0], 'defaultLabelDensity')}
                  />
                  <div className='flex items-center justify-between font-mono text-[10px] text-gray-500'>
                    <span>0</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Edge Customizations and Formatting */}
        <div className='group flex items-center justify-between rounded-lg p-1 transition-colors hover:bg-gray-50'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id={showEdgeColorId}
              checked={showEdgeColor}
              onCheckedChange={checked => handleCheckBox(checked, 'showEdgeColor')}
            />
            <Label
              htmlFor={showEdgeColorId}
              className='cursor-pointer font-semibold text-gray-500 text-xs transition-colors group-has-:checked:text-gray-900'
            >
              Show Edge Color
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
              <div className='space-y-3.5'>
                <div className='border-gray-100 border-b pb-1 font-semibold text-[11px] text-gray-500 uppercase tracking-wide'>
                  Edge Dimensions
                </div>
                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor={edgeOpacityId} className='font-semibold text-gray-700 text-xs'>
                      Edge Opacity
                    </Label>
                    <Input
                      type='number'
                      min={0}
                      max={1}
                      step={0.1}
                      value={edgeOpacity}
                      onChange={e => handleDefaultChange(parseFloat(e.target.value) || 0, 'edgeOpacity')}
                      className='h-6 w-12 border-gray-200 p-0.5 text-center text-xs focus-visible:ring-primary'
                    />
                  </div>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    id={edgeOpacityId}
                    value={[edgeOpacity]}
                    onValueChange={e => handleDefaultChange(e[0], 'edgeOpacity')}
                  />
                  <div className='flex items-center justify-between font-mono text-[10px] text-gray-500'>
                    <span>0</span>
                    <span>1</span>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor={edgeWidthId} className='font-semibold text-gray-700 text-xs'>
                      Edge Width
                    </Label>
                    <Input
                      type='number'
                      min={0.1}
                      max={10}
                      step={0.1}
                      value={edgeWidth}
                      onChange={e => handleDefaultChange(parseFloat(e.target.value) || 0.1, 'edgeWidth')}
                      className='h-6 w-12 border-gray-200 p-0.5 text-center text-xs focus-visible:ring-primary'
                    />
                  </div>
                  <Slider
                    min={0.1}
                    max={10}
                    step={0.1}
                    id={edgeWidthId}
                    value={[edgeWidth]}
                    onValueChange={e => handleDefaultChange(e[0], 'edgeWidth')}
                  />
                  <div className='flex items-center justify-between font-mono text-[10px] text-gray-500'>
                    <span>0.1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <hr className='my-0.5 border-gray-100' />

        {/* Global Interactions */}
        <div className='group flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-gray-50'>
          <Checkbox
            id={highlightNeighborNodesId}
            checked={highlightNeighborNodes}
            onCheckedChange={checked => handleCheckBox(checked, 'highlightNeighborNodes')}
          />
          <Label
            htmlFor={highlightNeighborNodesId}
            className='flex cursor-pointer items-center gap-1 font-semibold text-gray-500 text-xs transition-colors group-has-:checked:text-gray-900'
          >
            Highlight Neighbor Nodes
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircleIcon size={12} className='text-gray-400 transition-colors hover:text-primary' />
              </TooltipTrigger>
              <TooltipContent className='max-w-60' align='end'>
                Upon checked, highlights the neighbors of the hovered nodes
              </TooltipContent>
            </Tooltip>
          </Label>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
