import { describe, it, expect } from 'vitest';
import { normalizeDataset } from '../dataset/normalizeDataset';
import type { TelemetriqDataset } from '../types';

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 200 },
  channels: [{ key: 'speed', type: 'number' }],
  samples: [
    { t: 0, values: { speed: 0 } },
    { t: 100, values: { speed: 50 } },
    { t: 200, values: { speed: null } },
  ],
};

describe('normalizeDataset', () => {
  it('extracts timestamps to Float64Array', () => {
    const norm = normalizeDataset(dataset);
    expect(norm.timestamps).toBeInstanceOf(Float64Array);
    expect(Array.from(norm.timestamps)).toEqual([0, 100, 200]);
  });

  it('converts number channels to Float64Array', () => {
    const norm = normalizeDataset(dataset);
    const ch = norm.channels.get('speed')!;
    expect(ch.data).toBeInstanceOf(Float64Array);
    expect(ch.data[0]).toBe(0);
    expect(ch.data[1]).toBe(50);
    expect(ch.data[2]).toBeNaN();
  });

  it('handles position data', () => {
    const withPos: TelemetriqDataset = {
      ...dataset,
      samples: [{ t: 0, position: { x: 1, y: 2 }, values: { speed: 0 } }],
    };
    const norm = normalizeDataset(withPos);
    expect(norm.positions?.x).toBeInstanceOf(Float64Array);
    expect(norm.positions?.x![0]).toBe(1);
    expect(norm.positions?.y![0]).toBe(2);
  });

  it('handles empty dataset', () => {
    const empty: TelemetriqDataset = {
      ...dataset,
      samples: [],
    };
    const norm = normalizeDataset(empty);
    expect(norm.timestamps.length).toBe(0);
  });
});
