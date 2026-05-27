export type PlaybackOptions = {
  startTime: number;
  endTime: number;
  initialTime?: number;
  playbackRate?: number;
  loop?: boolean;
};

export type PlaybackState = {
  playing: boolean;
  currentTime: number;
  playbackRate: number;
  loop: boolean;
};

export class PlaybackController {
  private startTime: number;
  private endTime: number;
  private currentTime: number;
  private playbackRate: number;
  private loop: boolean;
  private playing = false;
  private rafId: number | null = null;
  private lastFrameTime: number | null = null;
  private timeListeners: Set<(time: number) => void> = new Set();
  private stateListeners: Set<(state: PlaybackState) => void> = new Set();

  constructor(options: PlaybackOptions) {
    this.startTime = options.startTime;
    this.endTime = options.endTime;
    this.currentTime = options.initialTime ?? options.startTime;
    this.playbackRate = options.playbackRate ?? 1;
    this.loop = options.loop ?? false;
  }

  play(): void {
    if (this.playing) return;
    this.playing = true;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
    this.emitState();
  }

  pause(): void {
    this.playing = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastFrameTime = null;
    this.emitState();
  }

  seek(time: number): void {
    this.currentTime = Math.max(this.startTime, Math.min(time, this.endTime));
    this.emitTime();
    this.emitState();
  }

  setRate(rate: number): void {
    this.playbackRate = rate;
    this.emitState();
  }

  setLoop(loop: boolean): void {
    this.loop = loop;
    this.emitState();
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getState(): PlaybackState {
    return {
      playing: this.playing,
      currentTime: this.currentTime,
      playbackRate: this.playbackRate,
      loop: this.loop,
    };
  }

  subscribeTime(listener: (time: number) => void): () => void {
    this.timeListeners.add(listener);
    return () => this.timeListeners.delete(listener);
  }

  subscribeState(listener: (state: PlaybackState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  destroy(): void {
    this.pause();
    this.timeListeners.clear();
    this.stateListeners.clear();
  }

  private tick = (now: number): void => {
    if (!this.playing) return;
    const deltaMs = this.lastFrameTime ? now - this.lastFrameTime : 0;
    this.lastFrameTime = now;
    const clampedDelta = Math.min(deltaMs, 250);
    const nextTime = this.currentTime + clampedDelta * this.playbackRate;

    if (nextTime >= this.endTime) {
      if (this.loop) {
        this.currentTime = this.startTime + (nextTime - this.endTime);
      } else {
        this.currentTime = this.endTime;
        this.pause();
        this.emitTime();
        return;
      }
    } else {
      this.currentTime = nextTime;
    }

    this.emitTime();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private emitTime(): void {
    for (const listener of this.timeListeners) {
      listener(this.currentTime);
    }
  }

  private emitState(): void {
    const state = this.getState();
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }
}
