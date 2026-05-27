# Telemetriq Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build Telemetriq — an open-source TypeScript/React visualization framework for high-frequency spatial time-series data.

**Architecture:** Monorepo with core layer (framework-agnostic) separated from React layer. Core handles data validation, normalization, time indexing, interpolation, and playback. React layer provides Provider, hooks, and visualization components (MetricChart, PathRenderer, PlaybackControls, Gauges).

**Tech Stack:** TypeScript (strict), React 18+, pnpm workspace, Vitest, uPlot, Canvas 2D API, Zustand/useSyncExternalStore, tsup, ESLint + Prettier

---

## Milestone 0: Project Scaffolding (Week 0)

### Task 0.1: Initialize pnpm Monorepo

**Objective:** Set up the monorepo structure with pnpm workspace.

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `packages/core/package.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/react/package.json`
- Create: `packages/react/src/index.ts`
- Create: `examples/racing-demo/package.json`
- Create: `examples/drone-demo/package.json`

**Step 1: Create root package.json**

```json
{
  "name": "telemetriq",
  "private": true,
  "scripts": {
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "build": "pnpm -r build"
  },
  "engines": {
    "node": ">=18"
  }
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
  - "examples/*"
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
.vitepress/.temp
*.tsbuildinfo
.DS_Store
```

**Step 4: Create packages/core/package.json**

