const { spawnSync } = require('child_process');

try {
  const query = `SELECT id, "nameSingular" FROM core."objectMetadata" WHERE "nameSingular" IN ('person', 'company', 'opportunity');`;

  const result = spawnSync('docker', ['exec', '-i', 'twenty-db-1', 'psql', '-U', 'postgres', '-d', 'default', '-t', '-A'], {
    input: query,
    encoding: 'utf-8'
  });

  if (result.status !== 0) {
      console.error("Exec error:", result.stderr);
      process.exit(1);
  }

  const lines = result.stdout.trim().split('\n');

  const ids = {};
  for (const line of lines) {
    if (!line || line.startsWith('ERROR') || line.startsWith('WARNING')) {
      console.warn("Skipping unexpected line:", line);
      continue;
    }
    const parts = line.split('|');
    if (parts.length !== 2) {
      console.warn("Skipping malformed line:", line);
      continue;
    }
    const id = parts[0].trim();
    const name = parts[1].trim();
    if (id && name) ids[name] = id;
  }

  console.log("Found Object IDs:", JSON.stringify(ids, null, 2));
} catch (e) {
  console.error("Exception:", e.message);
}
