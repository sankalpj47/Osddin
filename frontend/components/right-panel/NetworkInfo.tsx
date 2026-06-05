'use client';

import { ActivityIcon, Layers3Icon, SparklesIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { columnGseaResults, columnSelectedNodes } from '@/lib/data';
import { useStore } from '@/lib/hooks';
import type { Gsea } from '@/lib/interface';
import { envURL } from '@/lib/utils';
import PopUpDataTable from '../PopUpDataTable';
import { Button } from '../ui/button';

export function NetworkInfo() {
  const totalNodes = useStore(state => state.networkStatistics.totalNodes);
  const totalEdges = useStore(state => state.networkStatistics.totalEdges);
  const selectedNodes = useStore(state => state.selectedNodes);
  const [showTable, setShowTable] = React.useState(false);
  const [gseaData, setGseaData] = React.useState<Array<Gsea>>([]);
  const [gseaLoading, setGseaLoading] = React.useState(false);

  useEffect(() => {
    if (selectedNodes.length === 0) {
      setGseaData([]);
      return;
    }
    (async () => {
      setGseaLoading(true);
      try {
        const response = await fetch(`${envURL(process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL)}/gsea`, {
          method: 'POST',
          body: JSON.stringify(selectedNodes.map(node => node.Gene_Name)),
          headers: { 'Content-Type': 'application/json' },
          cache: 'force-cache',
        });
        if (!response.ok) throw new Error('GSEA calculation failed');
        const data: Array<Gsea> = await response.json();
        setGseaData(data);
      } catch (error) {
        console.error('Error fetching GSEA details:', error);
        setGseaData([]);
      } finally {
        setGseaLoading(false);
      }
    })();
  
  }, [selectedNodes]);

  return (
    <div className="w-full flex flex-col min-w-0">
      

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50/50 p-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-600">
            <Layers3Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Nodes</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">{totalNodes ?? 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50/50 p-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-600">
            <ActivityIcon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Edges</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">{totalEdges ?? 0}</p>
          </div>
        </div>
      </div>


      <div className="flex flex-col">
        {selectedNodes.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTable(true)}
            className="h-8.5 w-full gap-2 text-xs font-semibold text-gray-700 bg-white border-gray-200 hover:bg-gray-50 rounded-lg shadow-3xs animate-in fade-in duration-200"
          >
            <SparklesIcon className="size-3.5 text-teal-600 animate-pulse" />
            <span>Selected node({selectedNodes.length})</span>
          </Button>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-[11px] text-gray-400">
            Click or drag-select items on the network
          </div>
        )}

        <PopUpDataTable
          data={[selectedNodes, gseaData]}
          columns={[columnSelectedNodes, columnGseaResults]}
          dialogTitle="Selected Network Elements"
          open={showTable}
          loading={[false, gseaLoading]}
          setOpen={setShowTable}
          filterColumnNames={['Gene_Name', 'Pathway']}
          description="Examine full data attributes on current active node layers, or switch to the GSEA tab to query enriched pathway categories calculated via the analytical background tasks."
        />
      </div>
    </div>
  );
}