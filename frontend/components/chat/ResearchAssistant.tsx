'use client';

import {
  BarChart3Icon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleIcon,
  GlobeIcon,
  Loader2Icon,
  SearchIcon,
  WrenchIcon,
  XCircleIcon,
} from 'lucide-react';
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

// Tool metadata mapping
const TOOL_DETAILS: Record<string, { name: string; icon: React.ComponentType<any> }> = {
  searchNodes: { name: 'Search Nodes', icon: SearchIcon },
  getNeighborhood: { name: 'Expand Neighborhood', icon: GlobeIcon },
  expandContext: { name: 'Expand Context', icon: GlobeIcon },
  computeCentrality: { name: 'Centrality Analysis', icon: BarChart3Icon },
  searchBiomedicalContext: { name: 'Literature Search', icon: BookOpenIcon },
};

function getToolMeta(toolName: string) {
  if (toolName in TOOL_DETAILS) {
    return TOOL_DETAILS[toolName];
  }
  
  const friendlyName = toolName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  return { name: friendlyName, icon: WrenchIcon };
}

function getStatusMeta(state: string) {
  switch (state) {
    case 'result':
      return { label: 'Completed', color: 'text-green-600 dark:text-green-400', icon: CheckCircle2Icon };
    case 'call':
      return { label: 'Running', color: 'text-amber-500', icon: Loader2Icon, animate: true };
    case 'output-error':
      return { label: 'Failed', color: 'text-red-600 dark:text-red-400', icon: XCircleIcon };
    default:
      return { label: state, color: 'text-gray-500', icon: WrenchIcon };
  }
}

// Activity Timeline
interface ActivityTimelineProps { 
  toolParts: any[];
}

