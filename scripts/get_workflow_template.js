const { execSync } = require('child_process');
const fs = require('fs');

function runSql(sql) {
    fs.writeFileSync('temp_query.sql', sql);
    try {
        const cmd = `Get-Content temp_query.sql | docker exec -i twenty-db-1 psql -U postgres -d default -t -A`;
        return execSync(cmd, { shell: 'powershell.exe' }).toString().trim();
    } catch (e) {
        return null;
    }
}

const schemas = runSql("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'workspace_%';").split('\n');
const schema = schemas[0];
console.log(`Using schema: ${schema}`);

const workflows = runSql(`SELECT id, "trigger", steps FROM "${schema}"."workflowVersion" LIMIT 5;`);
console.log("Existing Workflows:");
console.log(workflows);
