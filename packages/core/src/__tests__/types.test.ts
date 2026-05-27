import { describe, it, expect } from 'vitest';
import type { TelemetriqDataset } from '../types';

describe('Telemetriq types', () => {
  it('should allow creating a valid dataset', () => {
    const dataset: TelemetriqDataset = {
      version: '0.1.0',
      time: { unit: 'ms', start: 0, end: 10000 },
      channels: [{ key: 'speed', type: 'number', unit: 'km/h' }],
      samples: [
        { t: 0, values: { speed: 0 } },
        { t: 100, values: { speed: 50 } },
      ],
    };
    expect(dataset.version).toBe('0.1.0');
    expect(dataset.channels).toHaveLength(1);
    expect(dataset.samples).toHaveLength(2);
  });

  it('should support optional fields', () => {
    const dataset: TelemetriqDataset = {
      version: '0.1.0',
      metadata: { id: 'test', name: 'Test Dataset' },
      time: { unit: 'ms', start: 0, end: 1000, sampleRateHz: 50 },
      coordinateSystem: { type: 'cartesian', axes: { x: 'meters', y: 'meters' } },
      channels: [{ key: 'speed', type: 'number' }],
      samples: [{ t: 0, values: { speed: 0 } }],
      events: [{ t: 500, type: 'marker', label: 'Test Event' }],
    };
    expect(dataset.metadata?.id).toBe('test');
    expect(dataset.coordinateSystem?.type).toBe('cartesian');
    expect(dataset.events).toHaveLength(1);
  });
});
