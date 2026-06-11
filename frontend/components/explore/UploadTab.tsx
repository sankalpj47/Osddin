'use client';

import { useLazyQuery } from '@apollo/client/react';
import { InfoIcon, LoaderIcon } from 'lucide-react';
import React, { useId, useState } from 'react';
import { toast } from 'sonner';
import AnimatedNetworkBackground from '@/components/AnimatedNetworkBackground';
import PopUpTable from '@/components/PopUpTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GENE_VERIFICATION_QUERY } from '@/lib/gql';
import { parseKnowledgeGraph } from '@/lib/graph/parse-upload';
import type { GeneVerificationData, GeneVerificationVariables } from '@/lib/interface';
import { NETWORK_STORAGE_KEYS } from '@/lib/interface/knowledge-graph';
import { distinct, idbRequestToPromise, idbTransactionDone, openDB } from '@/lib/utils';
import { detectUploadType } from '@/utils/filedetector';

const SUPPORTED_FORMATS = {
  network: {
    title: 'Gene Networks',
    desc: 'Upload gene-gene interaction with confidence scores.',
    exts: ['CSV'],
    preview: 'gene1,gene2,score\nBRCA1,TP53,0.95\nTP53,EGFR,0.87\nAKT1,MTOR,0.99',
    links: [{ label: 'CSV', href: '/examples/network.csv' }],
    //  { label: 'JSON', href: '/examples/network.json' }
  },
  kg: {
    title: 'Knowledge Graphs',
    desc: 'Upload entities and relationships between biological concept.',
    exts: ['CSV'],
    preview: 'source_id,target_id,edge_type\nBRCA1,BreastCancer,ASSOCIATES\nEGFR,Erlotinib,TARGETED_BY',
    links: [
      { label: 'CSV', href: '/examples/kg.csv' },
      // { label: 'JSON', href: '/examples/kg.json' },
      // { label: 'GraphML', href: '/examples/kg.graphml' },
      // { label: 'GEXF', href: '/examples/kg.gexf' },
      // { label: 'ZIP', href: '/examples/kg.zip' }
    ],
  },
};

