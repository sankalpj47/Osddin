'use client';

import type { CheckedState } from '@radix-ui/react-checkbox';
import { Trash2Icon, UploadIcon } from 'lucide-react';
import Papa from 'papaparse';
import React, { useId } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useKGStore, useStore } from '@/lib/hooks';
import { formatBytes, openDB } from '@/lib/utils';

/**
 * KGFileSheet - Upload property files for knowledge graph nodes
 * Fully dynamic flex layout boundaries to prevent panel drag clipping
 */
export function KGFileSheet() {
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [checkedOptions, setCheckedOptions] = React.useState<Record<string, boolean>>({});
  const sigmaInstance = useKGStore(state => state.sigmaInstance);

  React.useEffect(() => {
    openDB('files', 'readonly').then(store => {
      if (!store) {
        toast.error('Failed to open IndexedDB database', {
          cancel: { label: 'Close', onClick() {} },
          description: 'Please make sure you have enabled IndexedDB in your browser',
        });
        return;
      }
      const request = store.getAll();
      request.onsuccess = () => {
        setUploadedFiles(request.result);
        const checkedOptions: Record<string, boolean> = {};
        for (const file of request.result) {
          checkedOptions[file.name] = false;
        }
        setCheckedOptions(checkedOptions);
      };
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles, fileRejections) => {
      const store = await openDB('files', 'readwrite');
      if (!store) {
        toast.error('Failed to open IndexedDB database', {
          cancel: { label: 'Close', onClick() {} },
          description: 'Please make sure you have enabled IndexedDB in your browser',
        });
        return;
      }
      const filesToAdd: File[] = [];
      const newCheckedOptions: Record<string, boolean> = {};

      for (const file of acceptedFiles) {
        const request = store.put(file, file.name);
        request.onerror = ev => console.error(ev);
        request.onsuccess = () => {
          filesToAdd.push(file);
          newCheckedOptions[file.name] = true;

          if (filesToAdd.length === acceptedFiles.length) {
            setUploadedFiles(prev => {
              const seen = new Set();
              return [...filesToAdd, ...prev].filter(file => {
                if (seen.has(file.name)) return false;
                seen.add(file.name);
                return true;
              });
            });
            setCheckedOptions(prev => ({ ...prev, ...newCheckedOptions }));
          }
        };
      }
      if (fileRejections.length > 0) {
        const rejectedFiles = fileRejections.map(r => r.file.name).join(', ');
        toast.error(`Files rejected: ${rejectedFiles}`, {
          cancel: { label: 'Close', onClick() {} },
          description: 'Please make sure files are in CSV format',
        });
      }
    },
    accept: { 'text/csv': ['.csv'] },
  });

  const handleCheckboxChange = (fileName: string) => {
    setCheckedOptions({
      ...checkedOptions,
      [fileName]: !checkedOptions[fileName],
    });
  };

  const removeFile = async (name?: string) => {
    setUploadedFiles(name ? uploadedFiles.filter(file => file.name !== name) : []);
    setShowConfirmDialog(false);
    const store = await openDB('files', 'readwrite');
    if (!store) {
      toast.error('Failed to open IndexedDB database', {
        cancel: { label: 'Close', onClick() {} },
        description: 'Please make sure you have enabled IndexedDB in your browser',
      });
      return;
    }
    if (name) store.delete(name).onerror = ev => console.error(ev);
    else {
      store.clear().onerror = ev => console.error(ev);
    }
  };

  const handleConfirmDialogChange = (checked: CheckedState) => {
    sessionStorage.setItem('showKGConfirmDialog', JSON.stringify(!checked));
  };

  const handlePropertyUpdate = async () => {
    if (!sigmaInstance) {
      toast.error('Graph not loaded', {
        cancel: { label: 'Close', onClick() {} },
        description: 'Please load a knowledge graph first',
      });
      return;
    }

    const graph = sigmaInstance.getGraph();
    const radioOptions = useStore.getState().radioOptions;
    let updatedProperties = 0;

    for (const file of uploadedFiles) {
      if (!checkedOptions[file.name]) continue;

      const store = await openDB('files', 'readonly');
      if (!store) {
        toast.error('Failed to open IndexedDB database', {
          cancel: { label: 'Close', onClick() {} },
        });
        return;
      }

      const request = store.get(file.name);
      request.onsuccess = async () => {
        const data = await (request.result as File).text();
        const parsedData = Papa.parse<Record<string, string>>(data, {
          header: true,
          skipEmptyLines: true,
        });

        const IDHeaderName = parsedData.meta.fields?.[0];
        if (!IDHeaderName) {
          toast.error(`Invalid file: ${file.name}`, {
            cancel: { label: 'Close', onClick() {} },
            description: 'First column must be node ID',
          });
          return;
        }

        const uploadedNodeIds = parsedData.data.map(row => row[IDHeaderName]).filter(id => graph.hasNode(id));
        if (uploadedNodeIds.length === 0) {
          toast.error(`No matching nodes found in file: ${file.name}`, {
            cancel: { label: 'Close', onClick() {} },
            description: 'Node IDs in file do not match graph nodes',
          });
          return;
        }

        const firstNodeId = uploadedNodeIds[0];
        const targetNodeType = graph.getNodeAttribute(firstNodeId, 'nodeType') || 'Unknown';
        const isGeneNode = targetNodeType === 'Gene';

        const universalData = useStore.getState().universalData;
        const nodePropertyData = useKGStore.getState().nodePropertyData;
        const kgPropertyOptions = useKGStore.getState().kgPropertyOptions;

        try {
          for (const propertyName of parsedData.meta.fields ?? []) {
            if (propertyName === IDHeaderName) continue;

            if (isGeneNode) {
              for (const row of parsedData.data) {
                const nodeId = row[IDHeaderName];
                if (!graph.hasNode(nodeId)) continue;

                if (!universalData[nodeId]) {
                  universalData[nodeId] = {
                    common: {
                      Custom_Color: {},
                      OT_Prioritization: {},
                      Druggability: {},
                      Pathway: {},
                      TE: {},
                    },
                    user: {
                      DEG: {},
                      OpenTargets: {},
                      Custom_Color: {},
                      Druggability: {},
                      Pathway: {},
                      TE: {},
                      OT_Prioritization: {},
                    },
                  };
                }
                if (!universalData[nodeId].user.Custom_Color) {
                  universalData[nodeId].user.Custom_Color = {};
                }

                const value = row[propertyName];
                const numValue = Number.parseFloat(value);
                (universalData[nodeId].user.Custom_Color as Record<string, number | string>)[propertyName] =
                  Number.isNaN(numValue) ? value : numValue;
              }

              if (!radioOptions.user.Custom_Color.includes(propertyName)) {
                radioOptions.user.Custom_Color.push(propertyName);
              }
            } else {
              let finalPropertyName = propertyName;
              if (kgPropertyOptions[propertyName]) {
                finalPropertyName = `${propertyName}_file`;
                let counter = 1;
                while (kgPropertyOptions[finalPropertyName]) {
                  finalPropertyName = `${propertyName}_file${counter}`;
                  counter++;
                }
                toast.info(`Property "${propertyName}" renamed to "${finalPropertyName}"`, {
                  cancel: { label: 'Close', onClick() {} },
                  description: 'To avoid conflict with existing property',
                });
              }

              kgPropertyOptions[finalPropertyName] = {
                targetNodeType,
                source: 'file',
              };

              for (const row of parsedData.data) {
                const nodeId = row[IDHeaderName];
                if (!graph.hasNode(nodeId)) continue;

                if (!nodePropertyData[nodeId]) {
                  nodePropertyData[nodeId] = {};
                }

                const value = row[propertyName];
                const numValue = Number.parseFloat(value);
                nodePropertyData[nodeId][finalPropertyName] = Number.isNaN(numValue) ? value : numValue;
              }
            }

            updatedProperties++;
          }

          useStore.setState({ universalData, radioOptions });
          useKGStore.setState({ nodePropertyData, kgPropertyOptions });
        } catch (error) {
          console.error(error);
          toast.error('Error processing property data', {
            cancel: { label: 'Close', onClick() {} },
          });
          return;
        }
      };
    }

    if (updatedProperties > 0) {
      toast.success(`${updatedProperties} properties loaded successfully`, {
        cancel: { label: 'Close', onClick() {} },
        description: 'You can now use these properties for node coloring/sizing',
      });
    }
  };

  const handleReset = async () => {
    setCheckedOptions(value => {
      const updatedCheckedOptions = { ...value };
      for (const key in updatedCheckedOptions) {
        updatedCheckedOptions[key] = false;
      }
      return updatedCheckedOptions;
    });

    const kgPropertyOptions = useKGStore.getState().kgPropertyOptions;
    const nodePropertyData = useKGStore.getState().nodePropertyData;
    const universalData = useStore.getState().universalData;
    const radioOptions = useStore.getState().radioOptions;

    const kgFileProperties = Object.keys(kgPropertyOptions).filter(prop => kgPropertyOptions[prop].source === 'file');
    for (const prop of kgFileProperties) {
      delete kgPropertyOptions[prop];
    }

    for (const nodeId in nodePropertyData) {
      for (const prop of kgFileProperties) {
        delete nodePropertyData[nodeId][prop];
      }
    }

    radioOptions.user.Custom_Color = [];
    for (const nodeId in universalData) {
      if (universalData[nodeId].user?.Custom_Color) {
        universalData[nodeId].user.Custom_Color = {};
      }
    }

    useKGStore.setState({ nodePropertyData, kgPropertyOptions });
    useStore.setState({ universalData, radioOptions });

    toast.info('File properties reset successfully', {
      cancel: { label: 'Close', onClick() {} },
    });
  };

  const doNotShowAgainId = useId();

  return (
    <div className="w-full min-w-0">
      <div className="flex w-full items-center gap-2 min-w-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="sm" 
              className="flex-1 min-w-0 gap-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors h-9 shadow-none"
            >
              <UploadIcon className="size-3.5 shrink-0" />
              <span className="truncate">Upload Files</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh]">
            <SheetHeader>
              <SheetTitle>Node Property Files</SheetTitle>
              <SheetDescription>
                Upload CSV files with node properties. First column must be node ID matching your graph nodes.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <div
                className="mb-4 cursor-pointer rounded-lg border-2 border-gray-300 border-dashed p-4 text-center hover:bg-gray-50 transition-colors"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-xs text-gray-600">Drop the files here ...</p>
                ) : (
                  <p className="text-xs text-gray-500">Drag and drop CSV files here, or click to select files</p>
                )}
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="flex flex-row-reverse">
                  <Button size="sm" className="mb-2 text-xs" variant="destructive" onClick={() => setShowConfirmDialog(true)}>
                    Delete All
                  </Button>
                </div>
              )}
              
              <AlertDialog open={showConfirmDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 text-sm">
                      This action cannot be undone. This will permanently delete all uploaded property files.
                    </AlertDialogDescription>
                    <div className="mt-4 flex items-center space-x-2">
                      <Checkbox id={doNotShowAgainId} onCheckedChange={handleConfirmDialogChange} />
                      <Label
                        htmlFor={doNotShowAgainId}
                        className="font-medium text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                      >
                        Do not show again
                      </Label>
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowConfirmDialog(false)} className="text-xs">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeFile()} className="text-xs">Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <ScrollArea className="h-[200px] border border-gray-100 rounded-lg p-1">
                {uploadedFiles.map(file => (
                  <div
                    key={file.name}
                    className="mb-2 flex items-center justify-between rounded-lg bg-gray-50 p-2 border border-gray-100"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2 font-medium text-xs text-gray-800">
                        <Checkbox
                          id={file.name}
                          checked={checkedOptions[file.name] || false}
                          onCheckedChange={() => handleCheckboxChange(file.name)}
                          className="shrink-0"
                        />
                        <span className="truncate" title={file.name}>{file.name}</span>
                      </div>
                      <div className="block mt-0.5 ml-6 text-gray-400 text-[10px] truncate">
                        Date: {new Date(file.lastModified).toLocaleString()} | Size: {formatBytes(file.size)}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600 shrink-0" onClick={() => removeFile(file.name)}>
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <SheetFooter>
              <SheetTrigger asChild>
                <Button onClick={handlePropertyUpdate} className="w-full bg-teal-600 hover:bg-teal-700 text-xs">
                  Apply Properties
                </Button>
              </SheetTrigger>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex-1 min-w-0 text-xs border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors h-9 shadow-none shrink-0" 
          onClick={handleReset}
        >
          <span className="truncate">Reset Files</span>
        </Button>
      </div>

      <div className="mt-2 text-gray-400 text-[10px] italic leading-normal">
        <span className="font-bold uppercase tracking-wide text-gray-500 not-italic mr-1">Note:</span> 
        Uploaded files are stored locally in your browser session and are never shared.
      </div>
    </div>
  );
}