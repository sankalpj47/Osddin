'use client';

import {
  SigmaContainer as _SigmaContainer,
  ControlsContainer,
  FullScreenControl,
  type SigmaContainerProps,
} from '@react-sigma/core';
import { createNodeBorderProgram, NodeBorderProgram } from '@sigma/node-border';
import type { Attributes } from 'graphology-types';
import { MaximizeIcon, MinimizeIcon } from 'lucide-react';
import React, { Suspense, useEffect } from 'react';
import type Sigma from 'sigma';
import { drawDiscNodeHover, EdgeLineProgram, NodeCircleProgram } from 'sigma/rendering';
import { DEFAULT_EDGE_COLOR } from '@/lib/data';
import { NodeGradientProgram } from '@/lib/graph';
import type { EdgeAttributes, NodeAttributes } from '@/lib/interface';
import { NetworkSelectionToolbar } from '../right-panel';
import {
  ColorAnalysis,
  ForceLayout,
  GraphAnalysis,
  GraphEvents,
  GraphExport,
  GraphSettings,
  LoadGraph,
  SizeAnalysis,
  ZoomControl,
} from '.';
import { SelectionPlugin, type SelectionPluginHandle } from '@/lib/plugins/react-sigma-selection';
import { useStore } from '@/lib/hooks';

export function SigmaContainer(
  props: SigmaContainerProps<NodeAttributes, EdgeAttributes, Attributes> & { ref?: React.Ref<Sigma> },
) {
  const clickedNodesRef = React.useRef(new Set<string>());
  const highlightedNodesRef = React.useRef(new Set<string>());
  const seedProximityNodesRef = React.useRef(new Set<string>());
  const selectionPluginRef = React.useRef<SelectionPluginHandle>(null);
  const sigmaRef = React.useRef<Sigma | null>(null);

  const handleSelectionChange = React.useCallback(
    (nodeIds: string[]) => {
      const graph = sigmaRef.current?.getGraph();

      if (!graph) return;

      useStore.setState({
        selectedNodes: nodeIds.map(node => ({
          Gene_Name: graph.getNodeAttribute(node, 'label') as string,
          ID: node,
          Description: graph.getNodeAttribute(node, 'description') as string,
        })),
      });
    },
    [],
  );

  useEffect(() => {
    const sigmaContainer = document.querySelector('.sigma-container') as HTMLElement;
    sigmaContainer.addEventListener('contextmenu', e => e.preventDefault());
  }, []);

  return (
    <_SigmaContainer
      ref={(sigma) => {
        sigmaRef.current = sigma;

        if (props.ref) {
          if (typeof props.ref === 'function') {
            props.ref(sigma);
          } else {
            props.ref.current = sigma;
          }
        }
      }}
      className={props.className}
      settings={{
        ...props.settings,
        allowInvalidContainer: true,
        enableEdgeEvents: true,
        defaultNodeType: 'circle',
        labelRenderedSizeThreshold: 0.75,
        labelDensity: 0.2,
        defaultEdgeColor: DEFAULT_EDGE_COLOR,
        labelSize: 10,
        zoomingRatio: 1.2,
        zIndex: true,
        nodeProgramClasses: {
          circle: NodeGradientProgram,
          border: createNodeBorderProgram({
            borders: [
              {
                size: { attribute: 'borderSize', defaultValue: 0.4 },
                color: { attribute: 'borderColor' },
              },
              { size: { fill: true }, color: { attribute: 'color' } },
            ],
          }),
          highlight: NodeBorderProgram,
          normal: NodeCircleProgram,
        },
        edgeProgramClasses: {
          line: EdgeLineProgram,
        },
        defaultDrawNodeHover: drawDiscNodeHover,
      }}
    >
      <Suspense>
        <LoadGraph />
      </Suspense>
      <GraphExport highlightedNodesRef={highlightedNodesRef} />
      <GraphEvents
        seedProximityNodesRef={seedProximityNodesRef}
        highlightedNodesRef={highlightedNodesRef}
        clickedNodesRef={clickedNodesRef}
        selectionPluginRef={selectionPluginRef}
      />
      <SelectionPlugin
        ref={selectionPluginRef}
        selectedNodeType="border"
        onSelectionChange={handleSelectionChange}
        shouldIncludeNode={(_id, attrs) => attrs.hidden !== true}
        autoRegisterEvents={false}
      />
      <ForceLayout />
      <GraphSettings clickedNodesRef={clickedNodesRef} />
      <ColorAnalysis />
      <SizeAnalysis />
      <GraphAnalysis highlightedNodesRef={highlightedNodesRef} seedProximityNodesRef={seedProximityNodesRef} />
      <ControlsContainer position='bottom-right' style={{ zIndex: 0 }}>
        <ZoomControl />
        <FullScreenControl labels={{ enter: 'ENTER', exit: 'EXIT' }}>
          <MaximizeIcon />
          <MinimizeIcon />
        </FullScreenControl>
      </ControlsContainer>
      <div className='pointer-events-none absolute top-1 left-1'>
        <div className='pointer-events-auto rounded-lg border border-gray-200 bg-white shadow-md'>
          <NetworkSelectionToolbar selectionPluginRef={selectionPluginRef} />
        </div>
      </div>
    </_SigmaContainer>
  );
}
