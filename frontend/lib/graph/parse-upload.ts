import { unzip } from 'fflate';
import type { SerializedGraph } from 'graphology-types';

import { parseGEXF, parseGraphML, parseJSON, parseSingleCSV, parseTwoCSV } from './knowledge-graph-parser';

export async function parseKnowledgeGraph(files: File[]): Promise<SerializedGraph> {
  if (files.length === 0) {
    throw new Error('No files provided');
  }

  // ZIP
  if (files[0].name.toLowerCase().endsWith('.zip')) {
    const zipData = await files[0].arrayBuffer();

    const unzipped = await new Promise<{
      [key: string]: Uint8Array;
    }>((resolve, reject) => {
      unzip(new Uint8Array(zipData), (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const csvEntries = Object.entries(unzipped).filter(([name]) => name.toLowerCase().endsWith('.csv'));

    const extractedFiles = csvEntries.map(([name, data]) => {
      const buffer = data.buffer instanceof ArrayBuffer ? data.buffer : data.slice().buffer;

      return new File([new Blob([buffer], { type: 'text/csv' })], name);
    });

    if (extractedFiles.length === 2) {
      return parseTwoCSV(extractedFiles[0], extractedFiles[1]);
    }

    return parseSingleCSV(extractedFiles[0]);
  }

  // 2 CSVs
  if (files.length === 2) {
    return parseTwoCSV(files[0], files[1]);
  }

  const file = files[0];

  const ext = file.name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'json':
      return parseJSON(file);

    case 'csv':
      return parseSingleCSV(file);

    case 'graphml':
      return parseGraphML(file);

    case 'gexf':
      return parseGEXF(file);

    default:
      throw new Error(`Unsupported format: ${ext}`);
  }
}
