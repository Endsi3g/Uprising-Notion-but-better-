import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { NotionSyncService } from 'src/modules/integration-notion/services/notion-sync.service';

@Controller('rest/integration/notion')
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
@UseFilters(RestApiExceptionFilter)
export class NotionController {
  constructor(private readonly notionSyncService: NotionSyncService) {}

  @Post('sync')
  async triggerSync(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.notionSyncService.syncWorkspace(workspace.id);
  }

  @Post('config')
  async updateConfig(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Body() config: { token: string },
  ) {
    return this.notionSyncService.updateConfig(workspace.id, config.token);
  }

  @Post('databases')
  async updateDatabasesConfig(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Body()
    config: {
      companiesId?: string;
      peopleId?: string;
      opportunitiesId?: string;
      tasksId?: string;
    },
  ) {
    return this.notionSyncService.updateDatabasesConfig(workspace.id, config);
  }
}
