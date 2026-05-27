import React, { useRef, useEffect } from 'react';
import { useTelemetriq } from '../../hooks/useTelemetriq';

export type MapPathRendererProps = {
  height?: number;
  colorBy?: { channel: string; scale: { type: 'linear'; domain: [number, number]; range: string[] } };
  marker?: { visible?: boolean; radius?: number; color?: string };
  tileUrl?: string;
  attribution?: string;
};

const DEFAULT_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_ATTR = '&copy; OpenStreetMap contributors';

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function colorFromScale(value: number, domain: [number, number], range: string[]): string {
  const t = Math.max(0, Math.min(1, (value - domain[0]) / (domain[1] - domain[0])));
  if (range.length === 1) return range[0];
  const segment = t * (range.length - 1);
  const i = Math.min(Math.floor(segment), range.length - 2);
  const localT = segment - i;
  const c1 = range[i], c2 = range[i + 1];
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  return `rgb(${Math.round(lerp(r1, r2, localT))},${Math.round(lerp(g1, g2, localT))},${Math.round(lerp(b1, b2, localT))})`;
}

export function MapPathRenderer({
  height = 400,
  colorBy,
  marker = { visible: true, radius: 6, color: '#06b6d4' },
  tileUrl = DEFAULT_TILE,
  attribution = DEFAULT_ATTR,
}: MapPathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const engine = useTelemetriq();

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let cleanupFn: (() => void) | null = null;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return;

      // Collect positions
      const positions: Array<{ lat: number; lon: number; color?: string }> = [];
      const duration = 10000;
      const step = 100;
      for (let t = 0; t <= duration; t += step) {
        const lat = engine.getValueAt('position.lat', t);
        const lon = engine.getValueAt('position.lon', t);
        const colorVal = colorBy ? engine.getValueAt(colorBy.channel, t) : null;
        if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
          positions.push({
            lat, lon,
            color: colorBy && typeof colorVal === 'number' ? colorFromScale(colorVal, colorBy.scale.domain, colorBy.scale.range) : undefined,
          });
        }
      }
      if (positions.length === 0) return;

      const map = L.map(containerRef.current).setView([positions[0].lat, positions[0].lon], 14);
      L.tileLayer(tileUrl, { attribution }).addTo(map);
      const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lon] as [number, number]));
      map.fitBounds(bounds.pad(0.1));

      // Draw path as polyline segments
      for (let i = 1; i < positions.length; i++) {
        const seg = L.polyline(
          [[positions[i-1].lat, positions[i-1].lon], [positions[i].lat, positions[i].lon]],
          { color: positions[i].color || '#06b6d4', weight: 3 }
        ).addTo(map);
      }

      // Marker
      const mapMarker = L.circleMarker([positions[0].lat, positions[0].lon], {
        radius: marker.radius || 6,
        color: '#fff',
        fillColor: marker.color || '#06b6d4',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);

      const unsub = engine.subscribeTime((time: number) => {
        const lat = engine.getValueAt('position.lat', time);
        const lon = engine.getValueAt('position.lon', time);
        if (typeof lat === 'number' && typeof lon === 'number') {
          mapMarker.setLatLng([lat, lon]);
        }
      });

      mapRef.current = map;
      cleanupFn = () => { unsub(); map.remove(); };
    });

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
  }, [engine, colorBy, marker, tileUrl, attribution]);

  return <div ref={containerRef} className="tq-map-path-renderer" style={{ width: '100%', height }} />;
}
