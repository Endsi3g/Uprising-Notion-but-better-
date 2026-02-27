import { Injectable, Logger } from '@nestjs/common';

import {
  DatabaseEventAction,
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { NotionSyncService } from 'src/modules/integration-notion/services/notion-sync.service';

@Injectable()
export class NotionPushListener {
  private readonly logger = new Logger(NotionPushListener.name);

  constructor(private readonly notionSyncService: NotionSyncService) {}

  @OnDatabaseBatchEvent('company', DatabaseEventAction.CREATED)
  async handleCompanyCreated(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    this.logger.log(
      `Handling company created event for workspace ${payload.workspaceId}`,
    );
    for (const event of payload.events) {
      await this.notionSyncService.createOrUpdateCompanyInNotion(
        payload.workspaceId,
        event.properties.after,
      );
    }
  }

  @OnDatabaseBatchEvent('company', DatabaseEventAction.UPDATED)
  async handleCompanyUpdated(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    this.logger.log(
      `Handling company updated event for workspace ${payload.workspaceId}`,
    );
    for (const event of payload.events) {
      await this.notionSyncService.createOrUpdateCompanyInNotion(
        payload.workspaceId,
        event.properties.after,
      );
    }
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.CREATED)
  async handlePersonCreated(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    this.logger.log(
      `Handling person created event for workspace ${payload.workspaceId}`,
    );
    for (const event of payload.events) {
      await this.notionSyncService.createOrUpdatePersonInNotion(
        payload.workspaceId,
        event.properties.after,
      );
    }
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.UPDATED)
  async handlePersonUpdated(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    this.logger.log(
      `Handling person updated event for workspace ${payload.workspaceId}`,
    );
    for (const event of payload.events) {
      await this.notionSyncService.createOrUpdatePersonInNotion(
        payload.workspaceId,
        event.properties.after,
      );
    }
  }
}
