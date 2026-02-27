import {
  Controller,
  Headers,
  InternalServerErrorException,
  Post,
  type RawBodyRequest,
  Req,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import * as crypto from 'crypto';

import type { Request } from 'express';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { NoPermissionGuard } from 'src/engine/core-modules/auth/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/core-modules/auth/guards/public-endpoint.guard';

@Controller('rest/integration/notion')
@UseFilters(RestApiExceptionFilter)
export class NotionWebhookController {
  @Post('webhook')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async handleWebhook(
    @Headers('x-notion-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const secret = process.env.NOTION_WEBHOOK_SECRET;

    if (!secret) {
      throw new UnauthorizedException('Webhook secret not configured');
    }

    if (!signature) {
      throw new UnauthorizedException('Missing Notion signature header');
    }

    if (!req.rawBody) {
      throw new InternalServerErrorException(
        'Raw body is required for webhook signature verification. Make sure rawBody is enabled in NestJS config.',
      );
    }

    const rawBody = req.rawBody.toString();
    const hmac = crypto.createHmac('sha256', secret);

    hmac.update(rawBody);
    const calculatedSignature = hmac.digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const calculatedBuffer = Buffer.from(calculatedSignature);

    if (
      signatureBuffer.length !== calculatedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, calculatedBuffer)
    ) {
      throw new UnauthorizedException('Invalid Notion signature');
    }

    return { success: true };
  }
}
