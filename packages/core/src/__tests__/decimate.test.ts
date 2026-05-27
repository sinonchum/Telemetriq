import { describe, it, expect } from 'vitest';
import { decimateLTTB } from '../transforms/decimate';

describe('decimateLTTB', () => {
  it('returns all points when target >= length', () => {
    const ts = new Float64Array([0, 1, 2, 3, 4]);
    const vals = new Float64Array([0, 1, 0, 1, 0]);
    expect(decimateLTTB(ts, vals, 10)).toHaveLength(5);
  });

  it('reduces to target count', () => {
    const n = 1000;
    const ts = new Float64Array(n);
    const vals = new Float64Array(n);
    for (let i = 0; i < n; i++) { ts[i] = i; vals[i] = Math.sin(i / 10); }
    const result = decimateLTTB(ts, vals, 100);
    expect(result.length).toBe(100);
  });

  it('preserves first and last points', () => {
    const ts = new Float64Array([0, 10, 20, 30, 40]);
    const vals = new Float64Array([5, 15, 25, 35, 45]);
    const result = decimateLTTB(ts, vals, 3);
    expect(result[0].t).toBe(0);
    expect(result[0].value).toBe(5);
    expect(result[result.length - 1].t).toBe(40);
    expect(result[result.length - 1].value).toBe(45);
  });

  it('handles target < 3', () => {
    const ts = new Float64Array([0, 1, 2]);
    const vals = new Float64Array([10, 20, 30]);
    expect(decimateLTTB(ts, vals, 2)).toHaveLength(3);
  });
});
