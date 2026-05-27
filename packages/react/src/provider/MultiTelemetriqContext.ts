import { createContext } from 'react';
import type { MultiEngine } from '@telemetriq/core';

export const MultiEngineContext = createContext<MultiEngine | null>(null);
MultiEngineContext.displayName = 'MultiEngineContext';
