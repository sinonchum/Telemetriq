import React from 'react';
import { TelemetriqProvider, type TelemetriqProviderProps } from '../provider/TelemetriqProvider';
import { MetricChart } from '../components/MetricChart/MetricChart';
import { PathRenderer } from '../components/PathRenderer/PathRenderer';
import { PlaybackControls } from '../components/PlaybackControls/PlaybackControls';
import { NumericGauge } from '../components/gauges/NumericGauge';
import { LinearGauge } from '../components/gauges/LinearGauge';

export type DroneDashboardProps = {
  dataset: TelemetriqProviderProps['dataset'];
  options?: TelemetriqProviderProps['options'];
};

export function DroneDashboard({ dataset, options }: DroneDashboardProps) {
  return (
    <TelemetriqProvider dataset={dataset} options={options}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16, background: '#0a0a1a', minHeight: '100vh' }}>
        <h1 style={{ color: '#e0e0e0', fontFamily: 'monospace', fontSize: 20, marginBottom: 16 }}>TELEMETRIQ — Drone Flight Replay</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <PathRenderer height={350} position={{ x: 'position.lon', y: 'position.lat' }} colorBy={{ channel: 'altitude', scale: { type: 'linear', domain: [0, 150], range: ['#1e3a5f', '#06b6d4', '#22c55e'] } }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <NumericGauge channel="altitude" unit="m" label="Altitude" />
            <NumericGauge channel="speed" unit="m/s" label="Speed" />
            <LinearGauge channel="battery" label="Battery" color="#22c55e" />
            <LinearGauge channel="signalStrength" label="Signal" color="#06b6d4" />
            <NumericGauge channel="heading" unit="deg" label="Heading" precision={0} />
            <NumericGauge channel="verticalSpeed" unit="m/s" label="V/S" />
          </div>
        </div>
        <MetricChart height={180} channels={[{ key: 'altitude', color: '#06b6d4' }, { key: 'verticalSpeed', color: '#facc15' }]} showLegend />
        <MetricChart height={160} channels={[{ key: 'battery', color: '#22c55e' }, { key: 'signalStrength', color: '#3b82f6' }]} showLegend />
        <div style={{ marginTop: 12 }}><PlaybackControls showRateControl showLoopToggle showTimeDisplay /></div>
      </div>
    </TelemetriqProvider>
  );
}
