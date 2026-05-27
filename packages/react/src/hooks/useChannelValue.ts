import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useTelemetriq } from './useTelemetriq';

export function useChannelValue(channelKey: string): number | string | boolean | null {
  const engine = useTelemetriq();
  const valueRef = useRef<number | string | boolean | null>(null);
  const subscribe = useCallback((onStoreChange: () => void) => {
    return engine.subscribeTime((time: number) => { valueRef.current = engine.getValueAt(channelKey, time); onStoreChange(); });
  }, [engine, channelKey]);
  const getSnapshot = useCallback(() => valueRef.current, []);
  return useSyncExternalStore(subscribe, getSnapshot);
}
