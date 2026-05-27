import { createContext } from 'react';
import type { TelemetriqEngine } from '@telemetriq/core';

export const TelemetriqContext = createContext<TelemetriqEngine | null>(null);
TelemetriqContext.displayName = 'TelemetriqContext';
