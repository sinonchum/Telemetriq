import React from 'react';
import { useChannelValue } from '../../hooks/useChannelValue';
import './gauges.css';

export type LinearGaugeProps = {
  channel: string;
  label?: string;
  min?: number;
  max?: number;
  color?: string;
};

export function LinearGauge({ channel, label, min = 0, max = 100, color = '#06b6d4' }: LinearGaugeProps) {
  const value = useChannelValue(channel);
  const numVal = typeof value === 'number' ? value : 0;
  const pct = Math.max(0, Math.min(100, ((numVal - min) / (max - min)) * 100));

  return (
    <div className="tq-gauge tq-linear-gauge">
      {label && <div className="tq-gauge-label">{label}</div>}
      <div className="tq-linear-track">
        <div className="tq-linear-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="tq-linear-value">{typeof value === 'number' ? value.toFixed(0) : '--'}</div>
    </div>
  );
}
