import { useCallback } from 'react';
import { useTelemetriq } from './useTelemetriq';

export function usePlaybackControls() {
  const engine = useTelemetriq();
  return {
    play: useCallback(() => engine.play(), [engine]),
    pause: useCallback(() => engine.pause(), [engine]),
    seek: useCallback((t: number) => engine.seek(t), [engine]),
    setRate: useCallback((r: number) => engine.setRate(r), [engine]),
    setLoop: useCallback((loop: boolean) => engine.setLoop(loop), [engine]),
  };
}
