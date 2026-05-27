import type { TelemetriqDataset } from '../types';
import type { ValidationResult } from './types';

export function validateDataset(dataset: TelemetriqDataset): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  if (!dataset.version) {
    errors.push({ path: 'version', message: 'Version is required', code: 'MISSING_VERSION' });
  }

  if (!dataset.samples || dataset.samples.length === 0) {
    errors.push({ path: 'samples', message: 'Samples must be non-empty', code: 'EMPTY_SAMPLES' });
  }

  for (let i = 1; i < dataset.samples.length; i++) {
    if (dataset.samples[i].t < dataset.samples[i - 1].t) {
      errors.push({ path: `samples[${i}].t`, message: 'Samples must be sorted by t ascending', code: 'UNSORTED_SAMPLES' });
      break;
    }
  }

  const channelKeys = new Set<string>();
  for (const ch of dataset.channels) {
    if (channelKeys.has(ch.key)) {
      errors.push({ path: 'channels', message: `Duplicate channel key: ${ch.key}`, code: 'DUPLICATE_CHANNEL' });
    }
    channelKeys.add(ch.key);
  }

  for (let i = 0; i < dataset.samples.length; i++) {
    for (const key of Object.keys(dataset.samples[i].values)) {
      if (!channelKeys.has(key)) {
        errors.push({ path: `samples[${i}].values.${key}`, message: `Unknown channel key: ${key}`, code: 'UNKNOWN_VALUE_KEY' });
      }
    }
  }

  if (dataset.time.start > dataset.time.end) {
    errors.push({ path: 'time', message: 'time.start must be <= time.end', code: 'INVALID_TIME_RANGE' });
  }

  return { valid: errors.length === 0, errors, warnings };
}
