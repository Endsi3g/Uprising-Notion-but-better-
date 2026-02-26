
BEGIN;

INSERT INTO "workspace_815i5mpuq7jwcic6l2iitsuil"."workflow" (id, "createdAt", "updatedAt", name)
VALUES ('8addf911-0d0c-4360-a138-04c04da5e390', now(), now(), 'Acquisition de Leads (Formulaire)');

INSERT INTO "workspace_815i5mpuq7jwcic6l2iitsuil"."workflowVersion" (
    id, "createdAt", "updatedAt", name, trigger, steps, status, position, "workflowId"
) VALUES (
    '271ee27a-8f4f-40d0-9da8-1959593fc0f9', now(), now(), 'v1',
    '{"name":"Typeform Webhook","type":"WEBHOOK","settings":{"httpMethod":"POST","authentication":null,"outputSchema":{"type":"object","properties":{"body":{"type":"object"}}}}}',
    '[{"id":"ce569483-7245-4c66-bb32-e9c6edfa2aa0","name":"Create Company","type":"CREATE_RECORD","settings":{"input":{"objectName":"company","objectRecord":{"name":"{{trigger.body.company_name}}"}}},"nextStepIds":["4e1ff675-593f-4364-bd69-525ddfb35124"]},{"id":"4e1ff675-593f-4364-bd69-525ddfb35124","name":"Create Person","type":"CREATE_RECORD","settings":{"input":{"objectName":"person","objectRecord":{"firstName":"{{trigger.body.first_name}}","lastName":"{{trigger.body.last_name}}","emails":{"primaryEmail":"{{trigger.body.email}}"},"companyId":"{{ce569483-7245-4c66-bb32-e9c6edfa2aa0.result.id}}"}}},"nextStepIds":[]}]',
    'ACTIVE', 0, '8addf911-0d0c-4360-a138-04c04da5e390'
);

COMMIT;