```json
{
  "name": "@telemetriq/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/",
    "test": "vitest run"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

**Step 5: Create packages/core/src/index.ts**

```ts
export {};
```

**Step 6: Create packages/react/package.json**

```json
{
  "name": "@telemetriq/react",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --external react",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/",
    "test": "vitest run"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

**Step 7: Create packages/react/src/index.ts**

```ts
export {};
```

**Step 8: Create examples/racing-demo/package.json**

```json
{
  "name": "@telemetriq/racing-demo",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@telemetriq/core": "workspace:*",
    "@telemetriq/react": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

**Step 9: Create examples/drone-demo/package.json**

```json
{
  "name": "@telemetriq/drone-demo",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@telemetriq/core": "workspace:*",
    "@telemetriq/react": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

**Step 10: Install dependencies**

Run: `pnpm install`

**Step 11: Commit**

```bash
git add -A
git commit -m "chore: initialize pnpm monorepo structure"
```

---

### Task 0.2: TypeScript Strict Mode

**Objective:** Configure TypeScript with strict mode across the monorepo.

**Files:**
- Create: `tsconfig.base.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/react/tsconfig.json`

**Step 1: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

**Step 2: Create packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create packages/react/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
```

**Step 4: Verify typecheck**

Run: `pnpm typecheck`
Expected: Success (no errors)

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: add TypeScript strict config"
```

---

### Task 0.3: ESLint + Prettier

**Objective:** Set up code formatting and linting.

**Files:**
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`

**Step 1: Create .eslintrc.cjs**

```js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
```

**Step 2: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80
}
```

**Step 3: Add devDependencies to root package.json**

Add to root package.json devDependencies:
```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  }
}
```

**Step 4: Install and verify**

Run: `pnpm install && pnpm lint`

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: add ESLint + Prettier config"
```

---

### Task 0.4: GitHub Actions CI

**Objective:** Set up CI pipeline for typecheck, lint, test, build.

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create .github/workflows/ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

**Step 2: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Actions workflow"
```

---

### Task 0.5: Basic README

**Objective:** Create a comprehensive README.

**Files:**
- Modify: `README.md`

**Step 1: Update README.md**

```markdown
# Telemetriq

> Open-source TypeScript / React visualization framework for high-frequency spatial time-series data.

## Features

- **Unified Data Protocol** — Standard schema for time-series data across any domain
- **Playback Engine** — Shared clock for all components with play, pause, seek, and speed control
- **High-Performance Visualization** — Smooth charts and trajectories with 100k+ data points
- **Framework-Agnostic Core** — Core engine separated from React UI layer
- **Rich Components** — MetricChart, PathRenderer, PlaybackControls, and gauge components

## Quick Start

```bash
npm install @telemetriq/core @telemetriq/react
```

```tsx
import { TelemetriqProvider, MetricChart, PathRenderer, PlaybackControls } from "@telemetriq/react";

function App() {
  return (
    <TelemetriqProvider dataset={dataset}>
      <PathRenderer height={400} />
      <MetricChart channels={[{ key: "speed" }]} />
      <PlaybackControls />
    </TelemetriqProvider>
  );
}
```

## Documentation

- [PRD](./PRD.md)
- [Development Outline](./Development-Outline.md)

## License

MIT
```

**Step 2: Commit**

```bash
git add -A
git commit -m "docs: update README with quickstart"
```

---

## Milestone 1: Core Engine (Weeks 1-2)

### Task 1.1: Define TypeScript Data Types

**Objective:** Create core type definitions for TelemetriqDataset, channels, samples, events.

**Files:**
- Create: `packages/core/src/types.ts`
- Modify: `packages/core/src/index.ts`
- Create: `packages/core/src/__tests__/types.test.ts`

**Step 1: Write test**

```ts
// packages/core/src/__tests__/types.test.ts
import { describe, it, expect } from 'vitest';
import type { TelemetriqDataset, TelemetriqChannel, TelemetriqSample } from '../types';

describe('Telemetriq types', () => {
  it('should allow creating a valid dataset', () => {
    const dataset: TelemetriqDataset = {
      version: '0.1.0',
      time: { unit: 'ms', start: 0, end: 10000 },
      channels: [
        { key: 'speed', type: 'number', unit: 'km/h' },
      ],
      samples: [
        { t: 0, values: { speed: 0 } },
        { t: 100, values: { speed: 50 } },
      ],
    };
    expect(dataset.version).toBe('0.1.0');
    expect(dataset.channels).toHaveLength(1);
    expect(dataset.samples).toHaveLength(2);
  });
});
```

**Step 2: Implement types**

```ts
// packages/core/src/types.ts
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
  time: {
    unit: TimeUnit;
    start: number;
    end: number;
    sampleRateHz?: number;
  };
  coordinateSystem?: CoordinateSystem;
  channels: TelemetriqChannel[];
  samples: TelemetriqSample[];
  events?: TelemetriqEvent[];
};
```

**Step 3: Export from index.ts**

```ts
// packages/core/src/index.ts
export * from './types';
```

**Step 4: Run tests**

Run: `cd packages/core && pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add core TypeScript types"
```

---

### Task 1.2: Implement Schema Validator

**Objective:** Validate TelemetriqDataset against schema rules.

**Files:**
- Create: `packages/core/src/validation/validateDataset.ts`
- Create: `packages/core/src/validation/types.ts`
- Create: `packages/core/src/__tests__/validateDataset.test.ts`

**Step 1: Write tests**

```ts
import { describe, it, expect } from 'vitest';
import { validateDataset } from '../validation/validateDataset';
import type { TelemetriqDataset } from '../types';

const validDataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 10000 },
  channels: [{ key: 'speed', type: 'number' }],
  samples: [
    { t: 0, values: { speed: 0 } },
    { t: 100, values: { speed: 50 } },
  ],
};

describe('validateDataset', () => {
  it('should pass valid dataset', () => {
    const result = validateDataset(validDataset);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail on missing version', () => {
    const result = validateDataset({ ...validDataset, version: '' });
    expect(result.valid).toBe(false);
  });

  it('should fail on empty samples', () => {
    const result = validateDataset({ ...validDataset, samples: [] });
    expect(result.valid).toBe(false);
  });

  it('should fail on unsorted samples', () => {
    const result = validateDataset({
      ...validDataset,
      samples: [
        { t: 100, values: { speed: 50 } },
        { t: 0, values: { speed: 0 } },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('should fail on duplicate channel keys', () => {
    const result = validateDataset({
      ...validDataset,
      channels: [
        { key: 'speed', type: 'number' },
        { key: 'speed', type: 'number' },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('should fail on unknown value key', () => {
    const result = validateDataset({
      ...validDataset,
      samples: [{ t: 0, values: { unknown: 0 } }],
    });
    expect(result.valid).toBe(false);
  });
});
```

**Step 2: Implement validator**

```ts
// packages/core/src/validation/types.ts
export type ValidationResult = {
  valid: boolean;
  errors: Array<{ path: string; message: string; code: string }>;
  warnings: Array<{ path: string; message: string; code: string }>;
};
```

```ts
// packages/core/src/validation/validateDataset.ts
import type { TelemetriqDataset } from '../types';
import type { ValidationResult } from './types';

export function validateDataset(dataset: TelemetriqDataset): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  // Version
  if (!dataset.version) {
    errors.push({ path: 'version', message: 'Version is required', code: 'MISSING_VERSION' });
  }

  // Samples
  if (!dataset.samples || dataset.samples.length === 0) {
    errors.push({ path: 'samples', message: 'Samples must be non-empty', code: 'EMPTY_SAMPLES' });
  }

  // Sorted timestamps
  for (let i = 1; i < dataset.samples.length; i++) {
    if (dataset.samples[i].t < dataset.samples[i - 1].t) {
      errors.push({ path: `samples[${i}].t`, message: 'Samples must be sorted by t ascending', code: 'UNSORTED_SAMPLES' });
      break;
    }
  }

  // Duplicate channel keys
  const channelKeys = new Set<string>();
  for (const ch of dataset.channels) {
    if (channelKeys.has(ch.key)) {
      errors.push({ path: `channels`, message: `Duplicate channel key: ${ch.key}`, code: 'DUPLICATE_CHANNEL' });
    }
    channelKeys.add(ch.key);
  }

  // Unknown value keys
  for (let i = 0; i < dataset.samples.length; i++) {
    for (const key of Object.keys(dataset.samples[i].values)) {
      if (!channelKeys.has(key)) {
        errors.push({ path: `samples[${i}].values.${key}`, message: `Unknown channel key: ${key}`, code: 'UNKNOWN_VALUE_KEY' });
      }
    }
  }

  // Time range
  if (dataset.time.start > dataset.time.end) {
    errors.push({ path: 'time', message: 'time.start must be <= time.end', code: 'INVALID_TIME_RANGE' });
  }

  return { valid: errors.length === 0, errors, warnings };
}
```

**Step 3: Export**

```ts
// packages/core/src/index.ts
export * from './types';
export * from './validation/validateDataset';
export * from './validation/types';
```

**Step 4: Run tests**

Run: `cd packages/core && pnpm test`
Expected: All 6 tests PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: implement dataset schema validator"
```

---

### Task 1.3: Implement TimeIndex

**Objective:** Binary search index for timestamp lookup.

**Files:**
- Create: `packages/core/src/time/TimeIndex.ts`
- Create: `packages/core/src/__tests__/TimeIndex.test.ts`

**Step 1: Write tests**

```ts
import { describe, it, expect } from 'vitest';
import { TimeIndex } from '../time/TimeIndex';

describe('TimeIndex', () => {
  const timestamps = new Float64Array([0, 100, 200, 300, 400, 500]);
  const idx = new TimeIndex(timestamps);

  it('findNearestIndex returns closest', () => {
    expect(idx.findNearestIndex(150)).toBe(1); // closer to 100 than 200
    expect(idx.findNearestIndex(160)).toBe(2); // closer to 200
  });

  it('findFloorIndex returns <= value', () => {
    expect(idx.findFloorIndex(250)).toBe(2);
    expect(idx.findFloorIndex(200)).toBe(2);
  });

  it('findCeilIndex returns >= value', () => {
    expect(idx.findCeilIndex(250)).toBe(3);
    expect(idx.findCeilIndex(200)).toBe(2);
  });

  it('findRange returns [start, end] indices', () => {
    const [start, end] = idx.findRange(150, 350);
    expect(start).toBe(1);
    expect(end).toBe(3);
  });

  it('handles single element', () => {
    const single = new TimeIndex(new Float64Array([50]));
    expect(single.findNearestIndex(50)).toBe(0);
    expect(single.findFloorIndex(50)).toBe(0);
  });
});
```

**Step 2: Implement TimeIndex**

```ts
// packages/core/src/time/TimeIndex.ts
export class TimeIndex {
  private timestamps: Float64Array;

  constructor(timestamps: Float64Array) {
    if (timestamps.length === 0) {
      throw new Error('TimeIndex requires non-empty timestamps');
    }
    this.timestamps = timestamps;
  }

  findNearestIndex(t: number): number {
    const floor = this.findFloorIndex(t);
    const ceil = Math.min(floor + 1, this.timestamps.length - 1);
    if (floor === ceil) return floor;
    return Math.abs(t - this.timestamps[floor]) <= Math.abs(t - this.timestamps[ceil])
      ? floor
      : ceil;
  }

  findFloorIndex(t: number): number {
    let lo = 0;
    let hi = this.timestamps.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.timestamps[mid] <= t) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    return lo;
  }

  findCeilIndex(t: number): number {
    let lo = 0;
    let hi = this.timestamps.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.timestamps[mid] < t) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  findRange(start: number, end: number): [number, number] {
    return [this.findCeilIndex(start), this.findFloorIndex(end)];
  }
}
```

**Step 3: Export and test**

Run: `cd packages/core && pnpm test`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement TimeIndex with binary search"
```

---

### Task 1.4: Implement DatasetNormalizer

**Objective:** Convert TelemetriqDataset to typed arrays for performance.

**Files:**
- Create: `packages/core/src/dataset/normalizeDataset.ts`
- Create: `packages/core/src/__tests__/normalizeDataset.test.ts`

**Step 1: Write tests**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeDataset } from '../dataset/normalizeDataset';
import type { TelemetriqDataset } from '../types';

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 200 },
  channels: [{ key: 'speed', type: 'number' }],
  samples: [
    { t: 0, values: { speed: 0 } },
    { t: 100, values: { speed: 50 } },
    { t: 200, values: { speed: null } },
  ],
};

