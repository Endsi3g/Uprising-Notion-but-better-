const { execSync } = require('child_process');
const fs = require('fs');

function runSql(sql) {
    const tmpFile = `temp_query_${Date.now()}.sql`;
    fs.writeFileSync(tmpFile, sql);
    try {
        const cmd = `Get-Content ${tmpFile} | docker exec -i twenty-db-1 psql -U postgres -d default -t -A`;
        return execSync(cmd, { shell: 'powershell.exe' }).toString().trim();
    } catch (e) {
        console.error("SQL Error:", e.message);
        return null;
    } finally {
        try { fs.unlinkSync(tmpFile); } catch(_) {}
    }
}

const schemasResult = runSql("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'workspace_%';");
if (!schemasResult) {
    console.error("Failed to query schemas");
    process.exit(1);
}
const schemas = schemasResult.split('\n').filter(Boolean);
if (schemas.length === 0) {
    console.error("No valid schemas found");
    process.exit(1);
}
const schema = schemas[0];
console.log(`Using schema: ${schema}`);

const workflows = runSql(`SELECT id, "trigger", steps FROM "${schema}"."workflowVersion" LIMIT 5;`);
console.log("Existing Workflows:");
console.log(workflows);
