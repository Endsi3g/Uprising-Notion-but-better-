const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const crypto = require('crypto');

const workspaceId = '87aba936-be81-479f-b6ae-c7054173ee7d';
const opportunityMetadataId = 'dda569f1-74da-44e2-91c6-36ff3498a634';
const projectPhaseFieldId = 'ecaea3f7-6233-47f1-95dc-3086ea5fe645';
const applicationId = '83fc4c5f-416c-4ec4-bcdb-8819ebb3d957';
const viewId = crypto.randomUUID();
const viewIdentifier = crypto.randomUUID();

const safeWorkspaceId = workspaceId.replace(/'/g, "''");
const safeOppId = opportunityMetadataId.replace(/'/g, "''");
const safePhaseId = projectPhaseFieldId.replace(/'/g, "''");
const safeAppId = applicationId.replace(/'/g, "''");
const safeViewId = viewId.replace(/'/g, "''");
const safeViewIdentifier = viewIdentifier.replace(/'/g, "''");

const sql = `
INSERT INTO core.view (
  id, "universalIdentifier", name, "objectMetadataId", type, icon, position,
  "isCompact", "isCustom", "openRecordIn", "workspaceId",
  "applicationId", visibility, "mainGroupByFieldMetadataId"
) VALUES (
  '${safeViewId}', '${safeViewIdentifier}', 'Pipeline de Projets', '${safeOppId}',
  'KANBAN', 'IconKanban', 0, false, true, 'SIDE_PANEL',
  '${safeWorkspaceId}', '${safeAppId}', 'WORKSPACE', '${safePhaseId}'
);
`;

console.log("SQL to execute:");
console.log(sql);

try {
  const result = spawnSync('docker', ['exec', '-i', 'twenty-db-1', 'psql', '-U', 'postgres', '-d', 'default'], {
    input: sql,
    encoding: 'utf-8'
  });

  if (result.status !== 0) {
      console.error('Failed to insert view:', result.stderr);
  } else {
      console.log(result.stdout);
      console.log('View successfully inserted.');
  }
} catch (e) {
  console.error('Failed to execute command:', e.message);
}
