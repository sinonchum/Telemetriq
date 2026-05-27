import { describe, it, expect } from 'vitest';
import { convertCSVToTelemetriq } from '../converter';

describe('convertCSVToTelemetriq', () => {
  const csv = 'timestamp_ms,speed_kph,pos_x,pos_y\n0,0,0,0\n20,12,0.5,0.1\n40,25,1.2,0.3';
  const mapping = {
    time: { column: 'timestamp_ms', unit: 'ms' as const },
    position: { x: 'pos_x', y: 'pos_y' },
    channels: { speed: { column: 'speed_kph', unit: 'km/h' } },
  };

  it('converts CSV to dataset', () => {
    const dataset = convertCSVToTelemetriq(csv, mapping);
    expect(dataset.version).toBe('0.1.0');
    expect(dataset.samples).toHaveLength(3);
    expect(dataset.channels).toHaveLength(1);
    expect(dataset.channels[0].key).toBe('speed');
  });

  it('parses position data', () => {
    const dataset = convertCSVToTelemetriq(csv, mapping);
    expect(dataset.samples[1].position).toEqual({ x: 0.5, y: 0.1 });
  });

  it('sets time range', () => {
    const dataset = convertCSVToTelemetriq(csv, mapping);
    expect(dataset.time.start).toBe(0);
    expect(dataset.time.end).toBe(40);
  });
});
