const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

function runSql(sql) {
    fs.writeFileSync('temp_query.sql', sql);
    try {
        const cmd = `Get-Content temp_query.sql | docker exec -i twenty-db-1 psql -U postgres -d default -t -A`;
        return execSync(cmd, { shell: 'powershell.exe' }).toString().trim();
    } catch (e) {
        console.error("SQL Error:", e.message);
        return null;
    }
}

// 1. Setup IDs
const schemas = runSql("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'workspace_%';").split('\n');
const schema = schemas[0];
console.log(`Using schema: ${schema}`);

const workflowId = crypto.randomUUID();
const versionId = crypto.randomUUID();

// 2. Define Trigger and Steps
const trigger = {
    name: "Typeform Webhook",
    type: "WEBHOOK",
    settings: {
        httpMethod: "POST",
        authentication: null,
        outputSchema: {
            type: "object",
            properties: {
                body: {
                    type: "object"
                }
            }
        }
    }
};

const steps = [
    {
        id: crypto.randomUUID(),
        name: "Create Company",
        type: "CREATE_RECORD",
        settings: {
            input: {
                objectName: "company",
                objectRecord: {
                    name: "{{trigger.body.company_name}}"
                }
            }
        },
        nextStepIds: [] // Will link later
    },
    {
        id: crypto.randomUUID(),
        name: "Create Person",
        type: "CREATE_RECORD",
        settings: {
            input: {
                objectName: "person",
                objectRecord: {
                    firstName: "{{trigger.body.first_name}}",
                    lastName: "{{trigger.body.last_name}}",
                    emails: {
                        primaryEmail: "{{trigger.body.email}}"
                    },
                    companyId: `{{${crypto.randomUUID()}.result.id}}` // Placeholder for linking
                }
            }
        },
        nextStepIds: []
    }
];

// Link steps
steps[1].settings.input.objectRecord.companyId = `{{${steps[0].id}.result.id}}`;
steps[0].nextStepIds = [steps[1].id];

// 3. Injection SQL
const sql = `
BEGIN;

INSERT INTO "${schema}"."workflow" (id, "createdAt", "updatedAt", name)
VALUES ('${workflowId}', now(), now(), 'Acquisition de Leads (Formulaire)');

INSERT INTO "${schema}"."workflowVersion" (
    id, "createdAt", "updatedAt", name, trigger, steps, status, position, "workflowId"
) VALUES (
    '${versionId}', now(), now(), 'v1',
    '${JSON.stringify(trigger)}',
    '${JSON.stringify(steps)}',
    'ACTIVE', 0, '${workflowId}'
);

COMMIT;
`;

console.log("Injecting workflow...");
runSql(sql);
console.log(`Workflow created successfully! ID: ${workflowId}`);
console.log(`Webhook URL should be: /webhooks/${workflowId}`);
