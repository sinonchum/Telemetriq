import React from 'react';
import {
  TelemetriqProvider,
  MetricChart,
  PathRenderer,
  PlaybackControls,
  NumericGauge,
  LinearGauge,
  GForceCircle,
} from '@telemetriq/react';
import { createDemoRaceDataset } from './data/demoRace';

const dataset = createDemoRaceDataset();

export default function App() {
  return (
    <TelemetriqProvider dataset={dataset}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16, background: '#0a0a1a', minHeight: '100vh' }}>
        <h1 style={{ color: '#e0e0e0', fontFamily: 'monospace', fontSize: 20, marginBottom: 16 }}>
          TELEMETRIQ — Racing Demo
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <PathRenderer height={350} colorBy={{ channel: 'speed', scale: { type: 'linear', domain: [0, 300], range: ['#22c55e', '#facc15', '#ef4444'] } }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <NumericGauge channel="speed" unit="km/h" label="Speed" />
            <NumericGauge channel="rpm" unit="rpm" label="RPM" precision={0} />
            <LinearGauge channel="throttle" label="Throttle" color="#22c55e" />
            <LinearGauge channel="brake" label="Brake" color="#ef4444" />
            <div style={{ gridColumn: 'span 2' }}>
              <GForceCircle xChannel="gLat" yChannel="gLong" size={100} />
            </div>
          </div>
        </div>

        <MetricChart height={180} channels={[{ key: 'speed', color: '#ef4444', axis: 'left' }, { key: 'rpm', color: '#3b82f6', axis: 'right' }]} showLegend />
        <MetricChart height={160} channels={[{ key: 'throttle', color: '#22c55e' }, { key: 'brake', color: '#ef4444' }]} showLegend />

        <div style={{ marginTop: 12 }}>
          <PlaybackControls showRateControl showLoopToggle showTimeDisplay />
        </div>
      </div>
    </TelemetriqProvider>
  );
}
