import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTelemetriqEngine } from '../createTelemetriqEngine';
import type { TelemetriqDataset } from '../types';

const g = globalThis as unknown as Record<string, (...args: unknown[]) => unknown>;

beforeEach(() => {
  vi.useFakeTimers();
  let id = 0;
  g['requestAnimationFrame'] = () => ++id;
  g['cancelAnimationFrame'] = () => {};
});

afterEach(() => {
  vi.useRealTimers();
});

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 10000 },
  channels: [{ key: 'speed', type: 'number', interpolation: 'linear' }],
  samples: [
    { t: 0, values: { speed: 0 } },
    { t: 5000, values: { speed: 100 } },
    { t: 10000, values: { speed: 200 } },
  ],
};

describe('createTelemetriqEngine', () => {
  it('creates engine from valid dataset', () => {
    const engine = createTelemetriqEngine(dataset);
    expect(engine).toBeDefined();
    expect(engine.getCurrentTime()).toBe(0);
    engine.destroy();
  });

  it('throws on invalid dataset', () => {
    expect(() => createTelemetriqEngine({ ...dataset, samples: [] })).toThrow();
  });

  it('getValueAt works', () => {
    const engine = createTelemetriqEngine(dataset);
    expect(engine.getValueAt('speed', 2500)).toBe(50);
    engine.destroy();
  });

  it('seek works', () => {
    const engine = createTelemetriqEngine(dataset);
    engine.seek(5000);
    expect(engine.getCurrentTime()).toBe(5000);
    engine.destroy();
  });

  it('respects options', () => {
    const engine = createTelemetriqEngine(dataset, { initialTime: 1000, playbackRate: 2, loop: true });
    expect(engine.getCurrentTime()).toBe(1000);
    engine.destroy();
  });
});
