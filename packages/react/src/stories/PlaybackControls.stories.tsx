import type { Meta, StoryObj } from '@storybook/react';
import { TelemetriqProvider } from '../provider/TelemetriqProvider';
import { PlaybackControls } from '../components/PlaybackControls/PlaybackControls';
import type { TelemetriqDataset } from '@telemetriq/core';

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 10000 },
  channels: [{ key: 'speed', type: 'number' }],
  samples: [{ t: 0, values: { speed: 0 } }, { t: 5000, values: { speed: 100 } }],
};

const meta: Meta<typeof PlaybackControls> = {
  title: 'Components/PlaybackControls',
  component: PlaybackControls,
  decorators: [(Story) => (<TelemetriqProvider dataset={dataset}><Story /></TelemetriqProvider>)],
};

export default meta;
type Story = StoryObj<typeof PlaybackControls>;

export const Default: Story = {};
export const NoRateControl: Story = { args: { showRateControl: false } };
export const Compact: Story = { args: { showRateControl: false, showLoopToggle: false } };
