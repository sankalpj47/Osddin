'use client';
import { useLazyQuery } from '@apollo/client/react';
import { useSigma } from '@react-sigma/core';
import { fitViewportToNodes } from '@sigma/utils';
import { scaleLinear } from 'd3-scale';
import { toUndirected } from 'graphology-operators';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GENE_PROPERTIES_QUERY } from '@/lib/gql';
import { useStore } from '@/lib/hooks';
import {
  type EdgeAttributes,
  type GenePropertiesData,
  type GenePropertiesDataVariables,
  GenePropertyCategoryEnum,
  type NodeAttributes,
} from '@/lib/interface';
import { type EventMessage, Events, eventEmitter } from '@/lib/utils';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

const LEIDEN_DEFAULT_PARAMETERS = {
  resolution: '1',
  minCommunitySize: '4',
  weighted: 'true',
};

export function GraphAnalysis({
  highlightedNodesRef,
  seedProximityNodesRef,
}: {
  highlightedNodesRef?: React.RefObject<Set<string>>;
  seedProximityNodesRef: React.RefObject<Set<string>>;
}) {
  const sigma = useSigma<NodeAttributes, EdgeAttributes>();
  const graph = sigma.getGraph();
  const radialAnalysis = useStore(state => state.radialAnalysis);
  const setNetworkStatistics = useStore(state => state.setNetworkStatistics);
  const [communityMap, setCommunityMap] = useState<Record<string, { name: string; genes: string[]; color: string }>>(
    {},
  );
  const { geneIDs: seedGeneIDs }: { geneIDs: string[] } = useStore(state => state.graphConfig) ?? { geneIDs: [] };

  // biome-ignore lint/correctness/useExhaustiveDependencies: I won't write reason
  useEffect(() => {
    let totalEdges = 0;
    graph.updateEachEdgeAttributes((_edge, attr) => {
      if (attr.score && attr.score < radialAnalysis.edgeWeightCutOff) {
        attr.hidden = true;
      } else {
        attr.hidden = false;
        totalEdges++;
      }
      return attr;
    });
    setNetworkStatistics({ totalEdges });
  }, [radialAnalysis.edgeWeightCutOff]);

  const nodeDegreeProperty = useStore(state => state.radialAnalysis.nodeDegreeProperty);
  const universalData = useStore(state => state.universalData);

  const [fetchUniversal] = useLazyQuery<GenePropertiesData, GenePropertiesDataVariables>(GENE_PROPERTIES_QUERY);

  // biome-ignore lint/correctness/useExhaustiveDependencies: I won't write reason
  useEffect(() => {
    (async () => {
      let totalNodes = 0;
      const userOrCommonIdentifier = useStore.getState().radioOptions.user.TE.includes(nodeDegreeProperty)
        ? 'user'
        : 'common';
      const isNodeDegree = nodeDegreeProperty === 'Gene Degree';
      if (!isNodeDegree) {
        await fetchUniversal({
          variables: {
            geneIds: graph.nodes(),
            config: [{ category: GenePropertyCategoryEnum.TISSUE_EXPRESSION, properties: [nodeDegreeProperty] }],
          },
        }).then(({ data }) => {
          const minMax = [Number.POSITIVE_INFINITY, 0];
          for (const gene of data?.geneProperties ?? []) {
            const score = gene.data[0].score;
            if (score === null || score === undefined || Number.isNaN(score)) continue;
            universalData[gene.ID][userOrCommonIdentifier].TE[nodeDegreeProperty] = score;
            minMax[0] = Math.min(minMax[0], score);
            minMax[1] = Math.max(minMax[1], score);
          }
          const sizeScale = scaleLinear<number, number>(minMax, [0, 1]);
          graph.updateEachNodeAttributes((node, attr) => {
            const value = +universalData[node]?.[userOrCommonIdentifier]?.TE[nodeDegreeProperty];
            if (!Number.isNaN(value) && sizeScale(value) >= radialAnalysis.candidatePrioritizationCutOff) {
              totalNodes++;
              attr.hidden = false;
            } else {
              attr.hidden = true;
            }
            return attr;
          });
        });
      } else {
        graph.updateEachNodeAttributes((node, attr) => {
          const degree = graph.degree(node);
          if (degree < radialAnalysis.candidatePrioritizationCutOff) {
            attr.hidden = true;
          } else {
            totalNodes++;
            attr.hidden = false;
          }
          return attr;
        });
      }
      const totalEdges = graph.reduceEdges((count, _edge, _attr, _src, _tgt, srcAttr, tgtAttr) => {
        return count + (srcAttr.hidden || tgtAttr.hidden ? 0 : 1);
      }, 0);
      setNetworkStatistics({ totalEdges, totalNodes });
    })();
  }, [radialAnalysis.candidatePrioritizationCutOff, nodeDegreeProperty]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: I won't write reason
  useEffect(() => {
    if (radialAnalysis.seedGeneProximityCutOff < 1) {
      seedProximityNodesRef.current.clear();
      graph.updateEachNodeAttributes((node, attr) => {
        if (highlightedNodesRef?.current.has(node)) {
          attr.type = 'highlight';
        } else {
          attr.type = 'circle';
        }
        return attr;
      });
    } else {
      graph.updateEachNodeAttributes((node, attr) => {
        const degree = graph.neighbors(node).filter(neighbor => seedGeneIDs.includes(neighbor)).length;
        if (degree >= radialAnalysis.seedGeneProximityCutOff) {
          attr.type = 'border';
          seedProximityNodesRef.current.add(node);
        } else if (highlightedNodesRef?.current.has(node)) {
          attr.type = 'highlight';
          seedProximityNodesRef.current.delete(node);
        } else {
          attr.type = 'circle';
          seedProximityNodesRef.current.delete(node);
        }
        return attr;
      });
    }
  }, [radialAnalysis.seedGeneProximityCutOff]);

  // async function renewSession() {
  //   const res = await fetch(`${envURL(process.env.NEXT_PUBLIC_BACKEND_URL)}/algorithm/renew-session`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(useStore.getState().graphConfig!),
  //   });
  //   if (res.status === 202 || res.status === 409) return true;
  //   return false;
  // }

  // const searchParams = useSearchParams();

  // biome-ignore lint/correctness/useExhaustiveDependencies: I won't write reason
  useEffect(() => {
    eventEmitter.on(Events.ALGORITHM, async ({ name, parameters }: EventMessage[Events.ALGORITHM]) => {
      if (name === 'None') {
        setCommunityMap({});
        graph.updateEachNodeAttributes((_, attr) => {
          attr.color = undefined;
          attr.community = undefined;
          return attr;
        });
      } else if (name === 'Leiden') {
        const { resolution, weighted, minCommunitySize } = {
          ...LEIDEN_DEFAULT_PARAMETERS,
          ...parameters,
        };
        const isWeighted = weighted === 'true' || weighted === 'on';

        try {
          const louvain = await import('graphology-communities-louvain').then(lib => lib.default);

          const undirectedGraph = toUndirected(graph, (currentAttr, nextAttr) => {
            if (isWeighted && currentAttr.score && nextAttr.score) {
              return {
                ...currentAttr,
                score: currentAttr.score + nextAttr.score,
              };
            }
            return currentAttr;
          });

          const res = louvain.detailed(undirectedGraph, {
            resolution: +resolution,
            getEdgeWeight: isWeighted ? 'score' : null,
          });

          const map: Record<string, { name: string; genes: string[]; color: string }> = {};

          let count = 0;

          const hslToHex = (h: number, s: number, l: number) => {
            l /= 100;
            const a = (s * Math.min(l, 1 - l)) / 100;

            const f = (n: number) => {
              const k = (n + h / 30) % 12;

              const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

              return Math.round(255 * color)
                .toString(16)
                .padStart(2, '0');
            };

            return `#${f(0)}${f(8)}${f(4)}`;
          };

          for (const [node, comm] of Object.entries(res.communities)) {
            if (!map[comm]) {
              map[comm] = {
                name: `Community ${count++}`,
                genes: [],
                color: hslToHex(count * 137.508, 75, 50),
              };
            }

            map[comm].genes.push(node);
          }

          // Color ALL communities first
          for (const community of Object.values(map)) {
            for (const gene of community.genes) {
              if (graph.hasNode(gene)) {
                graph.setNodeAttribute(gene, 'color', community.color);

                graph.setNodeAttribute(gene, 'community', community.name);
              }
            }
          }

          // Then apply minCommunitySize only as a filter
          const displayMap: Record<
            string,
            {
              name: string;
              genes: string[];
              color: string;
            }
          > = {};

          for (const [id, community] of Object.entries(map)) {
            if (community.genes.length >= +minCommunitySize) {
              displayMap[id] = community;
            }
          }
          setCommunityMap(displayMap);

          eventEmitter.emit(Events.ALGORITHM_RESULTS, {
            modularity: res.modularity,
            resolution: +resolution,

            communities: Object.values(displayMap).map(({ name, genes, color }) => {
              const [degreeSum, maxDegree] = genes.reduce(
                ([acc, max], gene) => {
                  const degree = graph.degree(gene);

                  return [acc + degree, Math.max(max, degree)];
                },
                [0, 0],
              );

              return {
                name,

                nodes: genes.map(gene => graph.getNodeAttribute(gene, 'label') ?? gene),

                color,

                percentage: ((genes.length / graph.order) * 100).toFixed(2),

                averageDegree: (degreeSum / genes.length).toFixed(2),

                degreeCentralNode: graph.getNodeAttribute(
                  genes.find(gene => graph.degree(gene) === maxDegree)!,
                  'label',
                )!,
              };
            }),
          });

          toast.success('Community detection completed', {
            description: `Found ${Object.keys(displayMap).length} communities`,
          });
        } catch (error) {
          console.error(error);

          toast.error('Failed to run clustering');
        }
      }
    });
  }, []);

  const getReadableTextColor = useCallback((hex: string) => {
    const [r, g, b] = hex.match(/\w\w/g)!.map(v => Number.parseInt(v, 16));
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 140 ? '#000' : '#fff';
  }, []);

  return (
    <>
      {Object.keys(communityMap).length > 0 && (
        <div className='absolute bottom-1 left-2 flex max-h-56 flex-col space-y-1 overflow-scroll rounded-md border p-2 shadow-sm backdrop-blur-sm'>
          {Object.entries(communityMap).map(([id, val], _idx) => (
            <div key={id} className='flex items-center gap-1'>
              <Checkbox
                defaultChecked
                onCheckedChange={bool => {
                  if (bool === 'indeterminate') return;
                  for (const gene of val.genes) {
                    graph.setNodeAttribute(gene, 'hidden', !bool);
                  }
                }}
              />
              <Button
                style={{
                  backgroundColor: val.color,
                  color: getReadableTextColor(val.color),
                }}
                className='h-5 w-40 justify-between px-2'
                onClick={() => fitViewportToNodes(sigma, val.genes, { animate: true })}
              >
                <span>{val.name}</span>
                <span>({val.genes.length})</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
