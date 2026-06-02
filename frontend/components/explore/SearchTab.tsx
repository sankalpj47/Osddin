'use client';

import { useLazyQuery } from '@apollo/client/react';
import { AlertTriangleIcon, CheckCircleIcon, HistoryIcon, InfoIcon, LoaderIcon, Settings2Icon, UploadIcon, XIcon } from 'lucide-react';
import React, { type ChangeEvent, useId } from 'react';
import { toast } from 'sonner';
import AnimatedNetworkBackground from '@/components/AnimatedNetworkBackground';
import { DiseaseMapCombobox } from '@/components/DiseaseMapCombobox';
import History, { type HistoryItem } from '@/components/History';
import PopUpTable from '@/components/PopUpTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { graphConfig } from '@/lib/data';
import { GENE_VERIFICATION_QUERY, TOP_GENES_QUERY } from '@/lib/gql';
import type {
  GeneVerificationData,
  GeneVerificationVariables,
  GetDiseaseData,
  GraphConfigForm,
  TopGeneData,
  TopGeneVariables,
} from '@/lib/interface';
import { distinct, envURL } from '@/lib/utils';

const DEFAULT_AUTOFILL_GENE_LIMIT = 25;

export function SearchTab() {
  const [verifyGenes, { data, loading }] = useLazyQuery<GeneVerificationData, GeneVerificationVariables>(
    GENE_VERIFICATION_QUERY,
  );
  const [fetchTopGenes, { loading: topGenesLoading }] = useLazyQuery<TopGeneData, TopGeneVariables>(TOP_GENES_QUERY);
  const [diseaseData, setDiseaseData] = React.useState<GetDiseaseData | undefined>(undefined);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${envURL(process.env.NEXT_PUBLIC_BACKEND_URL)}/diseases`);
        if (!response.ok) {
          console.error('Failed to fetch disease data:', response.statusText);
          setDiseaseData([]);
          return;
        }
        const d = await response.json();
        setDiseaseData(d);
      } catch (error) {
        console.error('Error fetching disease data:', error);
        setDiseaseData([]);
      }
    })();
  }, []);

  const [formData, setFormData] = React.useState<GraphConfigForm>({
    seedGenes: 'SOD1, TARDBP, FUS, TBK1, SQSTM1, UBQLN2, ANG, SETX, DCTN1, OPTN, VCP, CHMP2B, ALS2, SPG11, FIG4, ANXA11, TUBA4A, PFN1, VAPB, MATR3, SIGMAR1, KIF5A, ERBB4, C9orf72, HNRNPA1',
    diseaseMap: 'MONDO_0004976',
    order: '0',
    interactionType: ['PPI'],
    minScore: '0.9',
  });
  const [seedInputMode, setSeedInputMode] = React.useState<'type' | 'upload'>('type');
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [tableOpen, setTableOpen] = React.useState(false);
  const [geneIDs, setGeneIDs] = React.useState<string[]>([]);
  const [showAlert, setShowAlert] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [autofillEnabled, setAutofillEnabled] = React.useState(true);
  const [autofillGeneLimit, setAutofillGeneLimit] = React.useState(DEFAULT_AUTOFILL_GENE_LIMIT);
  const [autofillGeneLimitInput, setAutofillGeneLimitInput] = React.useState<string>(
    String(DEFAULT_AUTOFILL_GENE_LIMIT),
  );
  const [pendingAutofillDiseaseId, setPendingAutofillDiseaseId] = React.useState<string | null>('MONDO_0004976');
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const autofillRequestIdRef = React.useRef(0);
  const autofillEnabledRef = React.useRef(true);

  React.useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem('history') ?? '[]'));

  }, []);

  const applyAutofill = React.useCallback(
    async (diseaseId: string) => {
      const requestId = ++autofillRequestIdRef.current;
      try {
        const result = await fetchTopGenes({
          variables: {
            diseaseId,
            limit: autofillGeneLimit,
          },
        });

        if (requestId !== autofillRequestIdRef.current || !autofillEnabledRef.current) {
          return;
        }


        const topGeneData = result?.data;

        if (!topGeneData?.topGenesByDisease) {
          console.warn('No topGenesByDisease in response:', { topGeneData, result });
          toast.error('No seed genes found for the selected disease', {
            cancel: { label: 'Close', onClick() { } },
          });
          return;
        }

        const genes = topGeneData.topGenesByDisease
          .map(item => item.gene_name)
          .filter((name): name is string => Boolean(name && name.length > 0));

        setFormData(prev => {
          if (prev.diseaseMap !== diseaseId) {
            return prev;
          }

          return {
            ...prev,
            seedGenes: genes.join(', '),
          };
        });
        setUploadedFile(null);

        if (genes.length === 0) {
          console.warn('No valid genes extracted from response:', { topGeneData });
          toast.error('No seed genes found for the selected disease', {
            cancel: { label: 'Close', onClick() { } },
          });
        }
      } catch (error) {
        if (requestId !== autofillRequestIdRef.current || !autofillEnabledRef.current) {
          return;
        }

        console.error('Failed to autofill genes:', error);
        toast.error('Failed to autofill genes from API', {
          cancel: { label: 'Close', onClick() { } },
        });
      }
    },
    [autofillGeneLimit, fetchTopGenes],
  );

  React.useEffect(() => {
    autofillEnabledRef.current = autofillEnabled;

    if (!autofillEnabled) {
      autofillRequestIdRef.current += 1;
      setPendingAutofillDiseaseId(null);
      return;
    }


    setPendingAutofillDiseaseId(formData.diseaseMap);
  }, [autofillEnabled, formData.diseaseMap]);

  React.useEffect(() => {
    if (!autofillEnabled) {
      return;
    }

    setPendingAutofillDiseaseId(formData.diseaseMap);
  }, [autofillEnabled, autofillGeneLimit, formData.diseaseMap]);

  React.useEffect(() => {
    if (!autofillEnabled || !pendingAutofillDiseaseId) {
      return;
    }

    void applyAutofill(pendingAutofillDiseaseId);
    setPendingAutofillDiseaseId(null);
  }, [applyAutofill, autofillEnabled, pendingAutofillDiseaseId]);

  const handleSubmit = async () => {
    const { seedGenes, interactionType } = formData;
    if (interactionType.length === 0) {
      toast.error('Please select at least one interaction type', {
        cancel: { label: 'Close', onClick() { } },
        description: 'Interaction type is required to generate the graph',
      });
      return;
    }
    const ids = distinct(
      seedGenes.split(/[,|\n]/).map(gene =>
        gene
          .trim()
          .replace(/^['"]|['"]$/g, '')
          .toUpperCase(),
      ),
    ).filter(Boolean);
    if (ids.length === 0) {
      toast.error('Please enter valid seed genes', {
        cancel: { label: 'Close', onClick() { } },
        description: 'Seed genes cannot be empty',
      });
      return;
    }
    setGeneIDs(ids);
    const { error } = await verifyGenes({ variables: { geneIDs: ids } });
    if (error) {
      console.error(error);
      toast.error('Error fetching data', {
        cancel: { label: 'Close', onClick() { } },
        description: 'Server not available,Please try again later',
      });
      return;
    }
    setTableOpen(true);
  };

  const handleSelect = (val: string, key: string) => {
    if (key === 'diseaseMap' && autofillEnabled) {
      setPendingAutofillDiseaseId(val);
    }
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleFileRead = async (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, seedGenes: event.target.value });
  };

  const handleGenerateGraph = (skipWarning = false) => {
    if (!skipWarning) {
      const seedCount = data?.genes.length ?? 0;
      const orderNum = +formData.order;
      const maxGenes = orderNum === 0 ? 5000 : 50;
      const warningThreshold = orderNum === 0 ? 1000 : 25;
      if (seedCount > maxGenes) {
        toast.error('Too many seed genes', {
          description: `Maximum ${maxGenes} genes allowed for ${orderNum === 0 ? 'zero' : 'first/second'
            } order networks`,
          cancel: { label: 'Close', onClick() { } },
        });
        return;
      }
      if (seedCount > warningThreshold) {
        setShowAlert(true);
        return;
      }
    }
    const seed = data?.genes.map(gene => gene.ID);
    if (!seed) {
      toast.error('There is no valid gene in the list', {
        cancel: { label: 'Close', onClick() { } },
        description: 'Please enter valid gene names',
      });
      return;
    }
    localStorage.setItem(
      'graphConfig',
      JSON.stringify({
        geneIDs: seed,
        diseaseMap: formData.diseaseMap,
        order: +formData.order,
        interactionType: formData.interactionType,
        minScore: +formData.minScore,
        createdAt: Date.now(),
      }),
    );
    const newHistory = [{ title: `Graph: ${history.length + 1}`, geneIDs: seed, ...formData }, ...history];
    setHistory(newHistory);
    localStorage.setItem('history', JSON.stringify(newHistory));
    setTableOpen(false);
    window.open('/network', '_blank', 'noopener,noreferrer');
  };

  const autoFillToggleId = useId();
  const seedGenesId = useId();
  const seedFileId = useId();

  return (
    <div className='space-y-4 rounded-lg border border-teal-100 bg-white p-4 shadow-xs sm:space-y-5 sm:p-6 sm:py-4'>

      {/* Disease row */}
      <div className='flex items-end justify-between gap-4'>
        <div className='flex-1 space-y-1'>
          <div className='flex items-center gap-1'>
            <Label htmlFor='diseaseMap' className='font-bold text-base text-gray-900'>Disease</Label>
            <Tooltip>
              <TooltipTrigger asChild><InfoIcon size={12} /></TooltipTrigger>
              <TooltipContent>
                Contains the disease name to be mapped taken from OpenTargets Portal. <br />
                <b>Note:</b> To search disease using its ID, type disease ID in parentheses.
              </TooltipContent>
            </Tooltip>
          </div>
          <DiseaseMapCombobox
            data={diseaseData}
            value={formData.diseaseMap}
            onChange={val => typeof val === 'string' && handleSelect(val, 'diseaseMap')}
            className='w-full'
          />
        </div>
        <div className='flex items-center gap-2 pb-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-8 text-gray-500 hover:text-gray-800'
                onClick={() => setAdvancedOpen(true)}
              >
                <Settings2Icon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Advanced Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-8 text-gray-500 hover:text-gray-800'
                onClick={() => setHistoryOpen(true)}
              >
                <HistoryIcon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>History</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Advanced Settings Dialog */}
      <AlertDialog open={advancedOpen}>
        <AlertDialogContent className='max-w-md rounded-2xl p-6'>
          <AlertDialogHeader>
            <div className='flex items-start justify-between'>
              <div>
                <AlertDialogTitle className='font-bold text-gray-900 text-xl'>
                  Advanced Settings
                </AlertDialogTitle>
                <AlertDialogDescription className='mt-1 text-gray-500 text-sm'>
                  Customize network generation parameters
                </AlertDialogDescription>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 shrink-0 text-gray-400 hover:text-gray-600'
                onClick={() => setAdvancedOpen(false)}
              >
                <XIcon size={16} />
              </Button>
            </div>
          </AlertDialogHeader>

          <div className='mt-4 space-y-4'>

            <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4'>
              <div className='flex-1'>
                <p className='font-semibold text-gray-900 text-sm'>Autofill Seed Genes</p>
                <p className='mt-0.5 text-gray-500 text-sm'>
                  Automatically populate genes on page load and disease change
                </p>
              </div>
              <Switch
                id={autoFillToggleId}
                checked={autofillEnabled}
                onCheckedChange={setAutofillEnabled}
                className='ml-4'
              />
            </div>

            {/* No. of genes */}
            {autofillEnabled && (
              <div className='flex items-center gap-3 rounded-lg bg-teal-50 p-4'>
                <Label
                  htmlFor='autofill-gene-limit'
                  className='whitespace-nowrap text-gray-700 text-sm'
                >
                  No. of genes
                </Label>

                <Input
                  id='autofill-gene-limit'
                  type='number'
                  min={1}
                  max={1000}
                  step={1}
                  className='h-9 w-24 rounded-lg border-teal-400 text-center'
                  value={autofillGeneLimitInput}
                  onChange={e => setAutofillGeneLimitInput(e.target.value)}
                  disabled={topGenesLoading}
                />

                <Button
                  type='button'
                  size='sm'
                  disabled={topGenesLoading}
                  onClick={() => {
                    const parsed = Number.parseInt(
                      autofillGeneLimitInput,
                      10,
                    );

                    const clamped = Number.isNaN(parsed)
                      ? DEFAULT_AUTOFILL_GENE_LIMIT
                      : Math.min(1000, Math.max(1, parsed));

                    setAutofillGeneLimit(clamped);

                    if (autofillEnabled) {
                      setPendingAutofillDiseaseId(
                        formData.diseaseMap,
                      );
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            )}

            {/* Interaction Type */}
            {/* <div className='space-y-1'>
        <Label className='font-semibold text-gray-900 text-sm'>Interaction Type</Label>
        <p className='text-gray-500 text-sm'>
          Select the interaction dataset to use for network generation
        </p>
        <Select
          value={formData.interactionType[0]}
          onValueChange={val => setFormData(prev => ({ ...prev, interactionType: [val as 'PPI' | 'INT_ACT' | 'BIO_GRID'] }))}
        >
          <SelectTrigger className='mt-2 border border-teal-600 bg-teal-50 text-gray-800 hover:bg-teal-100'>
            <SelectValue placeholder='Select...' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='PPI'>PPI</SelectItem>
            <SelectItem value='INT_ACT'>INT_ACT</SelectItem>
            <SelectItem value='BIO_GRID'>BIO_GRID</SelectItem>
          </SelectContent>
        </Select>
      </div> */}
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Seed Genes */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-1'>
          <Label className='font-bold text-base text-gray-900'>Seed Genes</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon size={13} className='cursor-pointer text-gray-400 hover:text-gray-600' />
            </TooltipTrigger>
            <TooltipContent className='max-w-xs'>
              Enter the genes you want to build your network around. You can input them one per line or comma-separated.
            </TooltipContent>
          </Tooltip>
        </div>

        <p className='text-gray-500 text-sm'>
          Try examples:{' '}
          <button type='button' className='cursor-pointer text-teal-600 underline underline-offset-2 hover:text-teal-800'
            onClick={() => setFormData({ ...formData, seedGenes: 'MAPT, STX6, EIF2AK3, MOBP, DCTN1, LRRK2' })}>
            #1
          </button>{' '}
          <button type='button' className='cursor-pointer text-teal-600 underline underline-offset-2 hover:text-teal-800'
            onClick={() => setFormData({ ...formData, seedGenes: 'ENSG00000185013\nENSG00000076685\nENSG00000166548\nENSG00000156136\nENSG00000114956\nENSG00000116981' })}>
            #2
          </button>{' '}
          <button type='button' className='cursor-pointer text-teal-600 underline underline-offset-2 hover:text-teal-800'
            onClick={() => setFormData({ ...formData, seedGenes: 'NT5C1B\nNT5C2\nTK2\nDCK\nDGUOK\nNT5C1A' })}>
            #3
          </button>
        </p>

        <div className='flex w-fit overflow-hidden rounded-lg border border-gray-200 bg-teal-600/10 p-1'>
          <button
            type='button'
            onClick={() => setSeedInputMode('type')}
            className={`rounded-md px-4 py-1.5 font-medium text-sm transition-all ${seedInputMode === 'type' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Type Genes
          </button>
          <button
            type='button'
            onClick={() => setSeedInputMode('upload')}
            className={`rounded-md px-4 py-1.5 font-medium text-sm transition-all ${seedInputMode === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Upload File
          </button>
        </div>

        {seedInputMode === 'type' && (
          <Textarea
            id={seedGenesId}
            placeholder='Type seed genes (comma or newline separated)'
            className='h-40 resize-none rounded-lg border-gray-200 text-sm'
            value={formData.seedGenes}
            onChange={handleFileRead}
            disabled={topGenesLoading}
            required
          />
        )}

        {seedInputMode === 'upload' && (
          <div className='relative'>
            <Input
              id={seedFileId}
              type='file'
              accept='.txt'
              className='absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0'
              onChange={async e => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f?.type !== 'text/plain') {
                  toast.error('Invalid file type', { cancel: { label: 'Close', onClick() { } } });
                  return;
                }
                const text = await f.text();
                setFormData({ ...formData, seedGenes: text });
                setUploadedFile(f);
              }}
              disabled={topGenesLoading}
            />
            <div className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all h-40 flex items-center justify-center ${uploadedFile ? 'border-green-300 bg-green-50 hover:bg-green-100' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'}`}>
              {uploadedFile ? (
                <div className='flex flex-col items-center gap-2 sm:flex-row sm:gap-3'>
                  <CheckCircleIcon className='size-7 text-green-600' />
                  <div className='text-center sm:text-left'>
                    <p className='font-medium text-green-800 text-sm'>{uploadedFile.name}</p>
                    <p className='text-green-600 text-xs'>File uploaded successfully</p>
                  </div>
                  <Button type='button' variant='ghost' size='sm'
                    className='z-10 text-green-600 hover:bg-green-200 hover:text-green-800'
                    onClick={e => { e.stopPropagation(); setUploadedFile(null); }}>
                    <XIcon className='size-4' />
                  </Button>
                </div>
              ) : (
                <div>
                  <UploadIcon className='mx-auto mb-2 size-9 text-gray-400' />
                  <p className='mb-1 text-gray-600 text-sm'>Browse... No file selected.</p>
                  <p className='text-gray-400 text-xs'>Click to upload or drag and drop (.txt only)</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {graphConfig.map(config => (
          <div key={config.id} className='space-y-1'>
            <div className='flex items-end gap-1'>
              <Label htmlFor={config.id}>{config.name}</Label>
              <Tooltip>
                <TooltipTrigger asChild><InfoIcon size={12} /></TooltipTrigger>
                <TooltipContent>{config.tooltipContent}</TooltipContent>
              </Tooltip>
            </div>
            <Select required value={formData[config.id]} onValueChange={val => handleSelect(val, config.id)}>
              <SelectTrigger className='bg-accent-foreground hover:bg-accent hover:text-accent-foreground' id={config.id}>
                <SelectValue placeholder='Select...' />
              </SelectTrigger>
              <SelectContent>
                {config.options.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>


      <div className='mt-auto flex justify-center pt-2'>
        <Button
          type='button'
          onClick={handleSubmit}
          className='relative w-full overflow-hidden font-semibold hover:opacity-90'
        >
          <AnimatedNetworkBackground
            className='pointer-events-none absolute inset-0 h-full w-full opacity-40'
            moving={loading}
            speedMultiplier={10}
          />
          <span className='relative z-10 flex items-center justify-center'>
            {loading ? (
              <>
                <LoaderIcon className='mr-2 animate-spin' size={20} />
                <span className='hidden sm:inline'>Checking {geneIDs.length} Genes...</span>
                <span className='sm:hidden'>Checking Genes...</span>
              </>
            ) : 'Submit'}
          </span>
        </Button>
      </div>

      <PopUpTable setTableOpen={setTableOpen} tableOpen={tableOpen} handleGenerateGraph={handleGenerateGraph} data={data} geneIDs={geneIDs} />

      <AlertDialog open={showAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center text-red-500'>
              <AlertTriangleIcon size={24} className='mr-2' /> Warning!
            </AlertDialogTitle>
            <AlertDialogDescription className='text-black'>
              You are about to generate a graph with a large number of nodes/edges. This may take a long time to complete.
            </AlertDialogDescription>
            <p className='font-semibold text-black'>Are you sure you want to proceed?</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowAlert(false); handleGenerateGraph(true); document.body.removeAttribute('style'); }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <History history={history} historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} setHistory={setHistory} setFormData={setFormData} />
    </div>
  );
}
