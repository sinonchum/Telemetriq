import React, { useRef, useEffect } from 'react';
import { useTelemetriq } from '../../hooks/useTelemetriq';
import { colorToRgbString } from '../../utils/color';

export type MapPathRendererProps = {
  height?: number;
  colorBy?: { channel: string; scale: { type: 'linear'; domain: [number, number]; range: string[] } };
  marker?: { visible?: boolean; radius?: number; color?: string };
  tileUrl?: string;
  attribution?: string;
};

const DEFAULT_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_ATTR = '&copy; OpenStreetMap contributors';

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

      const positions: Array<{ lat: number; lon: number; color?: string }> = [];
      const duration = engine.getDuration();
      const step = Math.max(50, duration / 200);
      for (let t = 0; t <= duration; t += step) {
        const lat = engine.getValueAt('position.lat', t);
        const lon = engine.getValueAt('position.lon', t);
        const colorVal = colorBy ? engine.getValueAt(colorBy.channel, t) : null;
        if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
          positions.push({
            lat, lon,
            color: colorBy && typeof colorVal === 'number' ? colorToRgbString(colorVal, colorBy.scale.domain, colorBy.scale.range) : undefined,
          });
        }
      }
      if (positions.length === 0) return;

      const map = L.map(containerRef.current).setView([positions[0].lat, positions[0].lon], 14);
      L.tileLayer(tileUrl, { attribution }).addTo(map);
      const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lon] as [number, number]));
      map.fitBounds(bounds.pad(0.1));

      for (let i = 1; i < positions.length; i++) {
        L.polyline(
          [[positions[i-1].lat, positions[i-1].lon], [positions[i].lat, positions[i].lon]],
          { color: positions[i].color || '#06b6d4', weight: 3 }
        ).addTo(map);
      }

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
