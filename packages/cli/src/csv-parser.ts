export type CSVParseResult = {
  headers: string[];
  rows: Record<string, string>[];
};

export function parseCSV(text: string): CSVParseResult {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ''));
    return row;
  });
  return { headers, rows };
}
