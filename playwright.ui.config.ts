import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ui',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  reporter: 'line',
  timeout: 30_000,
  projects: [
    {
      name: 'desktop-default',
      use: { viewport: { width: 1440, height: 920 } },
    },
    {
      name: 'desktop-minimum',
      use: { viewport: { width: 1040, height: 720 } },
    },
  ],
  use: {
    baseURL: 'http://localhost:3000',
    channel: 'chrome',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'NEXT_PUBLIC_FLAQ_DESKTOP_RUNTIME=true WATCHPACK_POLLING=true pnpm exec next dev --port 3000',
    url: 'http://localhost:3000/zh/image-to-image/',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
