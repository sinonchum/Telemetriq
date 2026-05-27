import { describe, it, expect } from 'vitest';
import { getValueAt } from '../interpolation/getValueAt';
import { normalizeDataset } from '../dataset/normalizeDataset';
import type { TelemetriqDataset } from '../types';

describe('getValueAt edge cases', () => {
  const dataset: TelemetriqDataset = {
    version: '0.1.0',
    time: { unit: 'ms', start: 0, end: 200 },
    channels: [
      { key: 'speed', type: 'number', interpolation: 'linear' },
      { key: 'flag', type: 'boolean', interpolation: 'previous' },
    ],
    samples: [
      { t: 0, values: { speed: 0, flag: true } },
      { t: 100, values: { speed: 100, flag: false } },
      { t: 200, values: { speed: 200, flag: true } },
    ],
  };
  const norm = normalizeDataset(dataset);

  it('linear at exact boundary', () => {
    expect(getValueAt(norm, dataset, 'speed', 0)).toBe(0);
    expect(getValueAt(norm, dataset, 'speed', 200)).toBe(200);
  });

  it('linear at quarter', () => {
    expect(getValueAt(norm, dataset, 'speed', 50)).toBe(50);
    expect(getValueAt(norm, dataset, 'speed', 150)).toBe(150);
  });

  it('boolean uses previous', () => {
    // normalizeDataset converts booleans to 0/1 via Number()
    expect(getValueAt(norm, dataset, 'flag', 50)).toBe(1);
    expect(getValueAt(norm, dataset, 'flag', 150)).toBe(0);
  });

  it('returns NaN before start', () => {
    expect(getValueAt(norm, dataset, 'speed', -100)).toBeNaN();
  });

  it('returns NaN after end', () => {
    expect(getValueAt(norm, dataset, 'speed', 300)).toBeNaN();
  });

  it('returns null for unknown channel', () => {
    expect(getValueAt(norm, dataset, 'unknown', 50)).toBeNull();
  });

  it('none interpolation returns floor value', () => {
    const ds: TelemetriqDataset = {
      ...dataset,
      channels: [{ key: 'val', type: 'number', interpolation: 'none' }],
      samples: [{ t: 0, values: { val: 10 } }, { t: 100, values: { val: 20 } }],
    };
    const n = normalizeDataset(ds);
    expect(getValueAt(n, ds, 'val', 50)).toBe(10);
  });
});
