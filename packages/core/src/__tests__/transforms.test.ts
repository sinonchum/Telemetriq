import { describe, it, expect } from 'vitest';
import { exportDatasetToCSV } from '../transforms/exportCSV';
import { sliceDataset } from '../transforms/sliceDataset';
import { mergeDatasets } from '../transforms/mergeDatasets';
import type { TelemetriqDataset } from '../types';

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 200 },
  channels: [{ key: 'speed', type: 'number' }, { key: 'rpm', type: 'number' }],
  samples: [
    { t: 0, position: { x: 0, y: 0 }, values: { speed: 0, rpm: 800 } },
    { t: 100, position: { x: 5, y: 1 }, values: { speed: 50, rpm: 3000 } },
    { t: 200, position: { x: 12, y: 3 }, values: { speed: 100, rpm: 5000 } },
  ],
  events: [{ t: 100, type: 'marker', label: 'Mid' }],
};

describe('exportDatasetToCSV', () => {
  it('exports to CSV string', () => {
    const csv = exportDatasetToCSV(dataset);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('t,pos_x,pos_y,speed,rpm');
    expect(lines).toHaveLength(4); // header + 3 rows
  });

  it('handles no position', () => {
    const noPos = { ...dataset, samples: dataset.samples.map(s => ({ ...s, position: undefined })) };
    const csv = exportDatasetToCSV(noPos);
    expect(csv.split('\n')[0]).toBe('t,speed,rpm');
  });
});

describe('sliceDataset', () => {
  it('slices by time range', () => {
    const sliced = sliceDataset(dataset, 50, 150);
    expect(sliced.samples).toHaveLength(1);
    expect(sliced.samples[0].t).toBe(100);
    expect(sliced.time.start).toBe(50);
    expect(sliced.time.end).toBe(150);
  });

  it('filters events', () => {
    const sliced = sliceDataset(dataset, 0, 50);
    expect(sliced.events).toHaveLength(0);
  });
});

describe('mergeDatasets', () => {
  it('merges two datasets', () => {
    const ds2: TelemetriqDataset = {
      version: '0.1.0',
      time: { unit: 'ms', start: 100, end: 300 },
      channels: [{ key: 'altitude', type: 'number' }],
      samples: [
        { t: 100, values: { altitude: 50 } },
        { t: 300, values: { altitude: 120 } },
      ],
    };
    const merged = mergeDatasets([dataset, ds2]);
    expect(merged.samples).toHaveLength(5);
    expect(merged.channels).toHaveLength(3);
    expect(merged.time.start).toBe(0);
    expect(merged.time.end).toBe(300);
  });

  it('throws on empty array', () => {
    expect(() => mergeDatasets([])).toThrow();
  });
});
