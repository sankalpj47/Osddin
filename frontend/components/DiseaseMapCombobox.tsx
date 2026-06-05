'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { CheckIcon, ChevronsUpDownIcon, InfoIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { GetDiseaseData } from '@/lib/interface';
import { OptimizedMedicalSearch, type SearchItem } from '@/lib/search';
import { cn } from '@/lib/utils';
import { Spinner } from './ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface VirtualizedCommandProps {
  options: SearchItem[];
  selectedOption: string;
  onSelectOption?: (option: string) => void;
}

const VirtualizedCommand = ({ options, selectedOption, onSelectOption }: VirtualizedCommandProps) => {
  const searchEngine = React.useMemo(() => {
    return new OptimizedMedicalSearch(options);
  }, [options]);

  const [filteredOptions, setFilteredOptions] = React.useState<SearchItem[]>(options);
  const parentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 38, 
    overscan: 6,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const handleSearch = React.useCallback(
    (search: string) => {
      if (!search || search.trim().length < 2) {
        setFilteredOptions(options);
        return;
      }
      searchEngine.debouncedSearch(search.trim(), results => setFilteredOptions(results));
    },
    [options, searchEngine],
  );

  return (
    <Command className="w-full" shouldFilter={false}>
      <CommandInput onValueChange={handleSearch} placeholder="Search Disease..." className="h-9" />
      <CommandList ref={parentRef} className="max-h-[300px] overflow-y-auto">
        {options.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <Spinner variant={1} size="small" />
          </div>
        ) : filteredOptions.length === 0 ? (
          <CommandEmpty className="py-4 text-center text-xs text-gray-500">No Result Found.</CommandEmpty>
        ) : (
          <CommandGroup>
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualOptions.map(virtualOption => {
                const option = filteredOptions[virtualOption.index];
                if (!option) return null;
                
                return (
                  <CommandItem
                    className="absolute top-0 left-0 flex w-full items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer"
                    style={{
                      height: '38px',
                      transform: `translateY(${virtualOption.start}px)`,
                    }}
                    key={option.id}
                    value={option.id}
                    onSelect={onSelectOption}
                  >
                    <div className="flex items-center min-w-0 pr-2">
                      <CheckIcon
                        className={cn('mr-2 size-3.5 shrink-0 text-teal-600', selectedOption === option.id ? 'opacity-100' : 'opacity-0')}
                      />
                      <span className="truncate font-medium text-gray-700">{option.label}</span>
                    </div>
                    {option.description && (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <div onClick={(e) => e.stopPropagation()} className="p-0.5 hover:bg-gray-100 rounded-sm">
                            <InfoIcon className="size-3.5 text-gray-400 hover:text-gray-600 cursor-help shrink-0" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center" className="max-w-xs text-xs leading-normal p-2 shadow-md">
                          {option.description}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
};

interface DiseaseMapComboboxProps {
  className?: string;
  data?: GetDiseaseData;
  value: string;
  onChange: (value: string) => void;
  align?: 'start' | 'end' | 'center';
}

export function DiseaseMapCombobox({
  className,
  data = [],
  value,
  onChange,
  align = 'start',
}: DiseaseMapComboboxProps) {
  const [open, setOpen] = React.useState<boolean>(false);

  const searchItems: SearchItem[] = React.useMemo(
    () =>
      data.map(item => ({
        id: item.ID,
        label: item.name ? `${item.name} (${item.ID})` : item.ID,
        description: item.description,
      })),
    [data],
  );

  const optionsMap = React.useMemo(() => {
    const map = new Map<string, SearchItem>();
    for (const option of searchItems) {
      map.set(option.id, option);
    }
    return map;
  }, [searchItems]);

  const selectedLabel = optionsMap.get(value)?.label || 'Search Disease...';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-9 w-full justify-between rounded-lg border border-gray-200 bg-white px-3 text-left text-xs font-semibold text-gray-700 shadow-xs transition-all hover:bg-gray-50 focus:border-teal-500 focus:ring-1 focus:ring-teal-500',
            className,
          )}
        >
          <span className="truncate pr-2">{selectedLabel}</span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 text-gray-400 opacity-80" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[360px] p-0 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden"
      >
        <VirtualizedCommand
          options={searchItems}
          selectedOption={value}
          onSelectOption={currentValue => {
            onChange(currentValue);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}