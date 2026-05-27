import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useMultiEngine } from './useMultiEngine';

export function useSessionValue(sessionId: string, channelKey: string): number | string | boolean | null {
  const multi = useMultiEngine();
  const session = multi.sessions.find(s => s.id === sessionId);
  const valueRef = useRef<number | string | boolean | null>(null);

  const subscribe = useCallback((onStoreChange: () => void) => {
    return multi.subscribeTime((time: number) => {
      if (session) valueRef.current = session.engine.getValueAt(channelKey, time);
      onStoreChange();
    });
  }, [multi, session, channelKey]);

  const getSnapshot = useCallback(() => valueRef.current, []);
  return useSyncExternalStore(subscribe, getSnapshot);
}