describe('normalizeDataset', () => {
  it('extracts timestamps to Float64Array', () => {
    const norm = normalizeDataset(dataset);
    expect(norm.timestamps).toBeInstanceOf(Float64Array);
    expect(Array.from(norm.timestamps)).toEqual([0, 100, 200]);
  });

  it('converts number channels to Float64Array', () => {
    const norm = normalizeDataset(dataset);
    const ch = norm.channels.get('speed')!;
    expect(ch.data).toBeInstanceOf(Float64Array);
    expect(ch.data[0]).toBe(0);
    expect(ch.data[1]).toBe(50);
    expect(ch.data[2]).toBeNaN();
  });

  it('handles position data', () => {
    const withPos: TelemetriqDataset = {
      ...dataset,
      samples: [
        { t: 0, position: { x: 1, y: 2 }, values: { speed: 0 } },
      ],
    };
    const norm = normalizeDataset(withPos);
    expect(norm.positions?.x).toBeInstanceOf(Float64Array);
    expect(norm.positions?.x![0]).toBe(1);
  });
});
```

**Step 2: Implement normalizer**

```ts
// packages/core/src/dataset/normalizeDataset.ts
import type { TelemetriqDataset } from '../types';

export type NormalizedChannel = {
  data: Float64Array;
  type: 'number' | 'boolean' | 'string';
};

