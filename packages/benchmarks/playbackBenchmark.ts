import { createTelemetriqEngine } from '@telemetriq/core';
import { generateLargeDataset } from './generateDataset';

function benchmark(name: string, fn: () => void, iterations = 100) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  console.log(`${name}: ${(elapsed / iterations).toFixed(2)}ms avg (${iterations} runs)`);
}

const dataset = generateLargeDataset(100_000);
console.log(`\nDataset: ${dataset.samples.length} samples, ${dataset.channels.length} channels\n`);

benchmark('Engine init (validate + normalize + create)', () => {
  createTelemetriqEngine(dataset);
});

const engine = createTelemetriqEngine(dataset);

benchmark('getValueAt (linear interpolation)', () => {
  engine.getValueAt('speed', 5000);
});

benchmark('getValueAt x1000 (simulating frame)', () => {
  for (let t = 0; t < 20000; t += 20) {
    engine.getValueAt('speed', t);
  }
}, 10);

engine.destroy();
console.log('\nDone.');
