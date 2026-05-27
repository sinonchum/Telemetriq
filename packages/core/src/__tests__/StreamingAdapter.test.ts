import { describe, it, expect, vi } from 'vitest';
import { createStreamingAdapter } from '../streaming/StreamingAdapter';

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = 1;
  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }
  close() { this.readyState = 3; this.onclose?.(); }
  simulateMessage(data: object) { this.onmessage?.({ data: JSON.stringify(data) }); }
}
(globalThis as unknown as Record<string, unknown>).WebSocket = MockWebSocket;

describe('createStreamingAdapter', () => {
  it('creates adapter with correct interface', () => {
    const adapter = createStreamingAdapter({
      url: 'ws://localhost:8080',
      type: 'websocket',
      channelKeys: ['speed', 'rpm'],
    });
    expect(adapter.isRunning()).toBe(false);
    expect(adapter.getBuffer()).toHaveLength(0);
  });

  it('start connects and receives samples', () => {
    MockWebSocket.instances = [];
    const samples: unknown[] = [];
    const adapter = createStreamingAdapter({
      url: 'ws://localhost:8080',
      type: 'websocket',
      channelKeys: ['speed'],
      onSample: (s) => samples.push(s),
    });
    adapter.start();
    expect(adapter.isRunning()).toBe(true);
    expect(MockWebSocket.instances).toHaveLength(1);

    MockWebSocket.instances[0].simulateMessage({ t: 100, values: { speed: 50 } });
    MockWebSocket.instances[0].simulateMessage({ t: 200, values: { speed: 80 } });

    expect(adapter.getBuffer()).toHaveLength(2);
    expect(samples).toHaveLength(2);
    adapter.stop();
  });

  it('flushToDataset creates valid dataset', () => {
    MockWebSocket.instances = [];
    const adapter = createStreamingAdapter({
      url: 'ws://localhost:8080',
      type: 'websocket',
      channelKeys: ['speed'],
    });
    adapter.start();
    MockWebSocket.instances[0].simulateMessage({ t: 200, values: { speed: 80 } });
    MockWebSocket.instances[0].simulateMessage({ t: 100, values: { speed: 50 } });

    const dataset = adapter.flushToDataset();
    expect(dataset.version).toBe('0.1.0');
    expect(dataset.samples).toHaveLength(2);
    // Should be sorted
    expect(dataset.samples[0].t).toBe(100);
    expect(dataset.samples[1].t).toBe(200);
    expect(dataset.time.start).toBe(100);
    expect(dataset.time.end).toBe(200);
    adapter.stop();
  });

  it('subscribe receives live samples', () => {
    MockWebSocket.instances = [];
    const adapter = createStreamingAdapter({
      url: 'ws://localhost:8080',
      type: 'websocket',
      channelKeys: ['speed'],
    });
    const received: unknown[] = [];
    const unsub = adapter.subscribe((s) => received.push(s));
    adapter.start();
    MockWebSocket.instances[0].simulateMessage({ t: 100, values: { speed: 50 } });
    expect(received).toHaveLength(1);
    unsub();
    MockWebSocket.instances[0].simulateMessage({ t: 200, values: { speed: 80 } });
    expect(received).toHaveLength(1); // unsubscribed
    adapter.stop();
  });
});
