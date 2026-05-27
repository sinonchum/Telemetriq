import type { TelemetriqDataset } from '@telemetriq/core';

export function generateLargeDataset(sampleCount: number): TelemetriqDataset {
  const samples = [];
  for (let i = 0; i < sampleCount; i++) {
    const t = i * 20; // 50Hz
    samples.push({
      t,
      position: { x: Math.cos(t / 1000) * 100, y: Math.sin(t / 1000) * 100 },
      values: {
        speed: 100 + 50 * Math.sin(t / 500),
        throttle: 50 + 30 * Math.cos(t / 300),
        rpm: 4000 + 2000 * Math.sin(t / 400),
      },
    });
  }
  return {
    version: '0.1.0',
    time: { unit: 'ms', start: 0, end: (sampleCount - 1) * 20 },
    channels: [
      { key: 'speed', type: 'number', interpolation: 'linear' },
      { key: 'throttle', type: 'number', interpolation: 'linear' },
      { key: 'rpm', type: 'number', interpolation: 'linear' },
    ],
    samples,
  };
}
