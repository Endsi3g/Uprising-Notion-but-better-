import { Injectable, Logger } from '@nestjs/common';

import { Client } from '@notionhq/client';

import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

@Injectable()
export class NotionSyncService {
  private readonly logger = new Logger(NotionSyncService.name);

  constructor(
    private readonly keyValuePairService: KeyValuePairService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  private async getNotionClient(workspaceId: string): Promise<Client | null> {
    const tokenRecords = await this.keyValuePairService.get({
      key: 'NOTION_INTEGRATION_TOKEN',
      type: KeyValuePairType.CONFIG_VARIABLE,
      workspaceId,
    });

    const tokenRecord = tokenRecords[0];

    if (
      !tokenRecord ||
      !tokenRecord.value ||
      !(tokenRecord.value as Record<string, string>).token
    ) {
      this.logger.warn(`No Notion token found for workspace ${workspaceId}`);

      return null;
    }

    return new Client({
      auth: (tokenRecord.value as Record<string, string>).token,
    });
  }

  async syncWorkspace(workspaceId: string) {
    const notion = await this.getNotionClient(workspaceId);

    if (!notion) {
      throw new Error(
        'Notion integration token missing. Please configure it in settings.',
      );
    }

    // In a real scenario, the user would configure which Notion Databases correspond to which Twenty Object.
    // For now, we will assume they have provided the database IDs in the KeyValuePair store.

    // Example: fetch Notion Companies database
    const dbConfigs = await this.keyValuePairService.get({
      key: 'NOTION_DATABASES',
      type: KeyValuePairType.CONFIG_VARIABLE,
      workspaceId,
    });

    const dbConfig = dbConfigs[0];

    if (!dbConfig || !dbConfig.value) {
      throw new Error('Notion databases configuration missing.');
    }

    const dbs = dbConfig.value as {
      companiesId?: string;
      peopleId?: string;
      opportunitiesId?: string;
      tasksId?: string;
    };

    let stats = { companies: 0, people: 0, opportunities: 0, tasks: 0 };

    if (dbs.companiesId) {
      stats.companies = await this.syncCompanies(
        workspaceId,
        notion,
        dbs.companiesId,
      );
    }

    if (dbs.peopleId) {
      stats.people = await this.syncPeople(workspaceId, notion, dbs.peopleId);
    }

    if (dbs.opportunitiesId) {
      stats.opportunities = await this.syncOpportunities(
        workspaceId,
        notion,
        dbs.opportunitiesId,
      );
    }

    if (dbs.tasksId) {
      stats.tasks = await this.syncTasks(workspaceId, notion, dbs.tasksId);
    }

    return { success: true, message: 'Sync completed', stats };
  }

  private async syncCompanies(
    workspaceId: string,
    notion: Client,
    databaseId: string,
  ): Promise<number> {
    const response = await notion.databases.query({ database_id: databaseId });
    const pages = response.results as Record<string, any>[];

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const companyRepo = await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          CompanyWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );
        let syncedCount = 0;

        for (const page of pages) {
          // Very basic property extraction, assumes default Notion template properties
          const name =
            page.properties.Name?.title?.[0]?.plain_text || 'Unnamed Company';
          const domain = page.properties.Domain?.url || '';
          const address =
            page.properties.Address?.rich_text?.[0]?.plain_text || '';

          // Find existing company or create new
          const existing = await companyRepo.findOne({ where: { name: name } }); // Simple name match logic

          if (existing) {
            // Update
            await companyRepo.update(existing.id, {
              name,
              domainName: domain ? { primaryLinkUrl: domain } : null,
              address: { addressCity: address }, // simplifying address to city
            });
          } else {
            // Create
            await companyRepo.save({
              name,
              domainName: domain ? { primaryLinkUrl: domain } : null,
              address: { addressCity: address },
            });
          }
          syncedCount++;
        }

        return syncedCount;
      },
      { workspace: { id: workspaceId } } as unknown as WorkspaceAuthContext,
    );
  }

  private async syncPeople(
    workspaceId: string,
    notion: Client,
    databaseId: string,
  ): Promise<number> {
    const response = await notion.databases.query({ database_id: databaseId });
    const pages = response.results as Record<string, any>[];

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personRepo = await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          PersonWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );
        let syncedCount = 0;

        for (const page of pages) {
          const properties = page.properties as Record<string, any>;
          const name =
            properties.Name?.title?.[0]?.plain_text || 'Unnamed Person';
          const email = properties.Email?.email || '';

          const existing = await personRepo.findOne({
            where: { name: { firstName: name, lastName: '' } },
          });

          if (existing) {
            await personRepo.update(existing.id, {
              name: { firstName: name, lastName: '' },
              emails: email ? { primaryEmail: email } : { primaryEmail: '' },
            });
          } else {
            await personRepo.save({
              name: { firstName: name, lastName: '' },
              emails: email ? { primaryEmail: email } : { primaryEmail: '' },
            });
          }
          syncedCount++;
        }

        return syncedCount;
      },
      { workspace: { id: workspaceId } } as unknown as WorkspaceAuthContext,
    );
  }

  private async syncOpportunities(
    workspaceId: string,
    notion: Client,
    databaseId: string,
  ): Promise<number> {
    const response = await notion.databases.query({ database_id: databaseId });
    const pages = response.results as Record<string, any>[];

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const oppRepo = await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          OpportunityWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );
        let syncedCount = 0;

        for (const page of pages) {
          const properties = page.properties as Record<string, any>;
          const name =
            properties.Name?.title?.[0]?.plain_text || 'Unnamed Opportunity';
          const stage = properties.Stage?.select?.name || 'NEW';

          const existing = await oppRepo.findOne({ where: { name } });

          if (existing) {
            await oppRepo.update(existing.id, { name, stage });
          } else {
            await oppRepo.save({ name, stage });
          }
          syncedCount++;
        }

        return syncedCount;
      },
      { workspace: { id: workspaceId } } as unknown as WorkspaceAuthContext,
    );
  }

  private async syncTasks(
    workspaceId: string,
    notion: Client,
    databaseId: string,
  ): Promise<number> {
    const response = await notion.databases.query({ database_id: databaseId });
    const pages = response.results as Record<string, any>[];

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const taskRepo = await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          TaskWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );
        let syncedCount = 0;

        for (const page of pages) {
          const properties = page.properties as Record<string, any>;
          const title =
            properties.Name?.title?.[0]?.plain_text || 'Unnamed Task';
          const status = properties.Status?.status?.name || 'TODO';

          const existing = await taskRepo.findOne({ where: { title } });

          if (existing) {
            await taskRepo.update(existing.id, { title, status });
          } else {
            await taskRepo.save({ title, status });
          }
          syncedCount++;
        }

        return syncedCount;
      },
      { workspace: { id: workspaceId } } as unknown as WorkspaceAuthContext,
    );
  }

  async updateConfig(workspaceId: string, token: string) {
    await this.keyValuePairService.set({
      workspaceId,
      key: 'NOTION_INTEGRATION_TOKEN',
      type: KeyValuePairType.CONFIG_VARIABLE,
      value: { token },
    });

    return { success: true };
  }

  async updateDatabasesConfig(
    workspaceId: string,
    databases: Record<string, unknown>,
  ) {
    await this.keyValuePairService.set({
      workspaceId,
      key: 'NOTION_DATABASES',
      type: KeyValuePairType.CONFIG_VARIABLE,
      value: databases as any,
    });

    return { success: true };
  }

  async createOrUpdateCompanyInNotion(workspaceId: string, company: any) {
    const notion = await this.getNotionClient(workspaceId);

    if (!notion) return;

    const dbConfigs = await this.keyValuePairService.get({
      key: 'NOTION_DATABASES',
      type: KeyValuePairType.CONFIG_VARIABLE,
      workspaceId,
    });
    const databaseId = (dbConfigs[0]?.value as any)?.companiesId;

    if (!databaseId) return;

    const domain = company.domainName?.primaryLinkUrl;

    if (!domain) return;

    // Search for existing page by domain
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Domain',
        url: { equals: domain },
      },
    });

    const pageId = response.results[0]?.id;

    const properties: any = {
      Name: {
        title: [{ text: { content: company.name || 'Unnamed Company' } }],
      },
      Domain: {
        url: domain,
      },
    };

    if (company.address?.addressCity) {
      properties.Address = {
        rich_text: [{ text: { content: company.address.addressCity } }],
      };
    }

    if (pageId) {
      await notion.pages.update({ page_id: pageId, properties });
      this.logger.log(`Updated company ${company.name} in Notion`);
    } else {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties,
      });
      this.logger.log(`Created company ${company.name} in Notion`);
    }
  }

  async createOrUpdatePersonInNotion(workspaceId: string, person: any) {
    const notion = await this.getNotionClient(workspaceId);

    if (!notion) return;

    const dbConfigs = await this.keyValuePairService.get({
      key: 'NOTION_DATABASES',
      type: KeyValuePairType.CONFIG_VARIABLE,
      workspaceId,
    });
    const databaseId = (dbConfigs[0]?.value as any)?.peopleId;

    if (!databaseId) return;

    const email = person.emails?.primaryEmail;

    if (!email) return;

    // Search for existing page by email
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Email',
        email: { equals: email },
      },
    });

    const pageId = response.results[0]?.id;
    const fullName =
      `${person.name?.firstName || ''} ${person.name?.lastName || ''}`.trim() ||
      'Unnamed Person';

    const properties: any = {
      Name: {
        title: [{ text: { content: fullName } }],
      },
      Email: {
        email: email,
      },
    };

    if (pageId) {
      await notion.pages.update({ page_id: pageId, properties });
      this.logger.log(`Updated person ${fullName} in Notion`);
    } else {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties,
      });
      this.logger.log(`Created person ${fullName} in Notion`);
    }
  }
}
