'use client';

import React, { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { 
  ActivityIcon, 
  SlidersIcon, 
  PaintbrushIcon,
  ChevronDown,
  ChevronRight 
} from 'lucide-react';
import { KGLegend, KGNetworkAnalysis, KGNetworkInfo, KGNetworkLayout, KGNetworkStyle, KGRadialAnalysis } from '.';

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
    <div className="mb-2 flex flex-col rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden transition-all duration-200">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between bg-white px-3 py-2 select-none hover:bg-gray-50/80 active:bg-gray-50"
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
        <div className="border-t border-gray-100 p-2 bg-white text-gray-600 animate-in fade-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * KGRightSideBar - Main right panel matching original RightSideBar layout
 * All collapsible sections, same ordering and styling
 */
export function KGRightSideBar() {
  return (
    <ScrollArea className="flex h-[calc(96vh-1.5px)] w-full min-w-0 flex-col bg-background p-2 text-xs select-none border-l">
      <SectionModule title="Network Info" icon={<ActivityIcon className="size-5" />}>
        <KGNetworkInfo />
      </SectionModule>
      <SectionModule title="Legend" icon={<ActivityIcon className="size-5" />}>
        <KGLegend />
      </SectionModule>
      <SectionModule title="Network Style" icon={<PaintbrushIcon className="size-5" />} defaultOpen={false}>
        <KGNetworkStyle />
      </SectionModule>
      <SectionModule title="Network Analysis" icon={<ActivityIcon className="size-5" />}>
        <KGNetworkAnalysis>
          <KGRadialAnalysis />
        </KGNetworkAnalysis>
      </SectionModule>
      <SectionModule title="Network Layout" icon={<SlidersIcon className="size-5" />} defaultOpen={false}>
        <KGNetworkLayout />
      </SectionModule>
    </ScrollArea>
  );
}
