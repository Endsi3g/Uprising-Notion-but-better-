import { z } from 'zod';

export const BrowserToolInputZodSchema = z.object({
  url: z.string().describe('The URL to navigate to and extract content from'),
  waitForSelector: z
    .string()
    .optional()
    .describe(
      'Optional CSS selector to wait for before extracting content (e.g., "#main-content")',
    ),
  extractMode: z
    .enum(['text', 'html', 'screenshot'])
    .default('text')
    .describe(
      'What to extract: "text" for visible text, "html" for full HTML, "screenshot" for base64 PNG',
    ),
  timeout: z
    .number()
    .optional()
    .default(30000)
    .describe('Navigation timeout in milliseconds (default: 30000)'),
});
