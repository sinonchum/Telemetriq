import React, { useMemo, useEffect } from 'react';
import { createTelemetriqEngine, type TelemetriqDataset, type TelemetriqEngineOptions } from '@telemetriq/core';
import { TelemetriqContext } from './TelemetriqContext';

export type TelemetriqProviderProps = {
  dataset: TelemetriqDataset;
  options?: TelemetriqEngineOptions;
  children: React.ReactNode;
};

export function TelemetriqProvider({ dataset, options, children }: TelemetriqProviderProps) {
  const engine = useMemo(() => createTelemetriqEngine(dataset, options), [dataset, options?.loop, options?.playbackRate]);
  useEffect(() => { return () => engine.destroy(); }, [engine]);
  return <TelemetriqContext.Provider value={engine}>{children}</TelemetriqContext.Provider>;
}