export function ActivityTimeline({ toolParts }: ActivityTimelineProps) {
  if (!toolParts || toolParts.length === 0) return null;

  return (
    <div className='my-4 rounded-lg border bg-muted/20 p-4 shadow-sm'>
      <h3 className='mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>Activity Timeline</h3>
      <div className='space-y-3.5'>
        {toolParts.map((part, index) => {
          const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.replace('tool-', '');
          const meta = getToolMeta(toolName);
          const ToolIcon = meta.icon;
          const status = getStatusMeta(part.state);
          const StatusIcon = status.icon;

          return (
            <div key={part.toolCallId || index} className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-3'>
                <div className='flex size-8 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground shadow-sm'>
                  <ToolIcon className='size-4' />
                </div>
                <span className='font-medium text-foreground/95'>{meta.name}</span>
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${status.color}`}>
                <StatusIcon className={`size-4 ${status.animate ? 'animate-spin' : ''}`} />
                <span className='text-xs'>{status.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Execution Plan
interface ExecutionPlanProps {
  plan: string | null;
  toolParts?: any[];
}

function parsePlan(planText: string | null): string[] {
  if (!planText) return [];
  return planText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove leading bullets like *, -, 1., 2. etc.
      return line.replace(/^[\s*-\d.]+\s*/, '');
    })
    .filter(step => step.length > 0);
}


function isStepCompleted(stepText: string, toolParts: any[]) {
  const textLower = stepText.toLowerCase();

  // If the agent has no running tools and we are in final synthesis/summary step
  if (
    (textLower.includes('synthesize') ||
      textLower.includes('summary') ||
      textLower.includes('conclusion') ||
      textLower.includes('greet') ||
      textLower.includes('offer help')) &&
    !toolParts.some(p => p.state === 'call')
  ) {
    return true;
  }

  // Check if we have executed tool parts matching keywords
  for (const part of toolParts) {
    if (part.state !== 'result') continue;

    const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.replace('tool-', '');
    const toolLower = toolName.toLowerCase();

    if (
      toolLower.includes('searchnodes') &&
      (textLower.includes('search') ||
        textLower.includes('validate') ||
        textLower.includes('entity') ||
        textLower.includes('entities') ||
        textLower.includes('node'))
    ) {
      return true;
    }
    if (
      toolLower.includes('neighborhood') &&
      (textLower.includes('neighborhood') || textLower.includes('neighbor') || textLower.includes('hops'))
    ) {
      return true;
    }
    if (
      toolLower.includes('paths') &&
      (textLower.includes('path') || textLower.includes('connect') || textLower.includes('link'))
    ) {
      return true;
    }
    if (
      toolLower.includes('centrality') &&
      (textLower.includes('centrality') || textLower.includes('rank') || textLower.includes('score'))
    ) {
      return true;
    }
    if (
      toolLower.includes('communities') &&
      (textLower.includes('community') || textLower.includes('cluster') || textLower.includes('louvain'))
    ) {
      return true;
    }
    if (
      toolLower.includes('biomedicalcontext') &&
      (textLower.includes('literature') ||
        textLower.includes('pubmed') ||
        textLower.includes('external') ||
        textLower.includes('verify') ||
        textLower.includes('evidence'))
    ) {
      return true;
    }
    if (
      toolLower.includes('gsea') &&
      (textLower.includes('gsea') || textLower.includes('enrichment') || textLower.includes('pathway'))
    ) {
      return true;
    }
    if (
      toolLower.includes('networkstatistics') &&
      (textLower.includes('statistics') ||
        textLower.includes('metric') ||
        textLower.includes('density') ||
        textLower.includes('diameter'))
    ) {
      return true;
    }
    if (
      toolLower.includes('highlight') &&
      (textLower.includes('highlight') || textLower.includes('visualize') || textLower.includes('zoom'))
    ) {
      return true;
    }
    if (toolLower.includes('color') && (textLower.includes('color') || textLower.includes('paint'))) {
      return true;
    }
    if (toolLower.includes('size') && (textLower.includes('size') || textLower.includes('resize'))) {
      return true;
    }
  }

  return false;
}

function getStepStatus(stepText: string, index: number, toolParts: any[], _totalSteps: number) {
  if (isStepCompleted(stepText, toolParts)) {
    return true;
  }

  const completedTools = toolParts.filter(p => p.state === 'result');
  if (index < completedTools.length) {
    return true;
  }

  return false;
}

export function ExecutionPlan({ plan, toolParts = [] }: ExecutionPlanProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!plan) return null;
  const steps = parsePlan(plan);
  if (steps.length === 0) return null;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className='my-3 rounded-lg border bg-muted/10 shadow-sm transition-all duration-300'
    >
      <CollapsibleTrigger className='flex w-full items-center justify-between p-3.5 font-medium text-sm transition-colors hover:bg-muted/20'>
        <div className='flex items-center gap-2 text-foreground/90'>
          {isOpen ? (
            <ChevronDownIcon className='size-4 text-muted-foreground' />
          ) : (
            <ChevronRightIcon className='size-4 text-muted-foreground' />
          )}
          <span>Execution Plan ({steps.length} Steps)</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className='border-t bg-background/40 px-4 py-3'>
        <ul className='my-1 space-y-2.5'>
          {steps.map((step, index) => {
            const completed = getStepStatus(step, index, toolParts, steps.length);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: steps are static and won't reorder during the lifecycle
              <li key={index} className='flex items-start gap-2.5 text-sm leading-snug'>
                {completed ? (
                  <CheckCircle2Icon className='mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400' />
                ) : (
                  <CircleIcon className='mt-0.5 size-4 shrink-0 text-muted-foreground/30' />
                )}
                <span
                  className={
                    completed
                      ? 'text-muted-foreground line-through decoration-muted-foreground/30'
                      : 'font-medium text-foreground/90'
                  }
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ToolCard
interface ToolCardProps {
  
  tool: any;
}

export function ToolCard({ tool }: ToolCardProps) {
  const toolName = tool.toolName || (tool.type ? tool.type.replace('tool-', '') : 'Unknown Tool');
  const meta = getToolMeta(toolName);
  const status = getStatusMeta(tool.state);
  const StatusIcon = status.icon;

  const [isParamsOpen, setIsParamsOpen] = React.useState(false);
  const [isResultOpen, setIsResultOpen] = React.useState(false);

  return (
    <div className='rounded-lg border bg-card p-3 shadow-sm'>
      <div className='mb-2 flex items-center justify-between border-b pb-2'>
        <div className='flex items-center gap-2'>
          <div className='flex size-6 items-center justify-center rounded border bg-muted/60 text-muted-foreground'>
            <meta.icon className='size-3.5' />
          </div>
          <span className='font-semibold text-foreground/95 text-xs'>{meta.name}</span>
        </div>
        <div className={`flex items-center gap-1 font-semibold text-xs ${status.color}`}>
          <StatusIcon className={`size-3.5 ${status.animate ? 'animate-spin' : ''}`} />
          <span>{status.label}</span>
        </div>
      </div>

      <div className='space-y-1.5'>
        {/* Parameters Section */}
        {tool.input && (
          <Collapsible
            open={isParamsOpen}
            onOpenChange={setIsParamsOpen}
            className='overflow-hidden rounded border bg-muted/5'
          >
            <CollapsibleTrigger className='flex w-full items-center gap-1.5 px-2.5 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted/20'>
              {isParamsOpen ? <ChevronDownIcon className='size-3' /> : <ChevronRightIcon className='size-3' />}
              <span>Parameters</span>
            </CollapsibleTrigger>
            <CollapsibleContent className='border-t bg-background/50 p-2'>
              <pre className='max-h-40 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] text-foreground/80 leading-relaxed'>
                {JSON.stringify(tool.input, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Result Section */}
        {(tool.output !== undefined || tool.errorText) && (
          <Collapsible
            open={isResultOpen}
            onOpenChange={setIsResultOpen}
            className='overflow-hidden rounded border bg-muted/5'
          >
            <CollapsibleTrigger className='flex w-full items-center gap-1.5 px-2.5 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted/20'>
              {isResultOpen ? <ChevronDownIcon className='size-3' /> : <ChevronRightIcon className='size-3' />}
              <span>Result</span>
            </CollapsibleTrigger>
            <CollapsibleContent className='border-t bg-background/50 p-2'>
              {tool.errorText ? (
                <div className='max-h-40 overflow-x-auto rounded border border-red-200/50 bg-red-50/10 p-2 font-mono text-[10px] text-red-600 dark:text-red-400'>
                  {tool.errorText}
                </div>
              ) : (
                <pre className='max-h-40 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] text-foreground/80 leading-relaxed'>
                  {JSON.stringify(tool.output, null, 2)}
                </pre>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

// ToolDrawer

interface ToolDrawerProps {
  toolParts: any[];
}

export function ToolDrawer({ toolParts }: ToolDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!toolParts || toolParts.length === 0) return null;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className='my-3 rounded-lg border bg-muted/10 shadow-sm transition-all duration-300'
    >
      <CollapsibleTrigger className='flex w-full items-center justify-between p-3.5 font-medium text-sm transition-colors hover:bg-muted/20'>
        <div className='flex items-center gap-2 text-foreground/90'>
          {isOpen ? (
            <ChevronDownIcon className='size-4 text-muted-foreground' />
          ) : (
            <ChevronRightIcon className='size-4 text-muted-foreground' />
          )}
          <span>Tool Details ({toolParts.length})</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className='space-y-3 border-t bg-background/40 p-3'>
        {toolParts.map((tool, index) => (
          <ToolCard key={tool.toolCallId || index} tool={tool} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
