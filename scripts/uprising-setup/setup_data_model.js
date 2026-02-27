const fs = require('fs');

const TOKEN = process.env.TOKEN || process.env.INTROSPECT_TOKEN;
if (!TOKEN) throw new Error("TOKEN or INTROSPECT_TOKEN environment variable is required.");
const ENDPOINT = process.env.ENDPOINT || 'http://localhost:3001/metadata';

// IDs fetched directly from db
const OBJECTS = {
  company: '2d0b0e8f-040e-484d-93b6-a67e47ff8419',
  opportunity: 'dda569f1-74da-44e2-91c6-36ff3498a634',
  person: '677279ea-8a10-4e58-8090-5a1db56769e3'
};

async function graphqlQuery(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ query, variables })
  });

  if (!res.ok) {
    console.error("HTTP Error", res.status, await res.text().catch(() => ''));
    throw new Error('GraphQL HTTP error');
  }

  const data = await res.json();
  if (data.errors) {
    const errorMsg = JSON.stringify(data.errors);
    if (errorMsg.includes('already used by another field') || errorMsg.includes('already exists')) {
      return { skipped: true };
    }
    console.error("GraphQL Errors:", JSON.stringify(data.errors, null, 2));
    throw new Error('GraphQL error');
  }
  return data.data;
}

const buildOptions = (labels) => {
  if (!Array.isArray(labels)) return undefined;
  return labels.map((item, index) => {
    let label = typeof item === 'string' ? item : item.label;
    let value = typeof item === 'string'
      ? label.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
      : item.value;

    // Ensure value starts with a letter as required by Twenty
    if (/^[0-9]/.test(value)) {
      value = 'V_' + value;
    }
    if (!value) value = 'OPT_' + index;

    return {
      color: "green",
      label: label,
      value: value,
      position: index
    };
  });
};

async function createField(objectMetadataId, type, name, label, options = null, targetLabel = null, targetIcon = null) {
  try {
    const mutation = `
      mutation CreateField($input: CreateOneFieldMetadataInput!) {
        createOneField(input: $input) {
          id
          name
        }
      }
    `;

    const fieldInput = {
      objectMetadataId,
      type,
      name,
      label,
      description: "",
      icon: "IconList",
      isCustom: true,
      isActive: true,
      options: options && Array.isArray(options) ? buildOptions(options) : undefined
    };

    if (type === "RELATION") {
      fieldInput.icon = "IconLink";
      fieldInput.relationCreationPayload = {
        relationType: "MANY_TO_ONE",
        targetObjectMetadataId: options, // Assuming options contains the targetObjectMetadataId
        targetFieldLabel: targetLabel || "Related Items",
        targetFieldIcon: targetIcon || "IconLink",
        targetFieldName: label.replace(/ /g, '').toLowerCase() + "Rel" // avoid conflicts
      };
      fieldInput.options = undefined;
    }

    const input = { field: fieldInput };

    process.stdout.write(`Creating field ${label}... `);
    const res = await graphqlQuery(mutation, { input });
    if (res.skipped) {
      console.log('Skipped (Exists)');
    } else {
      console.log('Success');
    }
  } catch(e) {
    console.error(`Failed to create field ${label} on ${objectMetadataId}:`, e.message);
  }
}

async function createObject(nameSingular, namePlural, labelSingular, labelPlural, icon) {
  try {
    const mutation = `
      mutation CreateObject($input: CreateOneObjectInput!) {
        createOneObject(input: $input) {
          id
          nameSingular
        }
      }
    `;
    const input = {
      object: {
        nameSingular,
        namePlural,
        labelSingular,
        labelPlural,
        description: "",
        icon,
        isRemote: false,
        primaryKeyColumnType: "UUID",
        primaryKeyFieldMetadataSettings: { defaultValue: "UUID" }
      }
    };
    process.stdout.write(`Creating object ${labelSingular}... `);
    const res = await graphqlQuery(mutation, { input });
    if (res.skipped) {
       console.log('Skipped (Exists)');
       return null;
    }
    console.log('Success');
    return res?.createOneObject?.id || null;
  } catch(e) {
    console.error(`Failed to create object ${nameSingular}:`, e.message);
    return null;
  }
}