export function UploadTab() {
  const [verifyGenes, { data }] = useLazyQuery<GeneVerificationData, GeneVerificationVariables>(
    GENE_VERIFICATION_QUERY,
  );
  const [file, setFile] = useState<File | null>(null);
  const [tableOpen, setTableOpen] = useState(false);
  const [geneIDs, setGeneIDs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const uploadFileId = useId();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'json', 'graphml', 'gexf', 'zip'].includes(ext)) {
      toast.error('Invalid file type', {
        description: 'Supported formats: CSV, JSON, GraphML, GEXF, ZIP',
      });
      e.currentTarget.value = '';
      return;
    }
    setFile(f);
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      toast.error('Please upload a file');
      return;
    }

    setLoading(true);
    try {
      const uploadType = await detectUploadType(file);
      if (uploadType === 'knowledge-graph') {
        try {
          const graphData = await parseKnowledgeGraph([file]);
          graphData.attributes = {
            ...graphData.attributes,
            originalFileName: file.name,
            uploadedAt: Date.now(),
            fileSize: file.size,
          };

          const store = await openDB('network', 'readwrite');
          if (!store) throw new Error('Failed to open storage');

          try {
            await store.delete(NETWORK_STORAGE_KEYS.KNOWLEDGE_GRAPH);
          } catch {}
          const transactionDone = idbTransactionDone(store.transaction);
          await idbRequestToPromise(store.put(graphData, NETWORK_STORAGE_KEYS.KNOWLEDGE_GRAPH));
          await transactionDone;

          toast.success('Knowledge graph uploaded successfully');
          window.open('/knowledge-graph', '_blank');
          return;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to parse graph');
          return;
        }
      }

      let distinctSeedGenes: string[] = [];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'json') {
        const jsonData = JSON.parse(await file.text());
        distinctSeedGenes = distinct(
          jsonData
            .flatMap(
              (gene: Record<string, string | number>) =>
                Object.values(gene).filter(val => Number.isNaN(Number(val))) as string[],
            )
            .map((gene: string) => gene.trim().toUpperCase()),
        );
      } else if (ext === 'csv') {
        const csvText = await file.text();
        distinctSeedGenes = distinct(
          csvText
            .split('\n')
            .slice(1)
            .flatMap(line => line.split(',').slice(0, 2))
            .map(gene => gene.trim().toUpperCase())
            .filter(Boolean),
        );
      } else {
        toast.error('Unsupported file type');
        return;
      }

      if (distinctSeedGenes.length < 2) {
        toast.error('Please provide at least 2 valid genes', {
          description: 'Seed genes should be either ENSG IDs or gene names',
        });
        return;
      }

      const { error } = await verifyGenes({ variables: { geneIDs: distinctSeedGenes } });
      if (error) {
        toast.error('Error fetching data', { description: 'Server not available. Please try again later' });
        return;
      }
      setGeneIDs(distinctSeedGenes);
      setTableOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGraph = async () => {
    const store = await openDB('network', 'readwrite');
    if (!store) {
      toast.error('Failed to open database');
      return;
    }
    try {
      await store.delete(NETWORK_STORAGE_KEYS.GENE_NETWORK);
    } catch {}
    const transactionDone = idbTransactionDone(store.transaction);
    await idbRequestToPromise(store.put(file, NETWORK_STORAGE_KEYS.GENE_NETWORK));
    await transactionDone;
    toast.success('File uploaded successfully');
    window.open(`/network?file=${encodeURIComponent(NETWORK_STORAGE_KEYS.GENE_NETWORK)}`, '_blank');
  };

  return (
    <div className='w-full border border-slate-200 bg-white p-6 rounded-xl shadow-sm'>
      <form
        onSubmit={e => {
          e.preventDefault();
          void handleUploadSubmit();
        }}
        className='space-y-6'
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1.5'>
            <Label htmlFor={uploadFileId} className='font-bold text-xl text-slate-800 tracking-tight'>
              Upload Network or Knowledge Graph File
            </Label>
            <p className='text-slate-500 text-[15px] leading-relaxed'>
              
            </p>
          </div>

          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-9 w-9 text-slate-400 shrink-0 hover:bg-slate-50'
                  type='button'
                >
                  <InfoIcon size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='max-w-sm text-xs p-3 space-y-1.5' side='left'>
                <p className='font-semibold text-white'>Automated Verification Pipeline</p>
                <p className='text-white leading-normal'>
                The platform automatically detects the
              file format and opens the appropriate visualization.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className='space-y-1'>
          <Input
            id={uploadFileId}
            type='file'
            accept='.csv,.json,.graphml,.gexf,.zip'
            onChange={handleFileChange}
            required
            className='h-10 cursor-pointer border-dashed border-2 hover:border-teal-500 transition-colors text-sm file:text-xs file:font-semibold'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-slate-50 border p-4'>
          {Object.entries(SUPPORTED_FORMATS).map(([key, item]) => (
            <div
              key={key}
              className='flex flex-col justify-between space-y-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs'
            >
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-bold text-slate-800 text-sm'>{item.title}</h4>
                </div>
                <p className='text-slate-600 text-xs leading-normal'>{item.desc}</p>
              </div>

              <div className='space-y-2 pt-2 border-t border-slate-100'>
                <div className='flex flex-col items-center'>
                  <span className='text-[11px] text-slate-400 font-medium tracking-wide uppercase'>Example Templates</span>
                  <div className='flex items-center gap-2 flex-wrap'>
                    {item.links.map((link, index) => (
                      <React.Fragment key={link.label}>
                        <a
                          href={link.href}
                          download
                          className='text-xs font-medium text-teal-600 underline underline-offset-2 hover:text-teal-700'
                        >
                          #{link.label.toLowerCase()}
                        </a>

                        {index < item.links.length - 1 && <span className='text-slate-300'>•</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className='space-y-1'>
                  <span className='text-[10px] text-slate-400 font-medium block'>Expected Schema Format:</span>
                  <pre className='overflow-x-auto rounded-md bg-slate-900 p-2.5 font-mono text-[11px] text-slate-200 leading-tight border border-slate-800 shadow-inner'>
                    {item.preview}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button type='submit' className='relative w-full overflow-hidden font-semibold hover:opacity-90'>
          <AnimatedNetworkBackground
            className='pointer-events-none absolute inset-0 h-full w-full opacity-40'
            moving={loading}
            speedMultiplier={10}
          />
          <span className='relative z-10 flex items-center justify-center'>
            {loading ? (
              <>
                <LoaderIcon className='mr-2 animate-spin' size={20} />
                <span className='hidden sm:inline'>Submitting...</span>
              </>
            ) : (
              'Submit'
            )}
          </span>
        </Button>
      </form>

      <PopUpTable
        geneIDs={geneIDs}
        tableOpen={tableOpen}
        setTableOpen={setTableOpen}
        data={data}
        handleGenerateGraph={handleGenerateGraph}
      />
    </div>
  );
}
