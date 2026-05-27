import React, { useRef, useEffect, useCallback } from 'react';
import { useTelemetriq } from '../../hooks/useTelemetriq';

export type ColorScale = {
  type: 'linear';
  domain: [number, number];
  range: string[];
};

export type PathRendererProps = {
  height?: number;
  position?: { x: string; y: string };
  colorBy?: { channel: string; scale: ColorScale };
  marker?: { visible?: boolean; radius?: number; color?: string };
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function colorFromScale(value: number, scale: ColorScale): string {
  const [min, max] = scale.domain;
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const colors = scale.range;
  if (colors.length === 1) return colors[0];
  const segment = t * (colors.length - 1);
  const i = Math.min(Math.floor(segment), colors.length - 2);
  const localT = segment - i;
  // Simple hex color lerp
  const c1 = colors[i];
  const c2 = colors[i + 1];
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(lerp(r1, r2, localT)), g = Math.round(lerp(g1, g2, localT)), b = Math.round(lerp(b1, b2, localT));
  return `rgb(${r},${g},${b})`;
}

export function PathRenderer({
  height = 400,
  position = { x: 'position.x', y: 'position.y' },
  colorBy,
  marker = { visible: true, radius: 6, color: '#06b6d4' },
}: PathRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useTelemetriq();

  // Draw static path
  const drawPath = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Sample path points from engine
    const points: { x: number; y: number; color?: string }[] = [];
    const duration = 10000; // placeholder
    const step = 100;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let t = 0; t <= duration; t += step) {
      const xVal = engine.getValueAt(position.x, t);
      const yVal = engine.getValueAt(position.y, t);
      const colorVal = colorBy ? engine.getValueAt(colorBy.channel, t) : null;
      if (typeof xVal === 'number' && typeof yVal === 'number' && !isNaN(xVal) && !isNaN(yVal)) {
        const x = xVal;
        const y = yVal;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        points.push({
          x, y,
          color: colorBy && typeof colorVal === 'number' ? colorFromScale(colorVal, colorBy.scale) : undefined,
        });
      }
    }

    if (points.length === 0) { ctx.restore(); return; }

    // Fit bounds with padding
    const pad = 20;
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scaleX = (width - pad * 2) / rangeX;
    const scaleY = (height - pad * 2) / rangeY;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = pad + (width - pad * 2 - rangeX * scale) / 2;
    const offsetY = pad + (height - pad * 2 - rangeY * scale) / 2;

    const toScreenX = (x: number) => offsetX + (x - minX) * scale;
    const toScreenY = (y: number) => offsetY + (y - minY) * scale;

    // Draw path segments
    ctx.lineWidth = 2;
    for (let i = 1; i < points.length; i++) {
      ctx.strokeStyle = points[i].color || '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(toScreenX(points[i - 1].x), toScreenY(points[i - 1].y));
      ctx.lineTo(toScreenX(points[i].x), toScreenY(points[i].y));
      ctx.stroke();
    }

    // Draw marker at current time
    if (marker.visible) {
      const currentTime = engine.getCurrentTime();
      const cx = engine.getValueAt(position.x, currentTime);
      const cy = engine.getValueAt(position.y, currentTime);
      if (typeof cx === 'number' && typeof cy === 'number') {
        ctx.fillStyle = marker.color || '#06b6d4';
        ctx.beginPath();
        ctx.arc(toScreenX(cx), toScreenY(cy), marker.radius || 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }, [engine, position, colorBy, marker]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    drawPath(ctx, width, height);

    // Subscribe to time updates for marker movement
    const unsub = engine.subscribeTime(() => {
      drawPath(ctx, width, height);
    });

    return () => unsub();
  }, [drawPath, height, engine]);

  return (
    <canvas
      ref={canvasRef}
      className="tq-path-renderer"
      style={{ width: '100%', height }}
    />
  );
}
