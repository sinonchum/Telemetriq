import type { TelemetriqDataset } from '../types';

export function exportDatasetToCSV(dataset: TelemetriqDataset): string {
  const channelKeys = dataset.channels.map(c => c.key);
  const hasPosition = dataset.samples.some(s => s.position);
  const positionKeys = hasPosition
    ? [...new Set(dataset.samples.flatMap(s => s.position ? Object.keys(s.position) : []))]
    : [];

  const headers = ['t', ...positionKeys.map(k => `pos_${k}`), ...channelKeys];
  const rows = dataset.samples.map(sample => {
    const posValues = positionKeys.map(k => sample.position?.[k] ?? '');
    const channelValues = channelKeys.map(k => sample.values[k] ?? '');
    return [sample.t, ...posValues, ...channelValues].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