async function main() {
  console.log("--- Creating Fields for Person ---");
  await createField(OBJECTS.person, "SELECT", "clientType", "Client Type", ["Prospect", "Client Actif", "Ancien Client", "Partenaire"]);
  await createField(OBJECTS.person, "MULTI_SELECT", "servicesInterestedIn", "Services Interested In", ["Web Design", "Content Creation", "SEO", "Brand Development"]);
  await createField(OBJECTS.person, "SELECT", "budgetRange", "Budget Range", ["<5K$", "5-10K$", "10-25K$", "25K$+"]);
  await createField(OBJECTS.person, "SELECT", "leadSource", "Lead Source", ["Outreach", "Referral", "Website", "LinkedIn", "Networking"]);

  console.log("--- Creating Fields for Company ---");
  await createField(OBJECTS.company, "SELECT", "industry", "Industry", ["Construction", "Restaurant", "Services Professionnels", "E-commerce"]);
  await createField(OBJECTS.company, "SELECT", "websiteStatus", "Website Status", ["Aucun", "Outdated", "Needs Refresh", "Modern"]);
  await createField(OBJECTS.company, "SELECT", "companySize", "Company Size", ["Solo", "2-10", "11-50", "50+"]);
  await createField(OBJECTS.company, "TEXT", "decisionMakerRole", "Decision Maker Role");

  console.log("--- Creating Fields for Opportunity (Projets) ---");
  await createField(OBJECTS.opportunity, "SELECT", "projectType", "Project Type", ["Site Web", "Vidéo", "Branding", "SEO", "Package Complet"]);
  await createField(OBJECTS.opportunity, "MULTI_SELECT", "deliverables", "Deliverables", ["Design Mockups", "Site Live", "Video Edit", "Content Calendar"]);
  await createField(OBJECTS.opportunity, "MULTI_SELECT", "technologyStack", "Technology Stack", ["Framer", "WordPress", "Next.js", "React"]);
  await createField(OBJECTS.opportunity, "SELECT", "projectPhase", "Project Phase", ["Discovery", "Design", "Development", "Content", "Review", "Launch"]);
  await createField(OBJECTS.opportunity, "NUMBER", "estimatedHours", "Estimated Hours");
  await createField(OBJECTS.opportunity, "NUMBER", "actualHours", "Actual Hours");

  console.log("--- Creating Object: Contracts ---");
  const contractId = await createObject("contractCustom", "contractCustoms", "Contract", "Contracts", "IconFileText");
  if (contractId) {
    await createField(contractId, "SELECT", "serviceType", "Service Type", ["Web Design", "Content Creation", "SEO"]);
    await createField(contractId, "CURRENCY", "contractValue", "Contract Value");
    await createField(contractId, "DATE", "startDate", "Start Date");
    await createField(contractId, "DATE", "endDate", "End Date");
    await createField(contractId, "SELECT", "paymentTerms", "Payment Terms", ["50/50", "Monthly", "Milestone-based"]);
    await createField(contractId, "SELECT", "status", "Status", ["Draft", "Signed", "Active", "Completed"]);
    await createField(contractId, "RELATION", "companyId", "Client", OBJECTS.company, "Contracts", "IconFileText");
  }

  console.log("--- Creating Object: Content Assets ---");
  const contentAssetId = await createObject("contentAssetCustom", "contentAssetCustoms", "Content Asset", "Content Assets", "IconPhoto");
  if (contentAssetId) {
    await createField(contentAssetId, "SELECT", "assetType", "Asset Type", ["Video", "Image", "Copy", "Design"]);
    await createField(contentAssetId, "LINKS", "fileUrl", "File/Link");
    await createField(contentAssetId, "DATE", "creationDate", "Creation Date");
    await createField(contentAssetId, "SELECT", "status", "Status", ["Draft", "In Review", "Approved", "Published"]);
    await createField(contentAssetId, "RICH_TEXT", "notes", "Notes");
    await createField(contentAssetId, "RELATION", "opportunityId", "Project", OBJECTS.opportunity, "Content Assets", "IconPhoto");
  }

  console.log("--- Creating Object: Lead Outreach ---");
  const leadOutreachId = await createObject("leadOutreachCustom", "leadOutreachCustoms", "Lead Outreach", "Lead Outreaches", "IconSend");
  if (leadOutreachId) {
    await createField(leadOutreachId, "DATE", "outreachDate", "Outreach Date");
    await createField(leadOutreachId, "SELECT", "channel", "Channel", ["Email", "LinkedIn", "Cold Call", "Referral"]);
    await createField(leadOutreachId, "TEXT", "messageTemplateUsed", "Message Template Used");
    await createField(leadOutreachId, "SELECT", "responseStatus", "Response Status", ["No Response", "Positive", "Negative", "Follow-up Needed"]);
    await createField(leadOutreachId, "DATE", "nextActionDate", "Next Action Date");
    await createField(leadOutreachId, "RICH_TEXT", "notes", "Notes");
    await createField(leadOutreachId, "RELATION", "companyId", "Company", OBJECTS.company, "Lead Outreaches", "IconSend");
  }

  console.log("Data model setup script finished.");
}

main().catch(console.error);
