/**
 * ============================================================
 * Project: Uprising CRM
 * Author: Uprising Studio
 * Description: fetch_ids.js
 * Last Modified: 2026-03-04
 * ============================================================
 */
const { spawnSync } = require('child_process');

try {
  const query = `SELECT id, "nameSingular" FROM core."objectMetadata" WHERE "nameSingular" IN ('person', 'company', 'opportunity');`;

  const result = spawnSync(
    'docker',
    [
      'exec',
      '-i',
      'twenty-db-1',
      'psql',
      '-U',
      'postgres',
      '-d',
      'default',
      '-t',
      '-A',
    ],
    {
      input: query,
      encoding: 'utf-8',
    },
  );

  if (result.error) {
    console.error('Failed to spawn psql process:', result.error.message);
    process.exit(1);
  }

  if (result.status !== 0 || result.status === null) {
    const errorPrefix =
      result.status === null
        ? 'Terminated by signal ' + result.signal
        : 'Exec error';
    console.error(`${errorPrefix}:`, result.stderr);
    process.exit(1);
  }

  const lines = result.stdout.trim().split('\n');

  const ids = {};
  for (const line of lines) {
    if (!line || line.startsWith('ERROR') || line.startsWith('WARNING')) {
      console.warn('Skipping unexpected line:', line);
      continue;
    }
    const parts = line.split('|');
    if (parts.length !== 2) {
      console.warn('Skipping malformed line:', line);
      continue;
    }
    const id = parts[0].trim();
    const name = parts[1].trim();
    if (id && name) ids[name] = id;
  }

  console.log('Found Object IDs:', JSON.stringify(ids, null, 2));
} catch (e) {
  console.error('Exception:', e.message);
  process.exit(1);
}
