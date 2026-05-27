import { useContext } from 'react';
import { TelemetriqContext } from '../provider/TelemetriqContext';
import type { TelemetriqEngine } from '@telemetriq/core';

export function useTelemetriq(): TelemetriqEngine {
  const engine = useContext(TelemetriqContext);
  if (!engine) throw new Error('useTelemetriq must be used within a TelemetriqProvider');
  return engine;
}
