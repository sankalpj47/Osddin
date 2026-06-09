'use client';

import { FolderUpIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { type EventMessage, Events, eventEmitter } from '@/lib/utils';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const exportOptions = [
  { label: 'csv', hasSubmenu: true },
  { label: 'png', hasSubmenu: false },
] as const;

export function Export() {
  const [csvSelections, setCsvSelections] = useState<{ universal: boolean; interaction: boolean }>({
    universal: false,
    interaction: false,
  });

  const handleCheckboxChange = (type: 'universal' | 'interaction') => {
    setCsvSelections(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleCsvExport = () => {
    const { universal, interaction } = csvSelections;
    if (!universal && !interaction) return;

    const csvType = universal && interaction ? 'both' : universal ? 'universal' : 'interaction';
    eventEmitter.emit(Events.EXPORT, { format: 'csv', all: true, csvType } satisfies EventMessage[Events.EXPORT]);
  };

  const universalCheckBoxId = useId();
  const interactionCheckBoxId = useId();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* CRITICAL FIXES APPLIED:
          - Replaced rigid w-[calc(100%-1.5rem)] with w-full to adapt to the 50/50 sidebar grid.
          - Stripped hardcoded zinc background and margin-bottom shifts.
          - Styled to match the "Shortcuts" component button structure exactly.
        */}
        <Button
          variant="outline"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition-colors hover:bg-gray-50 active:bg-gray-100"
        >
          <FolderUpIcon className="size-3.5 text-gray-500" />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      
      {/* Modernized dropdown menu layout theme overlays */}
      <DropdownMenuContent className="z-10 w-40 gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-md">
        {exportOptions.map(opt =>
          opt.hasSubmenu ? (
            <DropdownMenuSub key={opt.label}>
              <DropdownMenuSubTrigger className="cursor-pointer text-xs font-medium text-gray-700 focus:bg-gray-50 data-[state=open]:bg-gray-50">
                {opt.label.toUpperCase()}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="z-20 flex w-48 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <div className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 hover:bg-gray-50">
                  <Checkbox
                    id={universalCheckBoxId}
                    checked={csvSelections.universal}
                    onCheckedChange={() => handleCheckboxChange('universal')}
                    className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor={universalCheckBoxId} className="text-xs font-medium text-gray-600 cursor-pointer select-none grow">
                    Universal
                  </label>
                </div>
                
                <div className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 hover:bg-gray-50">
                  <Checkbox
                    id={interactionCheckBoxId}
                    checked={csvSelections.interaction}
                    onCheckedChange={() => handleCheckboxChange('interaction')}
                    className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor={interactionCheckBoxId} className="text-xs font-medium text-gray-600 cursor-pointer select-none grow">
                    Interaction
                  </label>
                </div>
                
                <Button
                  size="sm"
                  className="mt-1 h-8 rounded-lg bg-primary text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:bg-gray-100 disabled:text-gray-400"
                  onClick={handleCsvExport}
                  disabled={!csvSelections.universal && !csvSelections.interaction}
                >
                  Confirm Export
                </Button>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem
              key={opt.label}
              onClick={() => eventEmitter.emit(Events.EXPORT, { format: opt.label, all: true })}
              className="cursor-pointer text-xs font-medium text-gray-700 rounded-md px-2 py-1.5 focus:bg-gray-50 focus:text-gray-900"
            >
              {opt.label.toUpperCase()}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}