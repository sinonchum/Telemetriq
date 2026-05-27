export type DecimatedPoint = { t: number; value: number };

/** Largest-Triangle-Three-Buckets downsampling. Preserves visual shape. */
export function decimateLTTB(
  timestamps: Float64Array,
  values: Float64Array,
  targetCount: number
): DecimatedPoint[] {
  const n = timestamps.length;
  if (targetCount >= n || targetCount < 3) {
    return Array.from({ length: n }, (_, i) => ({ t: timestamps[i], value: values[i] }));
  }

  const result: DecimatedPoint[] = [];
  result.push({ t: timestamps[0], value: values[0] });
  const bucketSize = (n - 2) / (targetCount - 2);
  let prevIndex = 0;

  for (let i = 1; i < targetCount - 1; i++) {
    const bucketStart = Math.floor((i - 1) * bucketSize) + 1;
    const bucketEnd = Math.min(Math.floor(i * bucketSize) + 1, n - 1);
    const nextBucketStart = Math.floor(i * bucketSize) + 1;
    const nextBucketEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, n - 1);

    let avgT = 0, avgV = 0, count = 0;
    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      avgT += timestamps[j]; avgV += values[j]; count++;
    }
    avgT /= count; avgV /= count;

    const pPrev = { t: timestamps[prevIndex], value: values[prevIndex] };
    let maxArea = -1;
    let maxIndex = bucketStart;

    for (let j = bucketStart; j < bucketEnd; j++) {
      const area = Math.abs(
        (pPrev.t - avgT) * (values[j] - pPrev.value) -
        (pPrev.t - timestamps[j]) * (avgV - pPrev.value)
      );
      if (area > maxArea) { maxArea = area; maxIndex = j; }
    }

    result.push({ t: timestamps[maxIndex], value: values[maxIndex] });
    prevIndex = maxIndex;
  }

  result.push({ t: timestamps[n - 1], value: values[n - 1] });
  return result;
}
