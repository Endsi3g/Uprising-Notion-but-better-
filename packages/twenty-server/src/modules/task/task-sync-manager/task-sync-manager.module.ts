import { Module } from '@nestjs/common';

import { GoogleTasksSyncService } from './drivers/google-tasks/google-tasks-sync.service';

@Module({
  imports: [],
  providers: [GoogleTasksSyncService],
  exports: [GoogleTasksSyncService],
})
export class TaskSyncManagerModule {}
