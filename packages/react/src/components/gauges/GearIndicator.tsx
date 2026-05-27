import React from 'react';
import { useChannelValue } from '../../hooks/useChannelValue';

export type GearIndicatorProps = {
  channel: string;
};

export function GearIndicator({ channel }: GearIndicatorProps) {
  const value = useChannelValue(channel);
  const gear = typeof value === 'number' ? value : typeof value === 'string' ? value : '--';
  return (
    <div className="tq-gauge tq-gear-indicator">
      <div className="tq-gauge-label">GEAR</div>
      <div className="tq-gear-value">{gear}</div>
    </div>
  );
}
