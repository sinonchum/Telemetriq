import React from 'react';
import { TelemetriqProvider, type TelemetriqProviderProps } from '../provider/TelemetriqProvider';
import { MetricChart } from '../components/MetricChart/MetricChart';
import { PathRenderer } from '../components/PathRenderer/PathRenderer';
import { PlaybackControls } from '../components/PlaybackControls/PlaybackControls';
import { NumericGauge } from '../components/gauges/NumericGauge';
import { LinearGauge } from '../components/gauges/LinearGauge';
import { GForceCircle } from '../components/gauges/GForceCircle';

export type RacingDashboardProps = {
  dataset: TelemetriqProviderProps['dataset'];
  options?: TelemetriqProviderProps['options'];
};

export function RacingDashboard({ dataset, options }: RacingDashboardProps) {
  return (
    <TelemetriqProvider dataset={dataset} options={options}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16, background: '#0a0a1a', minHeight: '100vh' }}>
        <h1 style={{ color: '#e0e0e0', fontFamily: 'monospace', fontSize: 20, marginBottom: 16 }}>TELEMETRIQ — Racing Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <PathRenderer height={350} colorBy={{ channel: 'speed', scale: { type: 'linear', domain: [0, 300], range: ['#22c55e', '#facc15', '#ef4444'] } }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <NumericGauge channel="speed" unit="km/h" label="Speed" />
            <NumericGauge channel="rpm" unit="rpm" label="RPM" precision={0} />
            <LinearGauge channel="throttle" label="Throttle" color="#22c55e" />
            <LinearGauge channel="brake" label="Brake" color="#ef4444" />
            <div style={{ gridColumn: 'span 2' }}><GForceCircle xChannel="gLat" yChannel="gLong" size={100} /></div>
          </div>
        </div>
        <MetricChart height={180} channels={[{ key: 'speed', color: '#ef4444', axis: 'left' }, { key: 'rpm', color: '#3b82f6', axis: 'right' }]} showLegend />
        <MetricChart height={160} channels={[{ key: 'throttle', color: '#22c55e' }, { key: 'brake', color: '#ef4444' }]} showLegend />
        <div style={{ marginTop: 12 }}><PlaybackControls showRateControl showLoopToggle showTimeDisplay /></div>
      </div>
    </TelemetriqProvider>
  );
}
