import React, { useRef, useEffect, useCallback } from 'react';
import { useTelemetriq } from '../../hooks/useTelemetriq';
import { hexToRgb, colorToRgbTuple } from '../../utils/color';

export type WebGLPathRendererProps = {
  height?: number;
  position?: { x: string; y: string };
  colorBy?: { channel: string; scale: { type: 'linear'; domain: [number, number]; range: string[] } };
  marker?: { visible?: boolean; radius?: number; color?: string };
};

const VERT_SHADER = `
  attribute vec2 a_position;
  attribute vec3 a_color;
  uniform vec2 u_resolution;
  uniform vec2 u_translate;
  uniform float u_scale;
  varying vec3 v_color;
  void main() {
    vec2 pos = (a_position + u_translate) * u_scale;
    vec2 clipSpace = (pos / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    gl_PointSize = 4.0;
    v_color = a_color;
  }
`;

const FRAG_SHADER = `
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vert: WebGLShader, frag: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function WebGLPathRenderer({
  height = 400,
  position = { x: 'position.x', y: 'position.y' },
  colorBy,
  marker = { visible: true, radius: 6, color: '#06b6d4' },
}: WebGLPathRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useTelemetriq();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bufferRef = useRef<WebGLBuffer | null>(null);
  const pointCountRef = useRef(0);
  const boundsRef = useRef({ minX: 0, maxX: 1, minY: 0, maxY: 1 });

  const initGL = useCallback((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
    if (!gl) return null;
    glRef.current = gl;

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vertShader || !fragShader) return null;

    const program = createProgram(gl, vertShader, fragShader);
    if (!program) return null;
    programRef.current = program;
    return gl;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const gl = initGL(canvas);
    if (!gl) return;

    const points: Array<{ x: number; y: number; color: [number, number, number] }> = [];
    const duration = engine.getDuration();
    const step = Math.max(25, duration / 200);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let t = 0; t <= duration; t += step) {
      const xVal = engine.getValueAt(position.x, t);
      const yVal = engine.getValueAt(position.y, t);
      const colorVal = colorBy ? engine.getValueAt(colorBy.channel, t) : null;
      if (typeof xVal === 'number' && typeof yVal === 'number' && !isNaN(xVal) && !isNaN(yVal)) {
        minX = Math.min(minX, xVal); maxX = Math.max(maxX, xVal);
        minY = Math.min(minY, yVal); maxY = Math.max(maxY, yVal);
        const color: [number, number, number] = colorBy && typeof colorVal === 'number'
          ? colorToRgbTuple(colorVal, colorBy.scale.domain, colorBy.scale.range)
          : hexToRgb(marker.color || '#06b6d4');
        points.push({ x: xVal, y: yVal, color });
      }
    }

    if (points.length === 0) return;
    boundsRef.current = { minX, maxX, minY, maxY };

    const pad = 20;
    const rangeX = (maxX - minX) || 1;
    const rangeY = (maxY - minY) || 1;
    const scaleX = (width * dpr - pad * 2) / rangeX;
    const scaleY = (height * dpr - pad * 2) / rangeY;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = pad + (width * dpr - pad * 2 - rangeX * scale) / 2;
    const offsetY = pad + (height * dpr - pad * 2 - rangeY * scale) / 2;

    const vertices: number[] = [];
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      vertices.push(
        offsetX + (p0.x - minX) * scale, offsetY + (p0.y - minY) * scale, p0.color[0], p0.color[1], p0.color[2],
        offsetX + (p1.x - minX) * scale, offsetY + (p1.y - minY) * scale, p1.color[0], p1.color[1], p1.color[2],
      );
    }
    pointCountRef.current = vertices.length / 5;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    bufferRef.current = buffer;

    const prog = programRef.current;
    if (!prog) return;
    gl.useProgram(prog);
    const posLoc = gl.getAttribLocation(prog, 'a_position');
    const colorLoc = gl.getAttribLocation(prog, 'a_color');
    const resLoc = gl.getUniformLocation(prog, 'u_resolution');

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 20, 8);

    gl.uniform2f(resLoc, canvas.width, canvas.height);

    const translateLoc = gl.getUniformLocation(prog, 'u_translate');
    const scaleLoc = gl.getUniformLocation(prog, 'u_scale');
    gl.uniform2f(translateLoc, 0, 0);
    gl.uniform1f(scaleLoc, 1.0);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, pointCountRef.current);

    // Marker overlay via 2D canvas overlay
    // Note: WebGL marker would require a separate overlay canvas or point rendering pass.
    // For now, the static path is rendered; marker is available on PathRenderer (Canvas2D).

    return () => {
      gl.deleteBuffer(buffer);
      if (programRef.current) gl.deleteProgram(programRef.current);
    };
  }, [engine, position, colorBy, height, initGL, marker]);

  return (
    <div className="tq-webgl-path-renderer" style={{ position: 'relative', width: '100%', height }}>
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
}
