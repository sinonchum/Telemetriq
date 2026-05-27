import { describe, it, expect } from 'vitest';
import { getValueAt } from '../interpolation/getValueAt';
import { normalizeDataset } from '../dataset/normalizeDataset';
import type { TelemetriqDataset } from '../types';

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 200 },
  channels: [
    { key: 'speed', type: 'number', interpolation: 'linear' },
    { key: 'gear', type: 'string', interpolation: 'previous' },
  ],
  samples: [
    { t: 0, values: { speed: 0, gear: '1' } },
    { t: 100, values: { speed: 100, gear: '2' } },
    { t: 200, values: { speed: 200, gear: '3' } },
  ],
};

describe('getValueAt', () => {
  const norm = normalizeDataset(dataset);

  it('linear interpolation at midpoint', () => {
    expect(getValueAt(norm, dataset, 'speed', 50)).toBe(50);
  });

  it('linear interpolation at exact time', () => {
    expect(getValueAt(norm, dataset, 'speed', 100)).toBe(100);
  });

  it('previous interpolation for string', () => {
    expect(getValueAt(norm, dataset, 'gear', 150)).toBe('2');
    expect(getValueAt(norm, dataset, 'gear', 50)).toBe('1');
  });

  it('returns NaN for out of range', () => {
    expect(getValueAt(norm, dataset, 'speed', -100)).toBeNaN();
  });

  it('returns null for unknown channel', () => {
    expect(getValueAt(norm, dataset, 'unknown', 50)).toBeNull();
  });
});
