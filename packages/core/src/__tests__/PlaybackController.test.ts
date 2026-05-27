import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaybackController } from '../playback/PlaybackController';

// Mock requestAnimationFrame/cancelAnimationFrame for Node environment
beforeEach(() => {
  vi.useFakeTimers();
  let id = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
    const i = ++id;
    callbacks.set(i, cb);
    return i;
  };
  (globalThis as any).cancelAnimationFrame = (id: number) => {
    callbacks.delete(id);
  };
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PlaybackController', () => {
  it('initializes with correct time', () => {
    const ctrl = new PlaybackController({ startTime: 0, endTime: 10000, initialTime: 0 });
    expect(ctrl.getCurrentTime()).toBe(0);
    ctrl.destroy();
  });

  it('seek updates time', () => {
    const ctrl = new PlaybackController({ startTime: 0, endTime: 10000, initialTime: 0 });
    ctrl.seek(5000);
    expect(ctrl.getCurrentTime()).toBe(5000);
    ctrl.destroy();
  });

  it('subscribeTime receives callbacks on seek', () => {
    const ctrl = new PlaybackController({ startTime: 0, endTime: 10000, initialTime: 0 });
    const times: number[] = [];
    ctrl.subscribeTime((t) => times.push(t));
    ctrl.seek(1000);
    ctrl.seek(2000);
    expect(times).toEqual([1000, 2000]);
    ctrl.destroy();
  });

  it('clamp at end when loop is false', () => {
    const ctrl = new PlaybackController({ startTime: 0, endTime: 100, initialTime: 0, loop: false });
    ctrl.seek(200);
    expect(ctrl.getCurrentTime()).toBe(100);
    ctrl.destroy();
  });

  it('getState returns current state', () => {
    const ctrl = new PlaybackController({ startTime: 0, endTime: 10000, initialTime: 0, playbackRate: 2, loop: true });
    const state = ctrl.getState();
    expect(state.playing).toBe(false);
    expect(state.playbackRate).toBe(2);
    expect(state.loop).toBe(true);
    expect(state.currentTime).toBe(0);
    ctrl.destroy();
  });

  it('setRate updates rate', () => {
    const ctrl = new PlaybackController({ startTime: 0, endTime: 10000 });
    ctrl.setRate(4);
    expect(ctrl.getState().playbackRate).toBe(4);
    ctrl.destroy();
  });

  it('unsubscribe works', () => {
    const ctrl = new PlaybackController({ startTime: 0, endTime: 10000 });
    const times: number[] = [];
    const unsub = ctrl.subscribeTime((t) => times.push(t));
    ctrl.seek(1000);
    unsub();
    ctrl.seek(2000);
    expect(times).toEqual([1000]);
    ctrl.destroy();
  });
});
