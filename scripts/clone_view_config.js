const fs = require('fs');
const { execSync } = require('child_process');

const targetViewId = '940f0162-3cf5-4f2b-8eb2-6f6e2409aaa6';
const opportunityMetadataId = 'dda569f1-74da-44e2-91c6-36ff3498a634';
const workspaceId = '87aba936-be81-479f-b6ae-c7054173ee7d';
const applicationId = '83fc4c5f-416c-4ec4-bcdb-8819ebb3d957';

function runSql(sql) {
    fs.writeFileSync('temp_query.sql', sql);
    try {
        const cmd = `Get-Content temp_query.sql | docker exec -i twenty-db-1 psql -U postgres -d default -t -A`;
        return execSync(cmd, { shell: 'powershell.exe' }).toString().trim();
    } catch (e) {
        console.error(`SQL failed.`);
        return null;
    }
}

// 1. Find a reference view for opportunities
console.log("Finding reference view...");
const refViewId = runSql(`SELECT id FROM core.view WHERE "objectMetadataId" = '${opportunityMetadataId}' AND type = 'TABLE' LIMIT 1;`);

if (!refViewId) {
    console.error("Could not find a reference view.");
    process.exit(1);
}
console.log(`Reference view ID: ${refViewId}`);

// 2. Clear existing fields for the target view
runSql(`DELETE FROM core."viewField" WHERE "viewId" = '${targetViewId}';`);

// 3. Clone fields from reference view
console.log("Cloning view fields...");
const insertQuery = `
INSERT INTO core."viewField" (
    "universalIdentifier", id, "viewId", "fieldMetadataId", "isVisible", position, size,
    "workspaceId", "applicationId", "createdAt", "updatedAt"
)
SELECT
    uuid_generate_v4(), uuid_generate_v4(), '${targetViewId}', "fieldMetadataId", "isVisible", position, size,
    '${workspaceId}', '${applicationId}', now(), now()
FROM core."viewField"
WHERE "viewId" = '${refViewId}';
`;
runSql(insertQuery);

console.log("Done. Kanban view configuration completed.");
