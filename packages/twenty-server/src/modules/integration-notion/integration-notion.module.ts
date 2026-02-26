import { Module } from '@nestjs/common';

import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';

import { NotionWebhookController } from './controllers/notion-webhook.controller';
import { NotionController } from './controllers/notion.controller';
import { NotionSyncService } from './services/notion-sync.service';

@Module({
  imports: [KeyValuePairModule],
  providers: [NotionSyncService],
  controllers: [NotionController, NotionWebhookController],
  exports: [NotionSyncService],
})
export class IntegrationNotionModule {}
