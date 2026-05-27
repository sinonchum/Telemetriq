import { describe, it, expect } from 'vitest';
import { TimeIndex } from '../time/TimeIndex';

describe('TimeIndex', () => {
  const timestamps = new Float64Array([0, 100, 200, 300, 400, 500]);
  const idx = new TimeIndex(timestamps);

  it('findNearestIndex returns closest', () => {
    expect(idx.findNearestIndex(150)).toBe(1);
    expect(idx.findNearestIndex(160)).toBe(2);
  });

  it('findFloorIndex returns <= value', () => {
    expect(idx.findFloorIndex(250)).toBe(2);
    expect(idx.findFloorIndex(200)).toBe(2);
  });

  it('findCeilIndex returns >= value', () => {
    expect(idx.findCeilIndex(250)).toBe(3);
    expect(idx.findCeilIndex(200)).toBe(2);
  });

  it('findRange returns [start, end] indices', () => {
    const [start, end] = idx.findRange(150, 350);
    expect(start).toBe(2);
    expect(end).toBe(3);
  });

  it('handles single element', () => {
    const single = new TimeIndex(new Float64Array([50]));
    expect(single.findNearestIndex(50)).toBe(0);
    expect(single.findFloorIndex(50)).toBe(0);
  });

  it('throws on empty array', () => {
    expect(() => new TimeIndex(new Float64Array(0))).toThrow();
  });

  it('handles boundary values', () => {
    expect(idx.findNearestIndex(0)).toBe(0);
    expect(idx.findNearestIndex(500)).toBe(5);
    expect(idx.findNearestIndex(-100)).toBe(0);
    expect(idx.findNearestIndex(600)).toBe(5);
  });
});
