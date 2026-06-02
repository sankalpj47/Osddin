'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Search, Network } from 'lucide-react';

import { Chat } from '@/components/chat';
import { SearchTab, UploadTab } from '@/components/explore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
function ExploreContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') ?? undefined;

  const defaultTab = ['search', 'upload', 'knowledge-graph'].includes(tabParam ?? '')
    ? tabParam
    : 'search';

  return (
    <div className="relative mx-auto min-h-[60vh] max-w-7xl">
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-2 xl:items-stretch">

        {/* Left Panel */}
        <div className="min-h-0 flex flex-col h-full">
          <Tabs defaultValue={defaultTab} className="flex min-h-0 flex-col">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-[#d6eaea] p-2">
              <TabsTrigger
                value="search"
                className="h-[90px] min-w-0 whitespace-normal rounded-lg border-0 px-5 py-3
                data-[state=active]:bg-white
                data-[state=active]:shadow-sm"
              >
                <div className="flex w-full min-w-0 items-center gap-4">
                  <Search className="h-5 w-5 shrink-0 text-slate-400" />
                  <div className="flex min-w-0 flex-col items-start text-left">
                    <span className="text-[15px] font-semibold leading-tight text-slate-900">
                      Search by Multiple Genes
                    </span>
                    <span className="mt-1 text-[11px] leading-snug text-slate-600">
                      Paste genes/ENSG IDs and verify before building
                    </span>
                  </div>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="upload"
                className="h-[90px] min-w-0 whitespace-normal rounded-lg border-0 px-5 py-3
                data-[state=active]:bg-white
                data-[state=active]:shadow-sm"
              >
                <div className="flex w-full min-w-0 items-center gap-4">
                  <Network className="h-5 w-5 shrink-0 text-slate-400" />
                  <div className="flex min-w-0 flex-col items-start text-left">
                    <span className="text-[15px] font-semibold leading-tight text-slate-900">
                      Upload Graph Data
                    </span>
                    <span className="mt-1 text-[11px] leading-snug text-slate-600">
                      Upload your own graph data in supported formats and explore
                    </span>
                  </div>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="mt-4 flex-1 min-h-0">
              <SearchTab />
            </TabsContent>

            <TabsContent value="upload" className="mt-4 flex-1 min-h-0">
              <UploadTab />
            </TabsContent>
          </Tabs>

          <div className="mt-4 xl:hidden h-[648px]">
            <Chat />
          </div>
        </div>
       <div className="hidden xl:flex h-full flex-col">
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  return (
    <Suspense fallback={<div className='relative mx-auto min-h-[60vh] max-w-7xl' />}>
      <ExploreContent />
    </Suspense>
  );
}