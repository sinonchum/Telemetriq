import React from 'react';
import { useChannelValue } from '../../hooks/useChannelValue';

export type GForceCircleProps = {
  xChannel: string;
  yChannel: string;
  maxG?: number;
  size?: number;
};

export function GForceCircle({ xChannel, yChannel, maxG = 3, size = 120 }: GForceCircleProps) {
  const xVal = useChannelValue(xChannel);
  const yVal = useChannelValue(yChannel);
  const x = typeof xVal === 'number' ? xVal : 0;
  const y = typeof yVal === 'number' ? yVal : 0;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const dotX = cx + (x / maxG) * r;
  const dotY = cy - (y / maxG) * r; // Y inverted

  return (
    <div className="tq-gauge tq-gforce-circle">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#333" strokeWidth={1} />
        {/* Center cross */}
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#222" strokeWidth={1} />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#222" strokeWidth={1} />
        {/* 1G reference circle */}
        <circle cx={cx} cy={cy} r={r / maxG} fill="none" stroke="#222" strokeWidth={1} />
        {/* G-force dot */}
        <circle cx={dotX} cy={dotY} r={5} fill="#06b6d4" />
      </svg>
      <div className="tq-gforce-label">
        {x.toFixed(1)}G / {y.toFixed(1)}G
      </div>
    </div>
  );
}
