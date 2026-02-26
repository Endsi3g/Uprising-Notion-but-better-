import { Module } from '@nestjs/common';

import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { FavoriteFolderModule } from 'src/modules/favorite-folder/favorite-folder.module';
import { FavoriteModule } from 'src/modules/favorite/favorite.module';
import { IntegrationNotionModule } from 'src/modules/integration-notion/integration-notion.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { TaskSyncManagerModule } from 'src/modules/task/task-sync-manager/task-sync-manager.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/workspace-member.module';

@Module({
  imports: [
    MessagingModule,
    CalendarModule,
    ConnectedAccountModule,
    WorkflowModule,
    FavoriteFolderModule,
    FavoriteModule,
    WorkspaceMemberModule,
    IntegrationNotionModule,
    TaskSyncManagerModule,
  ],
  providers: [],
  exports: [],
})
export class ModulesModule {}
