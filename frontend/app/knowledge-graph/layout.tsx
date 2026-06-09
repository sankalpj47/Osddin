'use client';

import { ChevronLeft, ChevronRight, FileTextIcon, HomeIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';
import { KGLeftSideBar } from '@/components/kg-left-panel';
import { KGRightSideBar } from '@/components/kg-right-panel';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Lazy-load statistics component only when needed
const KGStatisticsTab = dynamic(
  () => import('@/components/statistics/KGStatisticsTab').then(mod => mod.KGStatisticsTab),
  {
    loading: () => (
      <div className='grid h-full place-items-center'>
        <Spinner />
      </div>
    ),
    ssr: false,
  },
);

export default function KnowledgeGraphLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState<'Network' | 'Statistics'>('Network');
  const [leftSidebar, setLeftSidebar] = React.useState<boolean>(true);
  const [rightSidebar, setRightSidebar] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (activeTab === 'Network') {
      window.dispatchEvent(new Event('resize'));
    }
  }, [activeTab]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={value => setActiveTab(value as 'Network' | 'Statistics')}
      className='flex h-screen flex-col bg-gray-100'
    >
      <div className='flex h-10 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-xs'>
        <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-gray-100' onClick={() => setLeftSidebar(!leftSidebar)}>
          {leftSidebar ? <ChevronLeft className='size-4 text-gray-600' /> : <ChevronRight className='size-4 text-gray-600' />}
        </Button>
        <TabsList className='flex h-9 bg-gray-100 p-1 rounded-lg border border-gray-200/60 w-1/3 min-w-[400px]'>
          <TabsTrigger className='flex-1 text-xs font-medium' value='Network'>
            Graph Visualization
          </TabsTrigger>
          <TabsTrigger className='flex-1 text-xs font-medium' value='Statistics'>
            Graph Statistics
          </TabsTrigger>
        </TabsList>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1 border-r border-gray-200 pr-2 mr-1'>
            <Link
              href={'/'}
              className='flex h-8 items-center rounded-md px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900'
            >
              <HomeIcon className='mr-1.5 inline size-3.5' /> Home
            </Link>
            <Link
              href={'/docs'}
              target='_blank'
              className='flex h-8 items-center rounded-md px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900'
            >
              <FileTextIcon className='mr-1.5 inline size-3.5' /> Docs
            </Link>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-gray-100'
            onClick={() => setRightSidebar(!rightSidebar)}
          >
            {rightSidebar ? <ChevronRight className='size-4 text-gray-600' /> : <ChevronLeft className='size-4 text-gray-600' />}
          </Button>
        </div>
      </div>
      <ResizablePanelGroup direction='horizontal' className='flex flex-1'>
        <ResizablePanel defaultSize={16} minSize={16} className={leftSidebar ? 'block' : 'hidden'}>
          <KGLeftSideBar />
        </ResizablePanel>
        <ResizableHandle withHandle className={leftSidebar ? 'flex' : 'hidden'} />
        <ResizablePanel defaultSize={68} className='h-full bg-white'>
          <TabsContent
            forceMount
            value='Network'
            className={cn('mt-0 h-full', activeTab === 'Network' ? 'visible' : 'invisible fixed')}
          >
            {children}
          </TabsContent>
          <TabsContent value='Statistics' className='mt-0 h-full'>
            <ScrollArea className='h-full'>
              <KGStatisticsTab />
            </ScrollArea>
          </TabsContent>
        </ResizablePanel>
        <ResizableHandle withHandle className={rightSidebar ? 'flex' : 'hidden'} />
        <ResizablePanel defaultSize={16} minSize={16} className={rightSidebar ? 'block' : 'hidden'}>
          <KGRightSideBar />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Tabs>
  );
}
