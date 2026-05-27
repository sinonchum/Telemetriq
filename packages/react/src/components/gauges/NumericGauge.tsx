import React from 'react';
import { useChannelValue } from '../../hooks/useChannelValue';

export type NumericGaugeProps = {
  channel: string;
  unit?: string;
  label?: string;
  precision?: number;
};

export function NumericGauge({ channel, unit, label, precision = 1 }: NumericGaugeProps) {
  const value = useChannelValue(channel);
  const display = typeof value === 'number' ? value.toFixed(precision) : String(value ?? '--');

  return (
    <div className="tq-gauge tq-numeric-gauge">
      {label && <div className="tq-gauge-label">{label}</div>}
      <div className="tq-gauge-value">
        {display}
        {unit && <span className="tq-gauge-unit"> {unit}</span>}
      </div>
    </div>
  );
}
