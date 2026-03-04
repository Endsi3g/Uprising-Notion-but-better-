/**
 * ============================================================
 * Project: Uprising CRM
 * Author: Uprising Studio
 * Description: check_views.js
 * Last Modified: 2026-03-04
 * ============================================================
 */
const fs = require('fs');
const td = JSON.parse(fs.readFileSync('introspection_full.json'));

const mutationTypeName = td.data.__schema.mutationType?.name || 'Mutation';
const mutationType = td.data.__schema.types.find(t => t.name === mutationTypeName);

if (!mutationType || !mutationType.fields) {
  console.log('Mutation type or fields not found');
  process.exit(1);
}

const createView = mutationType.fields.find(f => f.name === 'createCoreView');
if (!createView) {
  console.log('createCoreView not found in mutations');
  process.exit(1);
}

if (createView && createView.args && createView.args.length > 0) {
  const inputTypeName = createView.args[0].type?.ofType?.name || createView.args[0].type?.name;
  console.log('--- createCoreView Input Type:', inputTypeName, '---');

  const inputType = td.data.__schema.types.find(t => t.name === inputTypeName);

  if (inputType && Array.isArray(inputType.inputFields)) {
    const fields = inputType.inputFields.map(f => `${f.name} (${f.type?.name || f.type?.ofType?.name})`);
    console.log(JSON.stringify(fields, null, 2));
  }
}

const createViewGroup = mutationType.fields.find(f => f.name === 'createCoreViewGroup');
if (createViewGroup && createViewGroup.args && createViewGroup.args.length > 0) {
  const vgInputName = createViewGroup.args[0].type?.ofType?.name || createViewGroup.args[0].type?.name;
  const vgInput = td.data.__schema.types.find(t => t.name === vgInputName);
  console.log('\n--- createCoreViewGroup Input Type:', vgInputName, '---');
  if (vgInput && Array.isArray(vgInput.inputFields)) {
    const vgFields = vgInput.inputFields.map(f => `${f.name} (${f.type?.name || f.type?.ofType?.name})`);
    console.log(JSON.stringify(vgFields, null, 2));
  }
}
