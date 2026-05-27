import { useSyncExternalStore, useCallback, useRef } from 'react';
import { useTelemetriq } from './useTelemetriq';
import type { PlaybackState } from '@telemetriq/core';

const DEFAULT_STATE: PlaybackState = { playing: false, currentTime: 0, playbackRate: 1, loop: false };

export function usePlaybackState(): PlaybackState {
  const engine = useTelemetriq();
  const stateRef = useRef<PlaybackState>(DEFAULT_STATE);
  const subscribe = useCallback((onStoreChange: () => void) => {
    return engine.subscribeState((state) => { stateRef.current = state; onStoreChange(); });
  }, [engine]);
  const getSnapshot = useCallback(() => stateRef.current, []);
  return useSyncExternalStore(subscribe, getSnapshot);
}
