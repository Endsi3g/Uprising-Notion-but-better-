const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Script pour configurer rapidement l'intégration Notion dans la base de données.
 * Usage: node scripts/setup_notion_config.js "VOTRE_TOKEN_NOTION" "ID_DB_COMPANIES" "ID_DB_PEOPLE"
 */

const [,, token, companiesId, peopleId] = process.argv;

if (!token || !companiesId || !peopleId) {
  console.log('Usage: node scripts/setup_notion_config.js <NOTION_TOKEN> <COMPANIES_DB_ID> <PEOPLE_DB_ID>');
  process.exit(1);
}

function runSql(sql) {
  const tmpFile = `temp_query_${crypto.randomUUID()}.sql`;
  fs.writeFileSync(tmpFile, sql);
  try {
    const dbUser = process.env.DB_USER || 'postgres';
    // On essaie de détecter si on est en local (docker) ou distant
    const cmd = `Get-Content ${tmpFile} | docker exec -i twenty-db-1 psql -U ${dbUser} -d default -t -A`;
    return execSync(cmd, { shell: 'powershell.exe' }).toString().trim();
  } catch (e) {
    console.error('SQL Error (Assurez-vous que docker-compose est lancé):', e.message);
    return null;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
}

// 1. Récupérer le premier workspace ID
const workspaceResult = runSql("SELECT id FROM \"core\".\"workspace\" LIMIT 1;");
if (!workspaceResult) {
  console.error('Impossible de trouver un workspace. Le CRM est-il initialisé ?');
  process.exit(1);
}
const workspaceId = workspaceResult.split('\n')[0].trim();
console.log(`Configuration pour le workspace: ${workspaceId}`);

// 2. Préparer les données
const notionTokenValue = JSON.stringify({ token: token }).replace(/'/g, "''");
const notionDbsValue = JSON.stringify({ companiesId, peopleId }).replace(/'/g, "''");

const sql = `
BEGIN;

-- Suppression des anciennes configs si elles existent
DELETE FROM "core"."keyValuePair" WHERE "workspaceId" = '${workspaceId}' AND "key" IN ('NOTION_INTEGRATION_TOKEN', 'NOTION_DATABASES');

-- Insertion du Token
INSERT INTO "core"."keyValuePair" (id, "workspaceId", "key", "type", "value", "createdAt", "updatedAt")
VALUES ('${crypto.randomUUID()}', '${workspaceId}', 'NOTION_INTEGRATION_TOKEN', 'CONFIG_VARIABLE', '${notionTokenValue}', now(), now());

-- Insertion des IDs de Bases
INSERT INTO "core"."keyValuePair" (id, "workspaceId", "key", "type", "value", "createdAt", "updatedAt")
VALUES ('${crypto.randomUUID()}', '${workspaceId}', 'NOTION_DATABASES', 'CONFIG_VARIABLE', '${notionDbsValue}', now(), now());

COMMIT;
`;

console.log('Injection de la configuration Notion...');
const result = runSql(sql);

if (result !== null) {
  console.log('✅ Configuration Notion injectée avec succès !');
} else {
  console.error('❌ Échec de l\'injection.');
}
