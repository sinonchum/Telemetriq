import React from 'react';
import { useChannelValue } from '../../hooks/useChannelValue';
import './gauges.css';

export type SteeringGaugeProps = {
  channel: string;
  size?: number;
  maxAngle?: number;
};

export function SteeringGauge({ channel, size = 100, maxAngle = 90 }: SteeringGaugeProps) {
  const value = useChannelValue(channel);
  const angle = typeof value === 'number' ? value : 0;
  const clampedAngle = Math.max(-maxAngle, Math.min(maxAngle, angle));
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  return (
    <div className="tq-gauge tq-steering-gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#333" strokeWidth={3} />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#444" strokeWidth={2} />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#444" strokeWidth={2} />
        <g transform={`rotate(${clampedAngle}, ${cx}, ${cy})`}>
          <line x1={cx} y1={cy - r + 5} x2={cx} y2={cy - r + 15} stroke="#06b6d4" strokeWidth={3} strokeLinecap="round" />
        </g>
      </svg>
      <div className="tq-steering-label">{angle.toFixed(1)}deg</div>
    </div>
  );
}
