import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TelemetriqProvider } from '../provider/TelemetriqProvider';
import { useTelemetriq } from '../hooks/useTelemetriq';
import { usePlaybackControls } from '../hooks/usePlaybackControls';
import type { TelemetriqDataset } from '@telemetriq/core';

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 10000 },
  channels: [{ key: 'speed', type: 'number' }],
  samples: [
    { t: 0, values: { speed: 0 } },
    { t: 5000, values: { speed: 100 } },
  ],
};

function Consumer() {
  const engine = useTelemetriq();
  return <div data-testid="time">{engine.getCurrentTime()}</div>;
}

describe('TelemetriqProvider', () => {
  it('provides engine to children', () => {
    render(
      <TelemetriqProvider dataset={dataset}>
        <Consumer />
      </TelemetriqProvider>,
    );
    expect(screen.getByTestId('time').textContent).toBe('0');
  });

  it('throws when useTelemetriq used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow();
    spy.mockRestore();
  });
});

describe('usePlaybackControls', () => {
  it('exposes play, pause, seek, setRate', () => {
    let controls: ReturnType<typeof usePlaybackControls>;
    function ControlsConsumer() {
      controls = usePlaybackControls();
      return null;
    }

    render(
      <TelemetriqProvider dataset={dataset}>
        <ControlsConsumer />
      </TelemetriqProvider>,
    );

    expect(typeof controls!.play).toBe('function');
    expect(typeof controls!.pause).toBe('function');
    expect(typeof controls!.seek).toBe('function');
    expect(typeof controls!.setRate).toBe('function');
  });
});
