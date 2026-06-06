'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { columnKGConnectedEdges, columnKGSelectedNodes } from '@/lib/data';
import { useKGStore } from '@/lib/hooks';
import PopUpDataTable from '../PopUpDataTable';
import { Button } from '../ui/button';

interface NodeData {
  id: string;
  label: string;
  nodeType?: string;
}

interface EdgeData {
  source: string;
  target: string;
  sourceLabel?: string;
  targetLabel?: string;
  edgeType?: string;
}

/**
 * KGNetworkInfo - Display network statistics and selected nodes
 * Shows selected nodes with 2 tabs: Node Properties | Connected Edges
 */
export function KGNetworkInfo() {
  const totalNodes = useKGStore(state => state.networkStatistics.totalNodes);
  const totalEdges = useKGStore(state => state.networkStatistics.totalEdges);
  const selectedNodes = useKGStore(state => state.selectedNodes);
  const sigmaInstance = useKGStore(state => state.sigmaInstance);
  
  const [showTable, setShowTable] = useState(false);
  const [connectedEdges, setConnectedEdges] = useState<EdgeData[]>([]);
  const [allNodes, setAllNodes] = useState<NodeData[]>([]);
  const [allEdges, setAllEdges] = useState<EdgeData[]>([]);

  // Clear stale calculation tables when selection context modifications execute
  useEffect(() => {
    setAllNodes([]);
    setAllEdges([]);
    setConnectedEdges([]);
  }, [selectedNodes]);

  const handleShowTable = () => {
    if (!sigmaInstance) {
      toast.error('Graph not initialized');
      return;
    }

    const graph = sigmaInstance.getGraph();

    if (selectedNodes.length === 0) {
      // Lazy load global network topologies only when table display requested
      if (allNodes.length === 0 || allEdges.length === 0) {
        const nodes = graph.mapNodes((node, attributes) => ({
          id: node,
          label: attributes.label || node,
          nodeType: attributes.nodeType,
        }));

        const edges = graph.mapEdges((_edge, attributes, source, target) => {
          const sourceAttrs = graph.getNodeAttributes(source);
          const targetAttrs = graph.getNodeAttributes(target);
          return {
            source,
            target,
            sourceLabel: sourceAttrs.label || source,
            targetLabel: targetAttrs.label || target,
            edgeType: attributes.edgeType || '',
          };
        });

        setAllNodes(nodes);
        setAllEdges(edges);
      }
      setConnectedEdges([]);
    } else {
      // Isolate adjacent connection lines bounding targeted focal selections
      const edges: EdgeData[] = [];
      const edgeSet = new Set<string>();

      for (const nodeId of selectedNodes) {
        if (!graph.hasNode(nodeId)) continue;

        graph.forEachEdge(nodeId, (edge, _attributes, source, target) => {
          if (edgeSet.has(edge)) return;
          edgeSet.add(edge);

          const edgeAttrs = graph.getEdgeAttributes(edge);
          const sourceAttrs = graph.getNodeAttributes(source);
          const targetAttrs = graph.getNodeAttributes(target);

          edges.push({
            source,
            target,
            sourceLabel: sourceAttrs.label || source,
            targetLabel: targetAttrs.label || target,
            edgeType: edgeAttrs.edgeType || '',
          });
        });
      }

      setConnectedEdges(edges);
    }
    setShowTable(true);
  };

  // Memoize focal point array computations across sub-renders
  const selectedNodesWithData = useMemo(() => {
    if (selectedNodes.length === 0 || !sigmaInstance) return [];
    
    const graph = sigmaInstance.getGraph();
    return selectedNodes.map(id => {
      if (!graph.hasNode(id)) return { id, label: id, nodeType: undefined };
      const attrs = graph.getNodeAttributes(id);
      return {
        id,
        label: attrs.label || id,
        nodeType: attrs.nodeType,
      };
    });
  }, [selectedNodes, sigmaInstance]);

  const hasSelection = selectedNodes.length > 0;
  const displayNodes = hasSelection ? selectedNodesWithData : allNodes;
  const displayEdges = hasSelection ? connectedEdges : allEdges;
  const buttonText = hasSelection ? `Selected Nodes (${selectedNodes.length})` : `All Network Data`;

  return (
    <div className='mb-2 rounded border p-2 text-xs shadow-sm bg-white'>
      <p className='mb-2 font-bold'>Network Info</p>
      <div className='flex flex-col justify-between'>
        <div className='flex flex-col gap-1 text-muted-foreground'>
          <span>Total Nodes: <b className='text-foreground'>{totalNodes}</b></span>
          <span>Total Edges: <b className='text-foreground'>{totalEdges}</b></span>
        </div>
        
        <Button variant='outline' size='sm' className='mt-2 font-semibold text-xs h-7' onClick={handleShowTable}>
          {buttonText}
        </Button>
        
        <PopUpDataTable
          data={[displayNodes, displayEdges]}
          columns={[columnKGSelectedNodes, columnKGConnectedEdges]}
          dialogTitle={hasSelection ? 'Selected Nodes' : 'All Network Data'}
          tabsTitle={['Node Properties', 'Edges Properties']}
          open={showTable}
          loading={[false, false]}
          setOpen={setShowTable}
          filterColumnNames={[
            ['id', 'label'],
            ['source', 'target', 'sourceLabel', 'targetLabel'],
          ]}
          description={
            hasSelection
              ? 'View the selected nodes and their details. Switch to "Edges Properties" to see edges linked to these nodes.'
              : 'View all nodes and edges in the network.'
          }
        />
      </div>
    </div>
  );
}