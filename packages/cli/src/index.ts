#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { convertCSVToTelemetriq, type MappingConfig } from './converter';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: telemetriq convert <input.csv> <mapping.json> <output.json>');
  console.log('');
  console.log('mapping.json format:');
  console.log(JSON.stringify({
    time: { column: 'timestamp_ms', unit: 'ms' },
    position: { x: 'pos_x', y: 'pos_y' },
    channels: { speed: { column: 'speed_kph', unit: 'km/h' } },
  }, null, 2));
  process.exit(1);
}

const [inputPath, mappingPath, outputPath] = args;

try {
  const csvText = readFileSync(inputPath, 'utf-8');
  const mapping: MappingConfig = JSON.parse(readFileSync(mappingPath, 'utf-8'));
  const dataset = convertCSVToTelemetriq(csvText, mapping);
  writeFileSync(outputPath, JSON.stringify(dataset, null, 2));
  console.log(`Converted ${inputPath} -> ${outputPath}`);
  console.log(`  ${dataset.samples.length} samples, ${dataset.channels.length} channels`);
} catch (err) {
  console.error('Error:', (err as Error).message);
  process.exit(1);
}
