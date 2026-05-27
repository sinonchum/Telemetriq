import type { Meta, StoryObj } from '@storybook/react';
import { TelemetriqProvider } from '../provider/TelemetriqProvider';
import { NumericGauge } from '../components/gauges/NumericGauge';
import { LinearGauge } from '../components/gauges/LinearGauge';
import { GForceCircle } from '../components/gauges/GForceCircle';
import type { TelemetriqDataset } from '@telemetriq/core';

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 10000 },
  channels: [
    { key: 'speed', type: 'number', unit: 'km/h' },
    { key: 'throttle', type: 'number', unit: '%' },
    { key: 'gLat', type: 'number' },
    { key: 'gLong', type: 'number' },
  ],
  samples: [{ t: 0, values: { speed: 120, throttle: 45, gLat: 0.5, gLong: -0.2 } }],
};

export default {
  title: 'Components/Gauges',
  decorators: [(Story: React.FC) => (<TelemetriqProvider dataset={dataset}><Story /></TelemetriqProvider>)],
} as Meta;

export const Numeric: StoryObj<typeof NumericGauge> = { render: () => <NumericGauge channel="speed" unit="km/h" label="Speed" /> };
export const Linear: StoryObj<typeof LinearGauge> = { render: () => <LinearGauge channel="throttle" label="Throttle" /> };
export const GForce: StoryObj<typeof GForceCircle> = { render: () => <GForceCircle xChannel="gLat" yChannel="gLong" /> };
