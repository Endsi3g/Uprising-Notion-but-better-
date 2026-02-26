const { execSync } = require('child_process');

try {
  const query = `SELECT id, "nameSingular" FROM core."objectMetadata" WHERE "nameSingular" IN ('person', 'company', 'opportunity');`;
  // use docker exec
  const cmd = `docker exec twenty-db-1 psql -U postgres -d default -t -A -c '${query}'`;

  const stdout = execSync(cmd, { encoding: 'utf-8' });
  const lines = stdout.trim().split('\n');

  const ids = {};
  for (const line of lines) {
    if (!line) continue;
    const [id, name] = line.split('|');
    ids[name] = id;
  }

  console.log("Found Object IDs:", JSON.stringify(ids, null, 2));
} catch (e) {
  console.error("Exec error:", e.message);
}
