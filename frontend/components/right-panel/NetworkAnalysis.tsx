'use client';

import { Label } from '@radix-ui/react-label';
import { Settings2Icon, TablePropertiesIcon } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { algorithms, columnLeidenResults } from '@/lib/data';
import { downloadFile, type EventMessage, Events, eventEmitter } from '@/lib/utils';
import SliderWithInput from '../SliderWithInput';
import { LeidenPieChart } from '../statistics';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DataTable } from '../ui/data-table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function NetworkAnalysis({ children }: { children: React.ReactNode }) {
  const [algorithmResults, setAlgorithmResults] = useState<EventMessage[Events.ALGORITHM_RESULTS] | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [selectedAlgo, setSelectedAlgo] = useState<string>('None');

  const getDefaultParameters = (name: string) => {
    const algorithm = algorithms.find(algorithm => algorithm.name === name);
    if (!algorithm) return undefined;

    return Object.fromEntries(
      algorithm.parameters.map(parameter => [parameter.name, String(parameter.defaultValue)]),
    ) as EventMessage[Events.ALGORITHM]['parameters'];
  };

  const handleAlgoQuery = (name: string, formData?: FormData) => {
    if (formData) {
      eventEmitter.emit(Events.ALGORITHM, {
        name,
        parameters: Object.fromEntries(formData.entries()) as EventMessage[Events.ALGORITHM]['parameters'],
      } satisfies EventMessage[Events.ALGORITHM]);
    } else {
      eventEmitter.emit(Events.ALGORITHM, { name } satisfies EventMessage[Events.ALGORITHM]);
      setAlgorithmResults(null);
    }
  };

  useEffect(() => {
    const handleResults = (data: EventMessage[Events.ALGORITHM_RESULTS]) => {
      setAlgorithmResults(data);
    };
    eventEmitter.on(Events.ALGORITHM_RESULTS, handleResults);
    console.log(Events.ALGORITHM_RESULTS);
    return () => {
      eventEmitter.off(Events.ALGORITHM_RESULTS, handleResults);
    };
  }, []);

  const handleExport = (communities: EventMessage[Events.ALGORITHM_RESULTS]['communities']) => {
    if (!communities) return;
    const csv = Papa.unparse(
      communities.map(c => ({
        ...c,
        nodes: c.nodes.join(';'),
        numberOfNodes: c.nodes.length,
      })),
    );
    downloadFile(csv, 'leiden_communities.csv');
  };

  return (
    <div className='w-full flex flex-col min-w-0'>
      {/* Primary Sub-Navigation Tab Splitter */}
      <Tabs defaultValue='type' className='w-full flex flex-col'>
        <TabsList className='grid w-full grid-cols-2 rounded-lg bg-gray-100 p-1 mb-3 h-8.5'>
          <TabsTrigger
            value='type'
            className='rounded-md py-1 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-2xs'
          >
            Type
          </TabsTrigger>
          <TabsTrigger
            value='settings'
            className='rounded-md py-1 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-2xs'
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value='type' className='focus-visible:outline-none mt-0 flex flex-col gap-2.5'>
          <span className='text-[11px] font-semibold tracking-wide text-gray-400 uppercase'>Clustering Strategy</span>

          <RadioGroup
            value={selectedAlgo}
            onValueChange={val => {
              setSelectedAlgo(val);
              if (val === 'None') {
                handleAlgoQuery('None');
              } else if (val === 'Leiden') {
                eventEmitter.emit(Events.ALGORITHM, {
                  name: val,
                  parameters: getDefaultParameters(val),
                } satisfies EventMessage[Events.ALGORITHM]);
              }
            }}
            className='flex flex-col gap-2 rounded-lg border border-gray-50 bg-white p-2.5 shadow-3xs'
          >
            {algorithms.slice(0, 2).map(({ name, parameters }) => (
              <Popover key={name}>
                <div className='flex items-center justify-between w-full rounded-md px-1 py-0.5 hover:bg-gray-50 transition-colors'>
                  <div className='flex items-center space-x-2.5 grow'>
                    <RadioGroupItem
                      value={name}
                      id={`algo-${name}`}
                      className='border-gray-300 text-primary focus:ring-primary size-3.5'
                    />
                    <Label
                      htmlFor={`algo-${name}`}
                      className='text-xs font-bold text-gray-700 cursor-pointer select-none'
                    >
                      {name}
                    </Label>
                  </div>

                  {parameters.length > 0 && selectedAlgo === name && (
                    <PopoverTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='h-6 gap-1 px-2 text-[11px] font-medium text-primary hover:bg-primary/10 hover:text-primary rounded-md shrink-0'
                      >
                        <Settings2Icon className='size-3' />
                        Configure
                      </Button>
                    </PopoverTrigger>
                  )}
                </div>

                {parameters.length > 0 && (
                  <PopoverContent
                    side='left'
                    align='start'
                    sideOffset={10}
                    className='w-64 p-4 rounded-xl border border-gray-200 bg-white shadow-xl z-30'
                  >
                    <form className='flex flex-col space-y-3.5' action={f => handleAlgoQuery(name, f)}>
                      <div className='border-b border-gray-100 pb-1.5'>
                        <h4 className='text-xs font-bold text-gray-800'>{name} Parameters</h4>
                      </div>

                      {parameters.map(param => {
                        if (param.type === 'slider') {
                          return (
                            <div key={param.name} className='space-y-1.5'>
                              <Label htmlFor={param.name} className='text-xs font-semibold text-gray-600'>
                                {param.displayName}
                              </Label>
                              <SliderWithInput
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                id={param.name}
                                defaultValue={param.defaultValue as number}
                              />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={param.name}
                            className='flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-2 border border-gray-100'
                          >
                            <Label htmlFor={param.name} className='text-xs font-semibold text-gray-600 cursor-pointer'>
                              {param.displayName}
                            </Label>
                            <Checkbox
                              name={param.name}
                              id={param.name}
                              defaultChecked={param.defaultValue as boolean}
                              className='border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                            />
                          </div>
                        );
                      })}

                      <Button
                        type='submit'
                        size='sm'
                        className='w-full h-8 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-primary/90'
                      >
                        Apply Parameters
                      </Button>
                    </form>
                  </PopoverContent>
                )}
              </Popover>
            ))}
          </RadioGroup>
        </TabsContent>

        <TabsContent value='settings' className='focus-visible:outline-none mt-0 flex flex-col min-w-0'>
          {children && <div className='flex flex-col min-w-0'>{children}</div>}
        </TabsContent>
      </Tabs>
      {algorithmResults?.communities && (
        <div className='mt-3 flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200'>
          <span className='text-[11px] font-semibold tracking-wide text-gray-400 uppercase'>Clustering Metrics</span>

          <div className='grid grid-cols-2 gap-2 text-center'>
            <div className='rounded-lg bg-gray-50/70 border border-gray-100 p-2'>
              <p className='text-[10px] text-gray-400 font-medium'>Modularity</p>
              <p className='text-sm font-bold text-gray-800 mt-0.5'>{Number(algorithmResults.modularity).toFixed(4)}</p>
            </div>
            <div className='rounded-lg bg-gray-50/70 border border-gray-100 p-2'>
              <p className='text-[10px] text-gray-400 font-medium'>Resolution</p>
              <p className='text-sm font-bold text-gray-800 mt-0.5'>{Number(algorithmResults.resolution).toFixed(2)}</p>
            </div>
          </div>

          <Button
            size='sm'
            variant='outline'
            onClick={() => setShowTable(true)}
            className='mt-1 h-8 w-full gap-2 text-xs font-semibold text-gray-700 bg-white border-gray-200 hover:bg-gray-50 rounded-lg shadow-3xs'
          >
            <TablePropertiesIcon className='size-3.5 text-gray-500' />
            Inspect Communities ({algorithmResults.communities?.length})
          </Button>

          <Dialog open={showTable} onOpenChange={setShowTable}>
            <DialogContent className='flex max-h-[90vh] min-h-[60vh] max-w-6xl flex-col gap-4 p-6 rounded-2xl border border-gray-200 bg-white shadow-2xl'>
              <div>
                <DialogTitle className='text-lg font-bold text-gray-900'>Leiden Partition Details</DialogTitle>
                <DialogDescription className='text-xs text-gray-500 mt-1'>
                  Comprehensive network modularity breakdown across computed topological clusters.
                </DialogDescription>
              </div>

              <Tabs defaultValue='table' className='w-full flex-1 flex flex-col min-h-0'>
                <TabsList className='grid w-64 grid-cols-2 rounded-xl bg-gray-100 p-1 self-center mb-4'>
                  <TabsTrigger
                    className='rounded-lg py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs'
                    value='table'
                  >
                    Table View
                  </TabsTrigger>
                  <TabsTrigger
                    className='rounded-lg py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs'
                    value='chart'
                  >
                    Chart View
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value='table'
                  className='flex-1 min-h-0 focus-visible:outline-none data-[state=inactive]:hidden flex flex-col'
                >
                  <div className='rounded-xl border border-gray-100 overflow-hidden flex-1 max-h-[50vh]'>
                    <DataTable
                      data={algorithmResults.communities.map(c => ({
                        ...c,
                        averageDegree: c.averageDegree.toString(),
                        percentage: c.percentage.toString(),
                        nodes: c.nodes.join(', '),
                        numberOfNodes: c.nodes.length.toString(),
                      }))}
                      columns={columnLeidenResults}
                      filterColumnName='nodes'
                      placeholder='Filter by gene marker identifier...'
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value='chart'
                  className='flex-1 focus-visible:outline-none data-[state=inactive]:hidden grid grid-cols-3 gap-6 items-center min-h-0'
                >
                  <div className='col-span-1 space-y-2.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4'>
                    <h5 className='text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5'>
                      Partition Metadata
                    </h5>
                    <div className='flex justify-between border-b border-gray-100 pb-1.5 text-xs'>
                      <span className='text-gray-500'>Resolution parameter</span>
                      <span className='font-semibold text-gray-800'>{algorithmResults.resolution}</span>
                    </div>
                    <div className='flex justify-between border-b border-gray-100 pb-1.5 text-xs'>
                      <span className='text-gray-500'>Global Modularity score</span>
                      <span className='font-semibold text-gray-800'>{algorithmResults.modularity}</span>
                    </div>
                    <p className='text-[10px] leading-normal text-gray-400 italic mt-4'>
                      * Hover over specific pie slices to map targeted community density characteristics.
                    </p>
                  </div>
                  <div className='col-span-2 flex justify-center items-center h-full max-h-[50vh]'>
                    <LeidenPieChart data={algorithmResults.communities} />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className='border-t border-gray-100 pt-3 gap-2 flex items-center justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleExport(algorithmResults.communities)}
                  className='h-9 font-semibold gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg'
                >
                  Export Dataset (.CSV)
                </Button>
                <DialogClose asChild>
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => setShowTable(false)}
                    className='h-9 font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700'
                  >
                    Close Sheet
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
