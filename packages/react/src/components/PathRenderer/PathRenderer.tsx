import React, { useRef, useEffect, useCallback } from 'react';
import { useTelemetriq } from '../../hooks/useTelemetriq';
import { colorToRgbString, type ColorScale } from '../../utils/color';

export type { ColorScale };

export type PathRendererProps = {
  height?: number;
  position?: { x: string; y: string };
  colorBy?: { channel: string; scale: { type: 'linear'; domain: [number, number]; range: string[] } };
  marker?: { visible?: boolean; radius?: number; color?: string };
};

export function PathRenderer({
  height = 400,
  position = { x: 'position.x', y: 'position.y' },
  colorBy,
  marker = { visible: true, radius: 6, color: '#06b6d4' },
}: PathRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useTelemetriq();

  const drawPath = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    const points: { x: number; y: number; color?: string }[] = [];
    const duration = engine.getDuration();
    const step = Math.max(50, duration / 200);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let t = 0; t <= duration; t += step) {
      const xVal = engine.getValueAt(position.x, t);
      const yVal = engine.getValueAt(position.y, t);
      const colorVal = colorBy ? engine.getValueAt(colorBy.channel, t) : null;
      if (typeof xVal === 'number' && typeof yVal === 'number' && !isNaN(xVal) && !isNaN(yVal)) {
        minX = Math.min(minX, xVal); maxX = Math.max(maxX, xVal);
        minY = Math.min(minY, yVal); maxY = Math.max(maxY, yVal);
        points.push({
          x: xVal, y: yVal,
          color: colorBy && typeof colorVal === 'number' ? colorToRgbString(colorVal, colorBy.scale.domain, colorBy.scale.range) : undefined,
        });
      }
    }

    if (points.length === 0) { ctx.restore(); return; }

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

    ctx.lineWidth = 2;
    for (let i = 1; i < points.length; i++) {
      ctx.strokeStyle = points[i].color || '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(toScreenX(points[i - 1].x), toScreenY(points[i - 1].y));
      ctx.lineTo(toScreenX(points[i].x), toScreenY(points[i].y));
      ctx.stroke();
    }

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
