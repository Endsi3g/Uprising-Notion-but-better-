import { Injectable, Logger } from '@nestjs/common';

import puppeteer from 'puppeteer-core';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { BrowserToolInputZodSchema } from 'src/engine/core-modules/tool/tools/browser-tool/browser-tool.schema';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';

interface BrowserToolInput {
  url: string;
  waitForSelector?: string;
  extractMode: 'text' | 'html' | 'screenshot';
  timeout: number;
}

@Injectable()
export class BrowserTool implements Tool {
  private readonly logger = new Logger(BrowserTool.name);

  description =
    'Navigate to a web page using a headless browser (Browserless + Puppeteer) and extract its text content, HTML, or take a screenshot. Useful for scraping dynamic pages that require JavaScript rendering.';
  inputSchema = BrowserToolInputZodSchema;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async execute(
    parameters: ToolInput,
    _context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { url, waitForSelector, extractMode, timeout } =
      parameters as BrowserToolInput;

    const browserlessUrl = this.twentyConfigService.get('BROWSERLESS_URL');

    if (!browserlessUrl) {
      return {
        success: false,
        message: 'Browserless is not configured',
        error:
          'BROWSERLESS_URL environment variable is not set. Please configure a Browserless instance.',
      };
    }

    const token = this.twentyConfigService.get('BROWSERLESS_TOKEN');
    const wsEndpoint = token
      ? `${browserlessUrl}?token=${token}`
      : browserlessUrl;

    let browser: Awaited<ReturnType<typeof puppeteer.connect>> | null = null;

    try {
      browser = await puppeteer.connect({
        browserWSEndpoint: wsEndpoint,
      });

      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout,
      });

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout });
      }

      let result: string;

      switch (extractMode) {
        case 'text': {
          result = (await page.evaluate(
            () => document.body?.innerText || '',
          )) as string;
          break;
        }
        case 'html': {
          result = await page.content();
          break;
        }
        case 'screenshot': {
          const screenshotBuffer = await page.screenshot({
            encoding: 'base64',
            fullPage: true,
          });

          result =
            typeof screenshotBuffer === 'string'
              ? screenshotBuffer
              : Buffer.from(screenshotBuffer).toString('base64');
          break;
        }
      }

      await page.close();

      return {
        success: true,
        message: `Successfully extracted ${extractMode} content from ${url}`,
        result,
      };
    } catch (error) {
      this.logger.error(
        `Browser tool failed for URL ${url}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        success: false,
        message: `Failed to extract content from ${url}`,
        error:
          error instanceof Error ? error.message : 'Browser navigation failed',
      };
    } finally {
      if (browser) {
        try {
          browser.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }
    }
  }
}