export type NormalizedDataset = {
  timestamps: Float64Array;
  channels: Map<string, NormalizedChannel>;
  positions?: {
    x?: Float64Array;
    y?: Float64Array;
    z?: Float64Array;
    lat?: Float64Array;
    lon?: Float64Array;
    alt?: Float64Array;
  };
};

export function normalizeDataset(dataset: TelemetriqDataset): NormalizedDataset {
  const n = dataset.samples.length;
  const timestamps = new Float64Array(n);
  const channels = new Map<string, NormalizedChannel>();

  // Init channel arrays
  for (const ch of dataset.channels) {
    channels.set(ch.key, {
      data: new Float64Array(n),
      type: ch.type,
    });
  }

  // Init position arrays
  const positionKeys = new Set<string>();
  let positions: NormalizedDataset['positions'] | undefined;
  for (const sample of dataset.samples) {
    if (sample.position) {
      for (const key of Object.keys(sample.position)) {
        positionKeys.add(key);
      }
    }
  }
  if (positionKeys.size > 0) {
    positions = {};
    for (const key of positionKeys) {
      (positions as any)[key] = new Float64Array(n);
    }
  }

  // Fill arrays
  for (let i = 0; i < n; i++) {
    const sample = dataset.samples[i];
    timestamps[i] = sample.t;

    for (const ch of dataset.channels) {
      const val = sample.values[ch.key];
      const arr = channels.get(ch.key)!.data;
      arr[i] = val == null ? NaN : Number(val);
    }

    if (positions && sample.position) {
      for (const key of positionKeys) {
        (positions as any)[key][i] = sample.position[key] ?? NaN;
      }
    }
  }

  return { timestamps, channels, positions };
}
```

**Step 3: Export and test**

Run: `cd packages/core && pnpm test`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement DatasetNormalizer with typed arrays"
```

---

### Task 1.5: Implement Interpolation

**Objective:** Query channel values at arbitrary time points.

**Files:**
- Create: `packages/core/src/interpolation/getValueAt.ts`
- Create: `packages/core/src/__tests__/getValueAt.test.ts`

