import { Module } from '@nestjs/common';
import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { NotionController } from './controllers/notion.controller';
import { NotionSyncService } from './services/notion-sync.service';

@Module({
  imports: [KeyValuePairModule],
  providers: [NotionSyncService],
  controllers: [NotionController],
  exports: [NotionSyncService],
})
export class IntegrationNotionModule {}
