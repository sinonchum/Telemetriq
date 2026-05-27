import type { TelemetriqDataset, TelemetriqSample } from '../types';

export type StreamingAdapterOptions = {
  url: string;
  type: 'websocket' | 'eventsource';
  channelKeys: string[];
  onSample?: (sample: TelemetriqSample) => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectIntervalMs?: number;
};

export type StreamingAdapter = {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getBuffer(): TelemetriqSample[];
  flushToDataset(metadata?: TelemetriqDataset['metadata']): TelemetriqDataset;
  subscribe(listener: (sample: TelemetriqSample) => void): () => void;
};

export function createStreamingAdapter(options: StreamingAdapterOptions): StreamingAdapter {
  const buffer: TelemetriqSample[] = [];
  const listeners = new Set<(sample: TelemetriqSample) => void>();
  let source: WebSocket | EventSource | null = null;
  let running = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const { url, type, onSample, onError, reconnect = true, reconnectIntervalMs = 3000 } = options;

  function notify(sample: TelemetriqSample) {
    buffer.push(sample);
    onSample?.(sample);
    for (const listener of listeners) listener(sample);
  }

  function connect() {
    if (type === 'websocket') {
      const ws = new WebSocket(url);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const sample: TelemetriqSample = {
            t: data.t ?? data.time ?? Date.now(),
            position: data.position,
            values: data.values ?? data,
          };
          notify(sample);
        } catch (e) {
          console.warn('[StreamingAdapter] Failed to parse message:', e);
        }
      };
      ws.onerror = (event) => {
        onError?.(event);
      };
      ws.onclose = () => {
        if (running && reconnect) {
          reconnectTimer = setTimeout(connect, reconnectIntervalMs);
        }
      };
      source = ws;
    } else {
      const es = new EventSource(url);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const sample: TelemetriqSample = {
            t: data.t ?? data.time ?? Date.now(),
            position: data.position,
            values: data.values ?? data,
          };
          notify(sample);
        } catch (e) {
          console.warn('[StreamingAdapter] Failed to parse message:', e);
        }
      };
      es.onerror = (event) => {
        onError?.(event);
        if (es.readyState === EventSource.CLOSED && running && reconnect) {
          reconnectTimer = setTimeout(connect, reconnectIntervalMs);
        }
      };
      source = es;
    }
  }

  function start() {
    if (running) return;
    running = true;
    connect();
  }

  function stop() {
    running = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (source) {
      if (source instanceof WebSocket) source.close();
      else source.close();
      source = null;
    }
  }

  function isRunning() {
    return running;
  }

  function getBuffer() {
    return [...buffer];
  }

  function flushToDataset(metadata?: TelemetriqDataset['metadata']): TelemetriqDataset {
    if (buffer.length === 0) {
      return {
        version: '0.1.0',
        time: { unit: 'ms', start: 0, end: 0 },
        channels: options.channelKeys.map(key => ({ key, type: 'number' as const, interpolation: 'linear' as const })),
        samples: [],
      };
    }

    const sorted = [...buffer].sort((a, b) => a.t - b.t);
    return {
      version: '0.1.0',
      metadata,
      time: { unit: 'ms', start: sorted[0].t, end: sorted[sorted.length - 1].t },
      channels: options.channelKeys.map(key => ({ key, type: 'number' as const, interpolation: 'linear' as const })),
      samples: sorted,
    };
  }

  function subscribe(listener: (sample: TelemetriqSample) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { start, stop, isRunning, getBuffer, flushToDataset, subscribe };
}
