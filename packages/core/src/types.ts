export type TimeUnit = 'ms' | 's';

export type CoordinateSystem =
  | { type: 'cartesian'; axes: { x: string; y: string; z?: string } }
  | { type: 'geographic'; axes: { lat: string; lon: string; alt?: string } };

export type ChannelType = 'number' | 'boolean' | 'string';
export type InterpolationMode = 'none' | 'previous' | 'linear';

export type TelemetriqChannel = {
  key: string;
  label?: string;
  unit?: string;
  type: ChannelType;
  interpolation?: InterpolationMode;
  range?: { min?: number; max?: number };
};

export type TelemetriqSample = {
  t: number;
  position?: Record<string, number>;
  values: Record<string, number | string | boolean | null>;
};

export type TelemetriqEvent = {
  t: number;
  type: string;
  label?: string;
  payload?: Record<string, unknown>;
};

export type TelemetriqDataset = {
  version: string;
  metadata?: {
    id?: string;
    name?: string;
    source?: string;
    createdAt?: string;
    domain?: string;
    description?: string;
  };
  time: { unit: TimeUnit; start: number; end: number; sampleRateHz?: number };
  coordinateSystem?: CoordinateSystem;
  channels: TelemetriqChannel[];
  samples: TelemetriqSample[];
  events?: TelemetriqEvent[];
};
