import { Body, Controller, Headers, Post, RawBodyRequest, Req, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';

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

  @Post('webhook')
  async handleWebhook(
    @Headers('x-notion-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const secret = process.env.NOTION_WEBHOOK_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Webhook secret not configured');
    }

    const rawBody = req.rawBody?.toString() || JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest('hex');

    if (signature !== calculatedSignature) {
      throw new UnauthorizedException('Invalid Notion signature');
    }

    return { success: true };
  }
}
