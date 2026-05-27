import React, { useRef, useEffect } from 'react';
import type { Vector3, Mesh } from 'three';
import { useTelemetriq } from '../../hooks/useTelemetriq';

export type PathRenderer3DProps = {
  height?: number;
  position?: { x: string; y: string; z: string };
  colorBy?: { channel: string; scale: { type: 'linear'; domain: [number, number]; range: string[] } };
  marker?: { visible?: boolean; radius?: number; color?: string };
  cameraPosition?: [number, number, number];
};

function hexToColor(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

function lerpColor(c1: number, c2: number, t: number): number {
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return (r << 16) | (g << 8) | b;
}

function colorFromScale(value: number, domain: [number, number], range: string[]): number {
  const t = Math.max(0, Math.min(1, (value - domain[0]) / (domain[1] - domain[0])));
  const colors = range.map(hexToColor);
  if (colors.length === 1) return colors[0];
  const segment = t * (colors.length - 1);
  const i = Math.min(Math.floor(segment), colors.length - 2);
  return lerpColor(colors[i], colors[i + 1], segment - i);
}

export function PathRenderer3D({
  height = 400,
  position = { x: 'position.x', y: 'position.y', z: 'position.z' },
  colorBy,
  marker = { visible: true, radius: 0.5, color: '#06b6d4' },
  cameraPosition = [100, 100, 100],
}: PathRenderer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engine = useTelemetriq();

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let cleanupFn: (() => void) | null = null;

    import('three').then(async (THREE) => {
      if (cancelled || !containerRef.current) return;

      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      const width = containerRef.current.clientWidth;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a1a);

      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
      camera.position.set(...cameraPosition);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // Grid helper
      const grid = new THREE.GridHelper(200, 20, 0x333333, 0x222222);
      scene.add(grid);

      // Axes helper
      const axes = new THREE.AxesHelper(50);
      scene.add(axes);

      // Collect path points
      const points: Vector3[] = [];
      const colors: number[] = [];
      const duration = 10000;
      const step = 50;

      for (let t = 0; t <= duration; t += step) {
        const x = engine.getValueAt(position.x, t);
        const y = engine.getValueAt(position.y, t);
        const z = engine.getValueAt(position.z, t);
        const colorVal = colorBy ? engine.getValueAt(colorBy.channel, t) : null;
        if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
          points.push(new THREE.Vector3(x, y, z));
          const color = colorBy && typeof colorVal === 'number'
            ? colorFromScale(colorVal, colorBy.scale.domain, colorBy.scale.range)
            : hexToColor('#06b6d4');
          colors.push(color);
        }
      }

      if (points.length > 1) {
        // Create line with vertex colors
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const colorArray = new Float32Array(colors.length * 3);
        for (let i = 0; i < colors.length; i++) {
          colorArray[i * 3] = ((colors[i] >> 16) & 0xff) / 255;
          colorArray[i * 3 + 1] = ((colors[i] >> 8) & 0xff) / 255;
          colorArray[i * 3 + 2] = (colors[i] & 0xff) / 255;
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        const material = new THREE.LineBasicMaterial({ vertexColors: true });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }

      // Marker sphere
      let markerMesh: Mesh | null = null;
      if (marker.visible && points.length > 0) {
        const markerGeo = new THREE.SphereGeometry(marker.radius || 0.5, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: hexToColor(marker.color || '#06b6d4') });
        markerMesh = new THREE.Mesh(markerGeo, markerMat);
        markerMesh.position.copy(points[0]);
        scene.add(markerMesh);
      }

      // Animation loop
      let animId: number;
      function animate() {
        animId = requestAnimationFrame(animate);
        controls.update();

        // Update marker
        if (markerMesh) {
          const time = engine.getCurrentTime();
          const x = engine.getValueAt(position.x, time);
          const y = engine.getValueAt(position.y, time);
          const z = engine.getValueAt(position.z, time);
          if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
            markerMesh.position.set(x, y, z);
          }
        }

        renderer.render(scene, camera);
      }
      animate();

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        camera.aspect = w / height;
        camera.updateProjectionMatrix();
        renderer.setSize(w, height);
      });
      resizeObserver.observe(containerRef.current);

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        resizeObserver.disconnect();
        controls.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
  }, [engine, position, colorBy, marker, height, cameraPosition]);

  return <div ref={containerRef} className="tq-path-renderer-3d" style={{ width: '100%', height }} />;
}
