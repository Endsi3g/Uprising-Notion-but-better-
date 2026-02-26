import { Injectable, Logger } from '@nestjs/common';

import { google } from 'googleapis';

import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

@Injectable()
export class GoogleTasksSyncService {
  private readonly logger = new Logger(GoogleTasksSyncService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async syncTasks(workspaceId: string, accessToken: string) {
    this.logger.log(`Starting Google Tasks Sync for workspace ${workspaceId}`);
    const auth = new google.auth.OAuth2();

    auth.setCredentials({ access_token: accessToken });
    const tasksService = google.tasks({ version: 'v1', auth });

    try {
      // 1. Fetch the user's task lists
      const {
        data: { items: tasklists },
      } = await tasksService.tasklists.list({ maxResults: 10 });

      if (!tasklists || tasklists.length === 0) {
        return {
          success: true,
          message: 'No task lists found on Google Tasks',
          stats: { synced: 0 },
        };
      }

      // For simplicity, we sync the first (default) task list
      const firstTaskListId = tasklists[0].id;

      if (!firstTaskListId) {
        return { success: false, message: 'Google Tasks list missing ID.' };
      }

      // 2. Fetch tasks from the list
      const tasks: any[] = [];
      let pageToken: string | undefined = undefined;

      do {
        const response = await tasksService.tasks.list({
          tasklist: firstTaskListId,
          showCompleted: true,
          showHidden: true,
          pageToken,
        });

        if (response.data.items) {
          tasks.push(...response.data.items);
        }

        pageToken = response.data.nextPageToken || undefined;
      } while (pageToken);

      if (tasks.length === 0) {
        return {
          success: true,
          message: 'No tasks found to sync',
          stats: { synced: 0 },
        };
      }

      // 3. Save to Twenty ORM
      const syncedCount =
        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const taskRepo = await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              TaskWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );
            const taskTargetRepo =
              await this.globalWorkspaceOrmManager.getRepository(
                workspaceId,
                TaskTargetWorkspaceEntity,
                { shouldBypassPermissionChecks: true },
              );

            let count = 0;

            for (const task of tasks) {
              const title = task.title || 'Untitled Task';
              const status = task.status === 'completed' ? 'DONE' : 'TODO'; // Mapping Google status to Twenty status

              // Check if task exists locally based on externalId
              const existingTask = await taskRepo.findOne({
                where: { externalId: task.id },
              });

              let savedTask;

              if (existingTask) {
                await taskRepo.update(existingTask.id, {
                  title,
                  status,
                  externalId: task.id,
                });
                savedTask = existingTask;
              } else {
                savedTask = await taskRepo.save({
                  title,
                  status,
                  externalId: task.id,
                });
              }

              // Create target link if it doesn't exist
              const existingTarget = await taskTargetRepo.findOne({
                where: { taskId: savedTask.id },
              });

              if (!existingTarget) {
                await taskTargetRepo.save({
                  taskId: savedTask.id,
                });
              }

              count++;
            }

            return count;
          },
          { workspace: { id: workspaceId } } as unknown as WorkspaceAuthContext,
        );

      return {
        success: true,
        message: 'Google Tasks Sync completed',
        stats: { synced: syncedCount },
      };
    } catch (error) {
      this.logger.error(
        `Error syncing Google Tasks: ${(error as Error).message}`,
        (error as Error).stack,
      );

      return {
        success: false,
        message: 'Google Tasks API error',
        error: (error as Error).message,
      };
    }
  }
}
