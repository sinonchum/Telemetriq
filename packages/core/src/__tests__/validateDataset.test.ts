import { describe, it, expect } from 'vitest';
import { validateDataset } from '../validation/validateDataset';
import type { TelemetriqDataset } from '../types';

const validDataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 10000 },
  channels: [{ key: 'speed', type: 'number' }],
  samples: [
    { t: 0, values: { speed: 0 } },
    { t: 100, values: { speed: 50 } },
  ],
};

describe('validateDataset', () => {
  it('should pass valid dataset', () => {
    const result = validateDataset(validDataset);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail on missing version', () => {
    const result = validateDataset({ ...validDataset, version: '' });
    expect(result.valid).toBe(false);
  });

  it('should fail on empty samples', () => {
    const result = validateDataset({ ...validDataset, samples: [] });
    expect(result.valid).toBe(false);
  });

  it('should fail on unsorted samples', () => {
    const result = validateDataset({
      ...validDataset,
      samples: [
        { t: 100, values: { speed: 50 } },
        { t: 0, values: { speed: 0 } },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('should fail on duplicate channel keys', () => {
    const result = validateDataset({
      ...validDataset,
      channels: [
        { key: 'speed', type: 'number' },
        { key: 'speed', type: 'number' },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('should fail on unknown value key', () => {
    const result = validateDataset({
      ...validDataset,
      samples: [{ t: 0, values: { unknown: 0 } }],
    });
    expect(result.valid).toBe(false);
  });

  it('should fail on invalid time range', () => {
    const result = validateDataset({
      ...validDataset,
      time: { unit: 'ms', start: 10000, end: 0 },
    });
    expect(result.valid).toBe(false);
  });
});
