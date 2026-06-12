'use client';

import { ChevronsUpDownIcon } from 'lucide-react';
import { PROPERTY_TYPE_LABEL_MAPPING } from '@/lib/data';
import { useKGStore, useStore } from '@/lib/hooks';
import { P_VALUE_REGEX } from '@/lib/utils';
import { BinaryLegend, HeatmapLegend, NodeTypeLegend } from '../legends';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

/**
 * Structural configurations mapping specific data types to target Legend layouts
 */
const LEGEND_RENDERERS: Record<string, (prop: string) => React.ReactNode> = {
  Pathway: () => <BinaryLegend />,
  DEG: (prop) =>
    P_VALUE_REGEX.test(prop) ? (
      <HeatmapLegend
        title='P-Value'
        range={['green', 'red']}
        startLabel='Low Significance'
        endLabel='High Significance'
      />
    ) : (
      <HeatmapLegend
        title={PROPERTY_TYPE_LABEL_MAPPING.DEG}
        domain={[-1, 0, 1]}
        range={['green', '#E2E2E2', 'red']}
        divisions={10}
      />
    ),
  Druggability: () => (
    <HeatmapLegend
      title={PROPERTY_TYPE_LABEL_MAPPING.Druggability}
      domain={[0, 1]}
      range={['green', 'red']}
      divisions={10}
    />
  ),
  OpenTargets: () => (
    <HeatmapLegend
      title={PROPERTY_TYPE_LABEL_MAPPING.OpenTargets}
      domain={[0, 1]}
      range={['green', 'red']}
      divisions={10}
    />
  ),
  TE: () => (
    <HeatmapLegend
      title={PROPERTY_TYPE_LABEL_MAPPING.TE}
      range={['green', 'red']}
      startLabel='Low'
      endLabel='High'
    />
  ),
  OT_Prioritization: () => (
    <HeatmapLegend
      title={PROPERTY_TYPE_LABEL_MAPPING.OT_Prioritization}
      domain={[-1, 0, 1]}
      range={['red', '#F0C584', 'green']}
      divisions={10}
    />
  ),
  Custom_Color: () => <p className='text-center font-semibold'>Custom colors from uploaded file</p>,
};

export function KGLegend() {
  const selectedRadioNodeColor = useStore(state => state.selectedRadioNodeColor);
  const selectedNodeColorProperty = useKGStore(state => state.selectedNodeColorProperty);
  const showEdgeColor = useKGStore(state => state.showEdgeColor);

  // Determine standard rendering function based on selected target node property
  const renderPropertyLegend = () => {
    if (!selectedRadioNodeColor) {
      return <p className='text-center font-semibold'>Select Data-points on left to view legends!</p>;
    }

    const renderFn = LEGEND_RENDERERS[selectedRadioNodeColor];
    if (renderFn) {
      return renderFn(selectedNodeColorProperty);
    }

    if (selectedNodeColorProperty) {
      return (
        <HeatmapLegend
          title={`Color: ${selectedNodeColorProperty}`}
          range={['#3b82f6', 'red']}
          startLabel='Low'
          endLabel='High'
        />
      );
    }

    return <p className='text-center font-semibold'>No Legends Available</p>;
  };

  return (
    <div className='w-full flex flex-col min-w-0 gap-2 p-1'>
      <NodeTypeLegend />

      <hr className='my-0.5' />
      <div className='flex flex-col items-center gap-2 w-full'>
        {renderPropertyLegend()}
        
        {showEdgeColor && (
          <div className='w-full border-t pt-2 mt-1'>
            <HeatmapLegend
              title='Edge Color'
              range={['yellow', 'red']}
              domain={[0, 1]}
              divisions={10}
              height={40}
            />
          </div>
        )}
      </div>
    </div>
  );
}