**Step 1: Write tests**

```ts
import { describe, it, expect } from 'vitest';
import { getValueAt } from '../interpolation/getValueAt';
import { normalizeDataset } from '../dataset/normalizeDataset';
import type { TelemetriqDataset } from '../types';

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 200 },
  channels: [
    { key: 'speed', type: 'number', interpolation: 'linear' },
    { key: 'gear', type: 'string', interpolation: 'previous' },
  ],
  samples: [
    { t: 0, values: { speed: 0, gear: '1' } },
    { t: 100, values: { speed: 100, gear: '2' } },
    { t: 200, values: { speed: 200, gear: '3' } },
  ],
};

describe('getValueAt', () => {
  const norm = normalizeDataset(dataset);

  it('linear interpolation at midpoint', () => {
    expect(getValueAt(norm, dataset, 'speed', 50)).toBe(50);
  });

  it('linear interpolation at exact time', () => {
    expect(getValueAt(norm, dataset, 'speed', 100)).toBe(100);
  });

  it('previous interpolation for string', () => {
    expect(getValueAt(norm, dataset, 'gear', 150)).toBe('2');
    expect(getValueAt(norm, dataset, 'gear', 50)).toBe('1');
  });

  it('returns NaN for out of range', () => {
    expect(getValueAt(norm, dataset, 'speed', -100)).toBeNaN();
  });
});
```

**Step 2: Implement getValueAt**

```ts
// packages/core/src/interpolation/getValueAt.ts
import type { NormalizedDataset } from '../dataset/normalizeDataset';
import type { TelemetriqDataset } from '../types';
import { TimeIndex } from '../time/TimeIndex';

export function getValueAt(
  normalized: NormalizedDataset,
  dataset: TelemetriqDataset,
  channelKey: string,
  time: number
): number | string | boolean | null {
  const channel = dataset.channels.find((c) => c.key === channelKey);
  if (!channel) return null;

  const timeIndex = new TimeIndex(normalized.timestamps);
  const ch = normalized.channels.get(channelKey);
  if (!ch) return null;

  // Out of bounds
  if (time < normalized.timestamps[0] || time > normalized.timestamps[normalized.timestamps.length - 1]) {
    return NaN;
  }

  // Exact match
  const floorIdx = timeIndex.findFloorIndex(time);
  if (normalized.timestamps[floorIdx] === time) {
    const val = ch.data[floorIdx];
    if (channel.type === 'string') {
      // For strings, we need original data
      const sample = dataset.samples[floorIdx];
      return sample.values[channelKey] as string;
    }
    return val;
  }

  const mode = channel.interpolation || 'none';

  if (mode === 'none' || mode === 'previous' || channel.type === 'string' || channel.type === 'boolean') {
    if (channel.type === 'string') {
      return dataset.samples[floorIdx].values[channelKey] as string;
    }
    return ch.data[floorIdx];
  }

  // Linear interpolation
  const ceilIdx = Math.min(floorIdx + 1, normalized.timestamps.length - 1);
  const t0 = normalized.timestamps[floorIdx];
  const t1 = normalized.timestamps[ceilIdx];
  const v0 = ch.data[floorIdx];
  const v1 = ch.data[ceilIdx];

  if (isNaN(v0) || isNaN(v1)) return NaN;

  const ratio = (time - t0) / (t1 - t0);
  return v0 + ratio * (v1 - v0);
}
```

**Step 3: Export and test**

Run: `cd packages/core && pnpm test`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement channel value interpolation"
```

---

### Task 1.6: Implement PlaybackController

**Objective:** requestAnimationFrame-based playback controller.

**Files:**
- Create: `packages/core/src/playback/PlaybackController.ts`
- Create: `packages/core/src/__tests__/PlaybackController.test.ts`

**Step 1: Write tests**

```ts
import { describe, it, expect, vi } from 'vitest';
import { PlaybackController } from '../playback/PlaybackController';

