import React, { useRef, useEffect, useCallback } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { useMultiEngine } from '../../hooks/useMultiEngine';

export type ComparisonChartProps = {
  channelKey: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
};

const DEFAULT_COLORS = ['#06b6d4', '#ef4444', '#22c55e', '#facc15', '#8b5cf6'];

export function ComparisonChart({ channelKey, height = 240, colors = DEFAULT_COLORS, showLegend = true }: ComparisonChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);
  const multi = useMultiEngine();

  const buildData = useCallback((): uPlot.AlignedData => {
    const duration = Math.max(...multi.sessions.map(() => 10000));
    const step = 100;
    const timestamps: number[] = [];
    const sessionData: number[][] = multi.sessions.map(() => []);

    for (let t = 0; t <= duration; t += step) {
      timestamps.push(t);
      multi.sessions.forEach((session, i) => {
        const val = session.engine.getValueAt(channelKey, t);
        sessionData[i].push(typeof val === 'number' ? val : NaN);
      });
    }

    return [new Float64Array(timestamps), ...sessionData.map(d => new Float64Array(d))];
  }, [multi, channelKey]);

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
        ...multi.sessions.map((session, i) => ({
          label: session.label,
          stroke: colors[i % colors.length],
          width: 2,
        })),
      ],
      cursor: { x: true, y: false },
    };
    const data = buildData();
    const chart = new uPlot(opts, data, containerRef.current);
    chartRef.current = chart;
    const unsub = multi.subscribeTime(() => {});
    return () => { unsub(); chart.destroy(); };
  }, [buildData, height, multi, colors]);

  return (
    <div className="tq-comparison-chart">
      <div ref={containerRef} />
      {showLegend && (
        <div className="tq-chart-legend">
          {multi.sessions.map((session, i) => (
            <span key={session.id} className="tq-legend-item">
              <span className="tq-legend-dot" style={{ background: colors[i % colors.length] }} />
              {session.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
