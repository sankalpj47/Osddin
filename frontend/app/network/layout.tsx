'use client';

import { ChevronLeft, ChevronRight, FileTextIcon, HomeIcon } from 'lucide-react';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { FileName } from '@/components/app';
import { LeftSideBar } from '@/components/left-panel';
import { RightSideBar } from '@/components/right-panel';
import { OpenTargetsHeatmap, StatisticsTab } from '@/components/statistics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function NetworkLayoutPage({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState<'Network' | 'Statistics' | 'Heatmap'>('Network');
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
      onValueChange={value => setActiveTab(value as 'Network' | 'Statistics' | 'Heatmap')}
      className='flex h-screen flex-col bg-[#ECEFF1]'
    >
      <div className='flex h-10 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-xs'>
        <div className='flex items-center gap-2'>
          <Button 
            variant='ghost' 
            size='icon' 
            className='h-8 w-8 hover:bg-gray-100' 
            onClick={() => setLeftSidebar(!leftSidebar)}
          >
            {leftSidebar ? <ChevronLeft className='size-4 text-gray-600' /> : <ChevronRight className='size-4 text-gray-600' />}
          </Button>
          <Suspense fallback={<Input className='h-8 max-w-xs font-semibold text-sm bg-transparent border-none' defaultValue='Untitled' />}>
            <FileName />
          </Suspense>
        </div>

        <TabsList className='flex h-9 bg-gray-100 p-1 rounded-lg border border-gray-200/60 w-1/3 min-w-[400px]'>
          <TabsTrigger className='flex-1 text-xs font-medium' value='Network'>
            Network Visualization
          </TabsTrigger>
          <TabsTrigger className='flex-1 text-xs font-medium' value='Statistics'>
            Graph Statistics
          </TabsTrigger>
          <TabsTrigger className='flex-1 text-xs font-medium' value='Heatmap'>
            OpenTargets Heatmap
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
      <ResizablePanelGroup direction='horizontal' className='flex flex-1 w-full overflow-hidden'>

        {leftSidebar && (
          <>
            <ResizablePanel 
              defaultSize={18} 
              minSize={15} 
              maxSize={25} 
              className='h-full overflow-x-hidden border-r border-gray-200 bg-white'
            >
              <div className='w-full min-w-0 h-full p-1'>
                <LeftSideBar />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className='bg-gray-200 hover:bg-teal-600 transition-colors w-1' />
          </>
        )}

        <ResizablePanel defaultSize={leftSidebar && rightSidebar ? 64 : leftSidebar || rightSidebar ? 82 : 100} className='h-full bg-white relative'>
          <TabsContent
            forceMount
            value='Network'
            className={cn('mt-0 h-full w-full', activeTab === 'Network' ? 'visible' : 'invisible fixed')}
          >
            {children}
          </TabsContent>
          <TabsContent value='Statistics' className='mt-0 h-full w-full'>
            <ScrollArea className='h-full w-full'>
              <StatisticsTab />
            </ScrollArea>
          </TabsContent>
          <TabsContent value='Heatmap' className='mt-0 h-full w-full'>
            <ScrollArea className='h-full w-full'>
              <OpenTargetsHeatmap />
            </ScrollArea>
          </TabsContent>
        </ResizablePanel>
        {rightSidebar && (
          <>
            <ResizableHandle withHandle className='bg-gray-200 hover:bg-teal-600 transition-colors w-1' />
            <ResizablePanel 
              defaultSize={18} 
              minSize={15} 
              maxSize={25} 
              className='h-full overflow-x-hidden border-l border-gray-200 bg-white'
            >
              <div className='w-full min-w-0 h-full p-1'>
                <RightSideBar />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </Tabs>
  );
}