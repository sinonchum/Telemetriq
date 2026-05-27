import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMultiEngine } from '../multi/createMultiEngine';
import type { TelemetriqDataset } from '../types';

const g = globalThis as unknown as Record<string, (...args: unknown[]) => unknown>;
beforeEach(() => {
  vi.useFakeTimers();
  let id = 0;
  g['requestAnimationFrame'] = () => ++id;
  g['cancelAnimationFrame'] = () => {};
});
afterEach(() => { vi.useRealTimers(); });

const datasetA: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 10000 },
  channels: [{ key: 'speed', type: 'number', interpolation: 'linear' }],
  samples: [{ t: 0, values: { speed: 0 } }, { t: 10000, values: { speed: 200 } }],
};

const datasetB: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 8000 },
  channels: [{ key: 'speed', type: 'number', interpolation: 'linear' }],
  samples: [{ t: 0, values: { speed: 10 } }, { t: 8000, values: { speed: 180 } }],
};

describe('createMultiEngine', () => {
  it('creates multi engine with sessions', () => {
    const multi = createMultiEngine([
      { id: 'a', label: 'Session A', dataset: datasetA },
      { id: 'b', label: 'Session B', dataset: datasetB },
    ]);
    expect(multi.sessions).toHaveLength(2);
    expect(multi.sessions[0].label).toBe('Session A');
    multi.destroy();
  });

  it('syncs child engines on seek', () => {
    const multi = createMultiEngine([
      { id: 'a', label: 'A', dataset: datasetA },
      { id: 'b', label: 'B', dataset: datasetB },
    ]);
    multi.seek(4000);
    expect(multi.sessions[0].engine.getCurrentTime()).toBe(4000);
    expect(multi.sessions[1].engine.getCurrentTime()).toBe(4000);
    multi.destroy();
  });

  it('getValueAt works per session', () => {
    const multi = createMultiEngine([
      { id: 'a', label: 'A', dataset: datasetA },
      { id: 'b', label: 'B', dataset: datasetB },
    ]);
    expect(multi.sessions[0].engine.getValueAt('speed', 5000)).toBe(100);
    expect(multi.sessions[1].engine.getValueAt('speed', 4000)).toBe(95);
    multi.destroy();
  });

  it('uses global time range', () => {
    const multi = createMultiEngine([
      { id: 'a', label: 'A', dataset: datasetA },
      { id: 'b', label: 'B', dataset: datasetB },
    ]);
    multi.seek(9000);
    expect(multi.getCurrentTime()).toBe(9000);
    multi.destroy();
  });
});
