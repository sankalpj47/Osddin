'use client';

import React, { useState } from 'react';
import { 
  ActivityIcon, 
  InfoIcon, 
  LayersIcon, 
  SlidersIcon, 
  PaintbrushIcon,
  ChevronDown,
  ChevronRight 
} from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { 
  NetworkAnalysis, 
  NetworkLayout, 
  NetworkStyle, 
  RadialAnalysis 
} from '.';

interface SectionWrapperProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// Collapsible Module Section Wrapper with clean state handling
function SectionModule({ title, icon, children, defaultOpen = true }: SectionWrapperProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-3 flex flex-col rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden transition-all duration-200">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between bg-white px-4 py-3 select-none hover:bg-gray-50/80 active:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-gray-800 tracking-tight">
            {title}
          </span>
        </div>
        <div className="text-gray-400 shrink-0 p-0.5 rounded-md">
          {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="border-t border-gray-100 p-3 bg-white text-gray-600 animate-in fade-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

export function RightSideBar() {
  return (
    <ScrollArea className="flex h-full w-full min-w-0 flex-col bg-[#F8F9FA] p-3 text-xs select-none">
      <SectionModule title="Network Analysis" icon={<ActivityIcon className="size-5" />}>
        <NetworkAnalysis>
          <RadialAnalysis />
        </NetworkAnalysis>
      </SectionModule>
      <SectionModule title="Network Layout" icon={<SlidersIcon className="size-5" />} defaultOpen={false}>
        <NetworkLayout />
      </SectionModule>
      <SectionModule title="Network Style" icon={<PaintbrushIcon className="size-5" />} defaultOpen={false}>
        <NetworkStyle />
      </SectionModule>

    </ScrollArea>
  );
}