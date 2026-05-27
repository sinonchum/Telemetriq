import React, { useRef, useEffect, useCallback } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { useTelemetriq } from '../../hooks/useTelemetriq';

export type ChannelConfig = {
  key: string;
  label?: string;
  color?: string;
  axis?: 'left' | 'right';
};

export type MetricChartProps = {
  channels: ChannelConfig[];
  height?: number;
  syncCursor?: boolean;
  showLegend?: boolean;
};

export function MetricChart({ channels, height = 240, showLegend = true }: MetricChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);
  const engine = useTelemetriq();

  const buildData = useCallback((): uPlot.AlignedData => {
    const duration = engine.getDuration();
    const step = Math.max(50, duration / 200);
    const timestamps: number[] = [];
    const channelData: number[][] = channels.map(() => []);
    for (let t = 0; t <= duration; t += step) {
      timestamps.push(t);
      channels.forEach((ch, i) => {
        const val = engine.getValueAt(ch.key, t);
        channelData[i].push(typeof val === 'number' ? val : NaN);
      });
    }
    return [new Float64Array(timestamps), ...channelData.map(d => new Float64Array(d))];
  }, [engine, channels]);

  useEffect(() => {
    if (!containerRef.current) return;
    const opts: uPlot.Options = {
      width: containerRef.current.clientWidth,
      height,
      axes: [
        { stroke: '#888', grid: { stroke: '#333' } },
        { stroke: '#888', grid: { show: false } },
      ],
      series: [
        {},
        ...channels.map((ch) => ({
          label: ch.label || ch.key,
          stroke: ch.color || '#06b6d4',
          width: 2,
        })),
      ],
      cursor: { x: true, y: false },
    };
    const data = buildData();
    const chart = new uPlot(opts, data, containerRef.current);
    chartRef.current = chart;

    // Update chart cursor on time changes to track playback position
    const unsub = engine.subscribeTime((time: number) => {
      if (chartRef.current) {
        chartRef.current.setCursor({ left: chartRef.current.valToPos(time, 'x'), top: 0 });
      }
    });

    return () => { unsub(); chart.destroy(); };
  }, [buildData, height, engine, channels]);

  return (
    <div className="tq-metric-chart">
      <div ref={containerRef} />
      {showLegend && (
        <div className="tq-chart-legend">
          {channels.map((ch) => (
            <span key={ch.key} className="tq-legend-item">
              <span className="tq-legend-dot" style={{ background: ch.color || '#06b6d4' }} />
              {ch.label || ch.key}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
