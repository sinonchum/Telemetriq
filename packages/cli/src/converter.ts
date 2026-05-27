import type { TelemetriqDataset } from '@telemetriq/core';
import { parseCSV } from './csv-parser';

export type MappingConfig = {
  time: { column: string; unit: 'ms' | 's' };
  position?: Record<string, string>;
  channels: Record<string, { column: string; unit?: string }>;
};

export function convertCSVToTelemetriq(csvText: string, mapping: MappingConfig): TelemetriqDataset {
  const { rows } = parseCSV(csvText);
  const samples = rows.map(row => {
    const t = Number(row[mapping.time.column]);
    const position: Record<string, number> = {};
    if (mapping.position) {
      for (const [key, col] of Object.entries(mapping.position)) {
        position[key] = Number(row[col]);
      }
    }
    const values: Record<string, number> = {};
    for (const [key, cfg] of Object.entries(mapping.channels)) {
      values[key] = Number(row[cfg.column]);
    }
    return { t, position: Object.keys(position).length > 0 ? position : undefined, values };
  });

  const channels = Object.entries(mapping.channels).map(([key, cfg]) => ({
    key, label: key, unit: cfg.unit, type: 'number' as const, interpolation: 'linear' as const,
  }));

  return {
    version: '0.1.0',
    time: { unit: mapping.time.unit, start: samples[0]?.t ?? 0, end: samples[samples.length - 1]?.t ?? 0 },
    channels, samples,
  };
}
