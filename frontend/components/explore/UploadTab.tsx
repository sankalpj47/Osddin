'use client';

import { useLazyQuery } from '@apollo/client/react';
import { LoaderIcon } from 'lucide-react';
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
import { useRouter } from "next/navigation";
import { detectUploadType } from '@/utils/filedetector';
import { parseKnowledgeGraph } from "@/lib/graph/parse-upload";

export function UploadTab() {
  const [verifyGenes, { data }] = useLazyQuery<GeneVerificationData, GeneVerificationVariables>(
    GENE_VERIFICATION_QUERY,
  );
  const [file, setFile] = React.useState<File | null>(null);
  const [tableOpen, setTableOpen] = React.useState(false);
  const [geneIDs, setGeneIDs] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'json', 'graphml', 'gexf', 'zip'].includes(ext)) {
      toast.error('Invalid file type', {
        cancel: { label: 'Close', onClick() { } },
        description: 'Supported formats: CSV, JSON, GraphML, GEXF, ZIP',
      });
      e.currentTarget.value = '';
      return;
    }
    setFile(f);
  };



  const handleUploadSubmit = async () => {
    if (!file) {
      toast.error('Please upload a file', {
        cancel: { label: 'Close', onClick() { } },
      });
      return;
    }

    setLoading(true);
    try {
      const uploadType = await detectUploadType(file);
      if (uploadType === 'knowledge-graph') {
        try {
          const graphData =
            await parseKnowledgeGraph([file]);

          graphData.attributes = {
            ...graphData.attributes,
            originalFileName: file.name,
            uploadedAt: Date.now(),
            fileSize: file.size,
          };

          const store = await openDB(
            'network',
            'readwrite',
          );

          if (!store) {
            throw new Error(
              'Failed to open storage',
            );
          }

          try {
            await store.delete(
              NETWORK_STORAGE_KEYS.KNOWLEDGE_GRAPH,
            );
          } catch { }

          await store.put(
            graphData,
            NETWORK_STORAGE_KEYS.KNOWLEDGE_GRAPH,
          );

          toast.success(
            'Knowledge graph uploaded successfully',
          );

          router.push('/knowledge-graph');

          return;
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to parse graph',
          );

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
        toast.error('Unsupported file type', {
          cancel: { label: 'Close', onClick() { } },
          description: 'Supported formats: CSV, JSON, GraphML, GEXF, ZIP',
        });
        return;
      }
      if (distinctSeedGenes.length < 2) {
        toast.error('Please provide at least 2 valid genes', {
          cancel: { label: 'Close', onClick() { } },
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
          cancel: { label: 'Close', onClick() { } },
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
        cancel: { label: 'Close', onClick() { } },
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
      cancel: { label: 'Close', onClick() { } },
    });
    router.push(
      `/network?file=${encodeURIComponent(
        NETWORK_STORAGE_KEYS.GENE_NETWORK
      )}`
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
        {/* Header */}
        <div>
          <div className="mb-4">
            <Label
              htmlFor={uploadFileId}
              className="text-lg font-semibold text-slate-800"
            >
              Upload Network or Knowledge Graph
            </Label>

            <p className="mt-2 text-sm text-zinc-600">
              Upload gene interaction networks or biological knowledge graphs.
              The platform automatically detects the file format and opens the
              appropriate visualization.
            </p>
          </div>

          <Input
            id={uploadFileId}
            type="file"
            accept=".csv,.json,.graphml,.gexf,.zip"
            onChange={handleFileChange}
            required
            className="h-11 cursor-pointer border-2 border-dashed border-slate-300 text-sm"
          />

          <div className="mt-2 rounded-lg border border-teal-100 bg-teal-50 p-4">
            <h4 className="font-semibold text-teal-800">
              Supported Formats
            </h4>

            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <div>
                <h5 className="text-sm font-medium text-slate-700">
                  Gene Networks
                </h5>

                <ul className="mt-1 space-y-1 text-xs text-slate-600">
                  <li>• CSV interaction files</li>
                  <li>• JSON network files</li>
                  <li>• Gene ↔ Gene relationships</li>
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-medium text-slate-700">
                  Knowledge Graphs
                </h5>

                <ul className="mt-1 space-y-1 text-xs text-slate-600">
                  <li>• CSV (source_id, target_id)</li>
                  <li>• Graphology JSON</li>
                  <li>• GraphML / GEXF / ZIP</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Example Files */}
        <div className="rounded-lg border border-teal-100 bg-[#f6fcfb] p-5">
          <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-teal-700">
            Download Example Files
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {/* Network Examples */}
            <div className="rounded-lg border bg-white p-4">
              <h4 className="font-semibold text-slate-800">
                Gene Network
              </h4>

              <p className="mt-1 text-xs text-slate-500">
                Upload gene-gene interactions with confidence scores.
              </p>

              <div className="mt-3 flex gap-2">
                <a
                  href="/examples/network.csv"
                  download
                  className="rounded-md bg-teal-100 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-200"
                >
                  Network CSV
                </a>

                <a
                  href="/examples/network.json"
                  download
                  className="rounded-md bg-teal-100 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-200"
                >
                  Network JSON
                </a>
              </div>

              <pre className="mt-4 overflow-x-auto rounded bg-slate-900 p-3 text-[10px] text-slate-100">
                {`gene1,gene2,score
BRCA1,TP53,0.95
TP53,EGFR,0.87
EGFR,MYC,0.78`}
              </pre>
            </div>

            {/* Knowledge Graph Examples */}
            <div className="rounded-lg border bg-white p-4">
              <h4 className="font-semibold text-slate-800">
                Knowledge Graph
              </h4>

              <p className="mt-1 text-xs text-slate-500">
                Upload entities and relationships between biological concepts.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="/examples/kg.csv"
                  download
                  className="rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                >
                  KG CSV
                </a>

                <a
                  href="/examples/kg.json"
                  download
                  className="rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                >
                  KG JSON
                </a>

                <a
                  href="/examples/kg.graphml"
                  download
                  className="rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                >
                  GraphML
                </a>
                 <a
                  href="/examples/kg.gexf"
                  download
                  className="rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                >
                  GEXF
                </a>
                 <a
                  href="/examples/kg.zip"
                  download
                  className="rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                >
                  ZIP
                </a>
              </div>

              <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-[10px] text-slate-100">
                {`source_id,target_id,edge_type
BRCA1,BreastCancer,ASSOCIATES
TP53,BreastCancer,ASSOCIATES
`}
              </pre>
            </div>

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
