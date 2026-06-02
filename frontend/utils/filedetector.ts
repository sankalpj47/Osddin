export async function detectUploadType(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase();

  // Always knowledge graph
  if (
    ext === 'graphml' ||
    ext === 'gexf' ||
    ext === 'zip'
  ) {
    return 'knowledge-graph';
  }

  const text = await file.text();

  if (ext === 'json') {
    try {
      const json = JSON.parse(text);

      // Graphology format
      if (
        json.nodes &&
        json.edges
      ) {
        return 'knowledge-graph';
      }
    } catch {}
  }

  if (ext === 'csv') {
    const headers = text
      .split('\n')[0]
      .split(',')
      .map(h => h.trim().toLowerCase());

    const h = new Set(headers);

    // KG schemas
    if (
      (h.has('source_id') && h.has('target_id')) ||
      (h.has('id') && h.has('type'))
    ) {
      return 'knowledge-graph';
    }

    return 'network';
  }

  return 'network';
}