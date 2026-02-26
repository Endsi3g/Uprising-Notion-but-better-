const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');

const workspaceId = '87aba936-be81-479f-b6ae-c7054173ee7d';
const opportunityMetadataId = 'dda569f1-74da-44e2-91c6-36ff3498a634';
const projectPhaseFieldId = 'ecaea3f7-6233-47f1-95dc-3086ea5fe645';
const applicationId = '83fc4c5f-416c-4ec4-bcdb-8819ebb3d957';
const viewId = crypto.randomUUID();
const viewIdentifier = crypto.randomUUID();

const sql = `
INSERT INTO core.view (
  id, "universalIdentifier", name, "objectMetadataId", type, icon, position,
  "isCompact", "isCustom", "openRecordIn", "workspaceId",
  "applicationId", visibility, "mainGroupByFieldMetadataId"
) VALUES (
  '${viewId}', '${viewIdentifier}', 'Pipeline de Projets', '${opportunityMetadataId}',
  'KANBAN', 'IconKanban', 0, false, true, 'SIDE_PANEL',
  '${workspaceId}', '${applicationId}', 'WORKSPACE', '${projectPhaseFieldId}'
);
`;

console.log("SQL to execute:");
console.log(sql);

try {
  fs.writeFileSync('insert_view.sql', sql);
  const result = execSync('Get-Content insert_view.sql | docker exec -i twenty-db-1 psql -U postgres -d default', { shell: 'powershell.exe' });
  console.log(result.toString());
  console.log('View successfully inserted.');
} catch (e) {
  console.error('Failed to insert view:', e.message);
  if (e.stdout) console.error(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
}