describe('PlaybackController', () => {
  it('initializes with correct time', () => {
    const ctrl = new PlaybackController({
      startTime: 0,
      endTime: 10000,
      initialTime: 0,
    });
    expect(ctrl.getCurrentTime()).toBe(0);
    ctrl.destroy();
  });

  it('seek updates time', () => {
    const ctrl = new PlaybackController({
      startTime: 0,
      endTime: 10000,
      initialTime: 0,
    });
    ctrl.seek(5000);
    expect(ctrl.getCurrentTime()).toBe(5000);
    ctrl.destroy();
  });

  it('subscribeTime receives callbacks', () => {
    const ctrl = new PlaybackController({
      startTime: 0,
      endTime: 10000,
      initialTime: 0,
    });
    const times: number[] = [];
    ctrl.subscribeTime((t) => times.push(t));
    ctrl.seek(1000);
    expect(times).toContain(1000);
    ctrl.destroy();
  });

  it('clamp at end when loop is false', () => {
    const ctrl = new PlaybackController({
      startTime: 0,
      endTime: 100,
      initialTime: 0,
      loop: false,
    });
    ctrl.seek(200);
    expect(ctrl.getCurrentTime()).toBe(100);
    ctrl.destroy();
  });
});
```

**Step 2: Implement PlaybackController**

```ts
// packages/core/src/playback/PlaybackController.ts
export type PlaybackOptions = {
  startTime: number;
  endTime: number;
  initialTime?: number;
  playbackRate?: number;
  loop?: boolean;
};

export type PlaybackState = {
  playing: boolean;
  currentTime: number;
  playbackRate: number;
  loop: boolean;
};

export class PlaybackController {
  private startTime: number;
  private endTime: number;
  private currentTime: number;
  private playbackRate: number;
  private loop: boolean;
  private playing = false;
  private rafId: number | null = null;
  private lastFrameTime: number | null = null;
  private timeListeners: Set<(time: number) => void> = new Set();
  private stateListeners: Set<(state: PlaybackState) => void> = new Set();

  constructor(options: PlaybackOptions) {
    this.startTime = options.startTime;
    this.endTime = options.endTime;
    this.currentTime = options.initialTime ?? options.startTime;
    this.playbackRate = options.playbackRate ?? 1;
    this.loop = options.loop ?? false;
  }

  play(): void {
    if (this.playing) return;
    this.playing = true;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
    this.emitState();
  }

  pause(): void {
    this.playing = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastFrameTime = null;
    this.emitState();
  }

  seek(time: number): void {
    this.currentTime = Math.max(this.startTime, Math.min(time, this.endTime));
    this.emitTime();
    this.emitState();
  }

  setRate(rate: number): void {
    this.playbackRate = rate;
    this.emitState();
  }

