export class TimeIndex {
  private timestamps: Float64Array;

  constructor(timestamps: Float64Array) {
    if (timestamps.length === 0) {
      throw new Error('TimeIndex requires non-empty timestamps');
    }
    this.timestamps = timestamps;
  }

  findNearestIndex(t: number): number {
    const floor = this.findFloorIndex(t);
    const ceil = Math.min(floor + 1, this.timestamps.length - 1);
    if (floor === ceil) return floor;
    return Math.abs(t - this.timestamps[floor]) <= Math.abs(t - this.timestamps[ceil])
      ? floor
      : ceil;
  }

  findFloorIndex(t: number): number {
    let lo = 0;
    let hi = this.timestamps.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.timestamps[mid] <= t) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    return lo;
  }

  findCeilIndex(t: number): number {
    let lo = 0;
    let hi = this.timestamps.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.timestamps[mid] < t) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  findRange(start: number, end: number): [number, number] {
    return [this.findCeilIndex(start), this.findFloorIndex(end)];
  }
}
