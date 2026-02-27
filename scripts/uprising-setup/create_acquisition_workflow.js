const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

function runSql(sql) {
  const tmpFile = `temp_query_${crypto.randomUUID()}.sql`;
  fs.writeFileSync(tmpFile, sql);
  try {
    const dbUser = process.env.DB_USER || 'app_user';
    const cmd = `Get-Content ${tmpFile} | docker exec -i twenty-db-1 psql -U ${dbUser} -d default -t -A`;
    return execSync(cmd, { shell: 'powershell.exe' }).toString().trim();
  } catch (e) {
    console.error('SQL Error:', e.message);
    return null;
  } finally {
    try {
      fs.unlinkSync(tmpFile);
    } catch (_) {}
  }
}

// 1. Setup IDs
const schemasResult = runSql(
  "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'workspace_%';",
);
if (!schemasResult) {
  console.error('Failed to fetch schemas. Aborting.');
  process.exit(1);
}
const schemas = schemasResult
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);
if (schemas.length === 0) {
  console.error('No valid schemas found. Aborting.');
  process.exit(1);
}
const schema = schemas[0];
console.log(`Using schema: ${schema}`);

const workflowId = crypto.randomUUID();
const versionId = crypto.randomUUID();

// 2. Define Trigger and Steps
const trigger = {
  name: 'Typeform Webhook',
  type: 'WEBHOOK',
  settings: {
    httpMethod: 'POST',
    authentication: null,
    outputSchema: {
      type: 'object',
      properties: {
        body: {
          type: 'object',
        },
      },
    },
  },
};

const steps = [
  {
    id: crypto.randomUUID(),
    name: 'Create Company',
    type: 'CREATE_RECORD',
    settings: {
      input: {
        objectName: 'company',
        objectRecord: {
          name: '{{trigger.body.company_name}}',
        },
      },
    },
    nextStepIds: [], // Will link later
  },
  {
    id: crypto.randomUUID(),
    name: 'Create Person',
    type: 'CREATE_RECORD',
    settings: {
      input: {
        objectName: 'person',
        objectRecord: {
          firstName: '{{trigger.body.first_name}}',
          lastName: '{{trigger.body.last_name}}',
          emails: {
            primaryEmail: '{{trigger.body.email}}',
          },
          companyId: `{{${crypto.randomUUID()}.result.id}}`, // Placeholder for linking
        },
      },
    },
    nextStepIds: [],
  },
];

// Link steps
steps[1].settings.input.objectRecord.companyId = `{{${steps[0].id}.result.id}}`;
steps[0].nextStepIds = [steps[1].id];

// 3. Injection SQL
const safeSchema = schema.replace(/"/g, '""');
const safeWorkflowId = workflowId.replace(/'/g, "''");
const safeVersionId = versionId.replace(/'/g, "''");
const safeTrigger = JSON.stringify(trigger).replace(/'/g, "''");
const safeSteps = JSON.stringify(steps).replace(/'/g, "''");

const sql = `
BEGIN;

INSERT INTO "${safeSchema}"."workflow" (id, "createdAt", "updatedAt", name)
VALUES ('${safeWorkflowId}', now(), now(), 'Acquisition de Leads (Formulaire)');

INSERT INTO "${safeSchema}"."workflowVersion" (
    id, "createdAt", "updatedAt", name, trigger, steps, status, position, "workflowId"
) VALUES (
    '${safeVersionId}', now(), now(), 'v1',
    '${safeTrigger}',
    '${safeSteps}',
    'ACTIVE', 0, '${safeWorkflowId}'
);

COMMIT;
`;

console.log('Injecting workflow...');
const result = runSql(sql);
if (result !== null) {
  console.log(`Workflow created successfully! ID: ${workflowId}`);
  console.log(`Webhook URL should be: /webhooks/${workflowId}`);
} else {
  console.error('Failed to create workflow.');
  process.exit(1);
}
