import { useContext } from 'react';
import { MultiEngineContext } from '../provider/MultiTelemetriqContext';
import type { MultiEngine } from '@telemetriq/core';

export function useMultiEngine(): MultiEngine {
  const engine = useContext(MultiEngineContext);
  if (!engine) throw new Error('useMultiEngine must be used within a MultiTelemetriqProvider');
  return engine;
}