  setLoop(loop: boolean): void {
    this.loop = loop;
    this.emitState();
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getState(): PlaybackState {
    return {
      playing: this.playing,
      currentTime: this.currentTime,
      playbackRate: this.playbackRate,
      loop: this.loop,
    };
  }

  subscribeTime(listener: (time: number) => void): () => void {
    this.timeListeners.add(listener);
    return () => this.timeListeners.delete(listener);
  }

  subscribeState(listener: (state: PlaybackState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  destroy(): void {
    this.pause();
    this.timeListeners.clear();
    this.stateListeners.clear();
  }

  private tick = (now: number): void => {
    if (!this.playing) return;

    const deltaMs = this.lastFrameTime ? now - this.lastFrameTime : 0;
    this.lastFrameTime = now;

    // Clamp delta to prevent large jumps (e.g., background tab)
    const clampedDelta = Math.min(deltaMs, 250);
    const nextTime = this.currentTime + clampedDelta * this.playbackRate;

    if (nextTime >= this.endTime) {
      if (this.loop) {
        this.currentTime = this.startTime + (nextTime - this.endTime);
      } else {
        this.currentTime = this.endTime;
        this.pause();
        this.emitTime();
        return;
      }
    } else {
      this.currentTime = nextTime;
    }

    this.emitTime();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private emitTime(): void {
    for (const listener of this.timeListeners) {
      listener(this.currentTime);
    }
  }

  private emitState(): void {
    const state = this.getState();
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }
}
```

**Step 3: Export and test**

Run: `cd packages/core && pnpm test`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement PlaybackController with rAF"
```

---

### Task 1.7: Create Core Engine Facade

**Objective:** Single entry point that combines validation, normalization, and playback.

**Files:**
- Create: `packages/core/src/createTelemetriqEngine.ts`
- Create: `packages/core/src/__tests__/createTelemetriqEngine.test.ts`

**Step 1: Write tests**

```ts
import { describe, it, expect } from 'vitest';
import { createTelemetriqEngine } from '../createTelemetriqEngine';
import type { TelemetriqDataset } from '../types';

const dataset: TelemetriqDataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 10000 },
  channels: [{ key: 'speed', type: 'number', interpolation: 'linear' }],
  samples: [
    { t: 0, values: { speed: 0 } },
    { t: 5000, values: { speed: 100 } },
    { t: 10000, values: { speed: 200 } },
  ],
};

describe('createTelemetriqEngine', () => {
  it('creates engine from valid dataset', () => {
    const engine = createTelemetriqEngine(dataset);
    expect(engine).toBeDefined();
    expect(engine.getCurrentTime()).toBe(0);
    engine.destroy();
  });

  it('throws on invalid dataset', () => {
    expect(() => createTelemetriqEngine({ ...dataset, samples: [] })).toThrow();
  });

  it('getValueAt works', () => {
    const engine = createTelemetriqEngine(dataset);
    expect(engine.getValueAt('speed', 2500)).toBe(50);
    engine.destroy();
  });

  it('seek works', () => {
    const engine = createTelemetriqEngine(dataset);
    engine.seek(5000);
    expect(engine.getCurrentTime()).toBe(5000);
    engine.destroy();
  });
});
```

**Step 2: Implement engine facade**

```ts
// packages/core/src/createTelemetriqEngine.ts
import type { TelemetriqDataset } from './types';
import { validateDataset } from './validation/validateDataset';
import { normalizeDataset, type NormalizedDataset } from './dataset/normalizeDataset';
import { PlaybackController, type PlaybackOptions } from './playback/PlaybackController';
import { getValueAt } from './interpolation/getValueAt';

export type TelemetriqEngineOptions = {
  loop?: boolean;
  initialTime?: number;
  playbackRate?: number;
};

export type TelemetriqEngine = {
  play(): void;
  pause(): void;
  seek(time: number): void;
  setRate(rate: number): void;
  getCurrentTime(): number;
  getValueAt(channelKey: string, time: number): number | string | boolean | null;
  subscribeTime(listener: (time: number) => void): () => void;
  subscribeState(listener: (state: any) => void): () => void;
  destroy(): void;
};

export function createTelemetriqEngine(
  dataset: TelemetriqDataset,
  options?: TelemetriqEngineOptions
): TelemetriqEngine {
  const validation = validateDataset(dataset);
  if (!validation.valid) {
    throw new Error(`Invalid dataset: ${validation.errors.map((e) => e.message).join(', ')}`);
  }

  const normalized = normalizeDataset(dataset);
  const controller = new PlaybackController({
    startTime: dataset.time.start,
    endTime: dataset.time.end,
    initialTime: options?.initialTime ?? dataset.time.start,
    playbackRate: options?.playbackRate ?? 1,
    loop: options?.loop ?? false,
  });

  return {
    play: () => controller.play(),
    pause: () => controller.pause(),
    seek: (time: number) => controller.seek(time),
    setRate: (rate: number) => controller.setRate(rate),
    getCurrentTime: () => controller.getCurrentTime(),
    getValueAt: (channelKey: string, time: number) =>
      getValueAt(normalized, dataset, channelKey, time),
    subscribeTime: (listener) => controller.subscribeTime(listener),
    subscribeState: (listener) => controller.subscribeState(listener),
    destroy: () => controller.destroy(),
  };
}
```

**Step 3: Export and test**

Run: `cd packages/core && pnpm test`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement createTelemetriqEngine facade"
```

---

### Task 1.8: Core Package Exports

**Objective:** Wire up all exports from @telemetriq/core.

**Files:**
- Modify: `packages/core/src/index.ts`

**Step 1: Update index.ts**

```ts
// packages/core/src/index.ts
export * from './types';
export * from './validation/validateDataset';
export * from './validation/types';
export * from './time/TimeIndex';
export * from './dataset/normalizeDataset';
export * from './interpolation/getValueAt';
export * from './playback/PlaybackController';
export * from './createTelemetriqEngine';
```

**Step 2: Verify build**

Run: `cd packages/core && pnpm build`
Expected: dist/ generated with .js, .cjs, .d.ts files

**Step 3: Run all tests**

Run: `cd packages/core && pnpm test`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire up @telemetriq/core exports"
```

---

## Milestone 2: React Layer (Weeks 3-5)

> [Tasks 2.1-2.6 to be written in next iteration]
