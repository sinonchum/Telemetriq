import type { TelemetriqDataset } from '@telemetriq/core';

export function createDemoDroneDataset(): TelemetriqDataset {
  const duration = 90000; // 90 seconds
  const sampleRate = 20; // 20Hz
  const step = 1000 / sampleRate;
  const samples: TelemetriqDataset['samples'] = [];

  for (let t = 0; t <= duration; t += step) {
    const phase = t / duration;
    const altitude = phase < 0.1 ? phase * 10 * 120 : phase < 0.9 ? 120 + 20 * Math.sin(phase * 4 * Math.PI) : (1 - phase) * 10 * 120;
    const speed = 5 + 10 * Math.sin(phase * 2 * Math.PI) + (Math.random() - 0.5) * 2;
    const battery = Math.max(0, 100 - phase * 80 - (Math.random() * 2));
    const heading = (phase * 720) % 360;
    const verticalSpeed = phase < 0.1 ? 12 : phase > 0.9 ? -12 : 2 * Math.cos(phase * 4 * Math.PI);
    const signalStrength = Math.max(40, 100 - phase * 30 + (Math.random() - 0.5) * 10);
    const lat = 48.8566 + 0.001 * Math.cos(phase * 2 * Math.PI);
    const lon = 2.3522 + 0.001 * Math.sin(phase * 2 * Math.PI);
    const alt = altitude;

    samples.push({
      t,
      position: { lat, lon, alt },
      values: { speed, altitude, battery, heading, verticalSpeed, signalStrength },
    });
  }

  return {
    version: '0.1.0',
    metadata: { id: 'demo-drone-001', name: 'Demo Drone Flight', domain: 'drone', source: 'synthetic' },
    time: { unit: 'ms', start: 0, end: duration, sampleRateHz: sampleRate },
    coordinateSystem: { type: 'geographic', axes: { lat: 'degrees', lon: 'degrees', alt: 'meters' } },
    channels: [
      { key: 'speed', label: 'Speed', unit: 'm/s', type: 'number', interpolation: 'linear' },
      { key: 'altitude', label: 'Altitude', unit: 'm', type: 'number', interpolation: 'linear' },
      { key: 'battery', label: 'Battery', unit: '%', type: 'number', interpolation: 'linear', range: { min: 0, max: 100 } },
      { key: 'heading', label: 'Heading', unit: 'deg', type: 'number', interpolation: 'linear' },
      { key: 'verticalSpeed', label: 'V/S', unit: 'm/s', type: 'number', interpolation: 'linear' },
      { key: 'signalStrength', label: 'Signal', unit: '%', type: 'number', interpolation: 'linear', range: { min: 0, max: 100 } },
    ],
    samples,
    events: [
      { t: 0, type: 'marker', label: 'Takeoff' },
      { t: 45000, type: 'marker', label: 'Waypoint' },
      { t: 90000, type: 'marker', label: 'Landing' },
    ],
  };
}
