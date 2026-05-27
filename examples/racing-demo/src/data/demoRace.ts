import type { TelemetriqDataset } from '@telemetriq/core';

function generateSineWave(t: number, freq: number, amp: number, offset: number): number {
  return offset + amp * Math.sin(2 * Math.PI * freq * t / 1000);
}

export function createDemoRaceDataset(): TelemetriqDataset {
  const duration = 60000; // 60 seconds
  const sampleRate = 50; // 50Hz
  const step = 1000 / sampleRate;
  const samples: TelemetriqDataset['samples'] = [];

  for (let t = 0; t <= duration; t += step) {
    const lapProgress = (t % 20000) / 20000;
    const speed = 80 + 120 * Math.sin(lapProgress * Math.PI) + (Math.random() - 0.5) * 10;
    const throttle = Math.min(100, Math.max(0, speed / 2.5 + (Math.random() - 0.5) * 15));
    const brake = lapProgress > 0.4 && lapProgress < 0.5 ? 60 + Math.random() * 30 : Math.random() * 5;
    const rpm = 3000 + speed * 40 + (Math.random() - 0.5) * 200;
    const steeringAngle = 15 * Math.sin(lapProgress * 2 * Math.PI) + (Math.random() - 0.5) * 3;
    const gLat = steeringAngle * speed / 500;
    const gLong = brake > 10 ? -brake / 40 : throttle / 80;
    const angle = lapProgress * 2 * Math.PI;
    const radius = 200;
    const x = radius * Math.cos(angle) + (Math.random() - 0.5) * 2;
    const y = radius * Math.sin(angle) + (Math.random() - 0.5) * 2;

    samples.push({
      t,
      position: { x, y },
      values: { speed, throttle, brake, rpm, steeringAngle, gLat, gLong },
    });
  }

  return {
    version: '0.1.0',
    metadata: { id: 'demo-race-001', name: 'Demo Race Session', domain: 'racing', source: 'synthetic' },
    time: { unit: 'ms', start: 0, end: duration, sampleRateHz: sampleRate },
    coordinateSystem: { type: 'cartesian', axes: { x: 'meters', y: 'meters' } },
    channels: [
      { key: 'speed', label: 'Speed', unit: 'km/h', type: 'number', interpolation: 'linear', range: { min: 0, max: 320 } },
      { key: 'throttle', label: 'Throttle', unit: '%', type: 'number', interpolation: 'linear', range: { min: 0, max: 100 } },
      { key: 'brake', label: 'Brake', unit: '%', type: 'number', interpolation: 'linear', range: { min: 0, max: 100 } },
      { key: 'rpm', label: 'RPM', unit: 'rpm', type: 'number', interpolation: 'linear', range: { min: 0, max: 10000 } },
      { key: 'steeringAngle', label: 'Steering', unit: 'deg', type: 'number', interpolation: 'linear' },
      { key: 'gLat', label: 'Lateral G', unit: 'G', type: 'number', interpolation: 'linear' },
      { key: 'gLong', label: 'Longitudinal G', unit: 'G', type: 'number', interpolation: 'linear' },
    ],
    samples,
    events: [
      { t: 0, type: 'marker', label: 'Start' },
      { t: 20000, type: 'marker', label: 'Lap 1' },
      { t: 40000, type: 'marker', label: 'Lap 2' },
    ],
  };
}
