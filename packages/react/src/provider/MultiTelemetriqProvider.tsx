import React, { useMemo, useEffect } from 'react';
import { createMultiEngine } from '@telemetriq/core';
import type { TelemetriqDataset, TelemetriqEngineOptions } from '@telemetriq/core';
import { MultiEngineContext } from './MultiTelemetriqContext';

export type MultiTelemetriqProviderProps = {
  sessions: Array<{ id: string; label: string; dataset: TelemetriqDataset }>;
  options?: TelemetriqEngineOptions;
  children: React.ReactNode;
};

export function MultiTelemetriqProvider({ sessions, options, children }: MultiTelemetriqProviderProps) {
  const engine = useMemo(() => createMultiEngine(sessions, options), [sessions, options?.loop, options?.playbackRate]);
  useEffect(() => { return () => engine.destroy(); }, [engine]);
  return <MultiEngineContext.Provider value={engine}>{children}</MultiEngineContext.Provider>;
}
