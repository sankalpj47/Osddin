'use client';

import { useLazyQuery } from '@apollo/client/react';
import { LoaderIcon } from 'lucide-react';
import Image from 'next/image';
import React, { useId } from 'react';
import { toast } from 'sonner';
import AnimatedNetworkBackground from '@/components/AnimatedNetworkBackground';
import PopUpTable from '@/components/PopUpTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GENE_VERIFICATION_QUERY } from '@/lib/gql';
import type { GeneVerificationData, GeneVerificationVariables } from '@/lib/interface';
import { NETWORK_STORAGE_KEYS } from '@/lib/interface/knowledge-graph';
import { distinct, openDB } from '@/lib/utils';

export function UploadTab() {
  const [verifyGenes, { data }] = useLazyQuery<GeneVerificationData, GeneVerificationVariables>(
    GENE_VERIFICATION_QUERY,
  );
  const [file, setFile] = React.useState<File | null>(null);
  const [tableOpen, setTableOpen] = React.useState(false);
  const [geneIDs, setGeneIDs] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'json'].includes(ext)) {
      toast.error('Invalid file type', {
        cancel: { label: 'Close', onClick() {} },
        description: 'Please upload a CSV or JSON file',
      });
      e.currentTarget.value = '';
      return;
    }
    setFile(f);
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      toast.error('Please upload a file', {
        cancel: { label: 'Close', onClick() {} },
      });
      return;
    }
    setLoading(true);
    try {
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
        toast.error('Unsupported file type', {
          cancel: { label: 'Close', onClick() {} },
          description: 'Only CSV and JSON files are supported',
        });
        return;
      }
      if (distinctSeedGenes.length < 2) {
        toast.error('Please provide at least 2 valid genes', {
          cancel: { label: 'Close', onClick() {} },
          description: 'Seed genes should be either ENSG IDs or gene names',
        });
        return;
      }
      const { error } = await verifyGenes({
        variables: { geneIDs: distinctSeedGenes },
      });
      if (error) {
        console.error(error);
        toast.error('Error fetching data', {
          cancel: { label: 'Close', onClick() {} },
          description: 'Server not available,Please try again later',
        });
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
      toast.error('Failed to open IndexedDB database', {
        cancel: { label: 'Close', onClick() {} },
        description: 'Please make sure you have enabled IndexedDB in your browser',
      });
      return;
    }

    
    try {
      await store.delete(NETWORK_STORAGE_KEYS.GENE_NETWORK);
    } catch (error) {
      console.warn('No existing gene network file to delete:', error);
    }


    store.put(file, NETWORK_STORAGE_KEYS.GENE_NETWORK);
    toast.success('File uploaded successfully', {
      cancel: { label: 'Close', onClick() {} },
    });
    window.open(
      `/network?file=${encodeURIComponent(NETWORK_STORAGE_KEYS.GENE_NETWORK)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const uploadFileId = useId();

  return (
  <div className='mx-auto rounded-lg border border-teal-100 bg-white p-6 shadow-sm'>
    <form
      onSubmit={e => {
        e.preventDefault();
        void handleUploadSubmit();
      }}
      className='space-y-3'
    >
      {/* Header */}
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <Label
            htmlFor={uploadFileId}
            className='text-[16px] font-semibold text-slate-800'
          >
            Upload CSV or JSON
          </Label>

          <p className='text-xs text-zinc-500'>
            (CSV examples:{' '}
            <a
              href='/example1.csv'
              download
              className='underline hover:text-zinc-700'
            >
              #1
            </a>{' '}
            <a
              href='/example2.csv'
              download
              className='underline hover:text-zinc-700'
            >
              #2
            </a>
            )
          </p>
        </div>

        <Input
          id={uploadFileId}
          type='file'
          accept='.csv,.json'
          onChange={handleFileChange}
          required
          className='h-10 cursor-pointer border-2 border-dashed border-slate-400 text-xs'
        />

        <div className='mt-2 space-y-1 text-xs text-zinc-500'>
          <p>
            • CSV: first two columns are ENSG IDs or Gene names; third column
            is interaction score.
          </p>

          <p>
            • JSON: array of records; non-numeric string values are treated as
            gene identifiers.
          </p>
        </div>
      </div>

      {/* Preview Card */}
      <div className='rounded-lg border border-teal-100 bg-[#f6fcfb] px-4 py-4'>
        <h3 className='text-center text-[12px] font-semibold uppercase tracking-wide text-teal-700'>
          File Format Preview
        </h3>


<div className='mt-4 flex justify-center'>
  <Image
    src='/image/uploadFormat.svg'
    width={800}
    height={550}
    alt='CSV file format example'
    className='h-auto w-[750px] max-w-full'
  />
</div>

      </div>

      {/* Submit Button */}
      <Button
        type='submit'
        className='relative h-9 w-full overflow-hidden bg-teal-600 text-sm font-medium text-white hover:bg-teal-700'
      >
        <AnimatedNetworkBackground
          className='pointer-events-none absolute inset-0 h-full w-full opacity-35'
          moving={loading}
          speedMultiplier={2.2}
        />

        <span className='relative z-10 flex items-center justify-center'>
          {loading && (
            <LoaderIcon
              className='mr-2 animate-spin'
              size={16}
            />
          )}
          Submit
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
