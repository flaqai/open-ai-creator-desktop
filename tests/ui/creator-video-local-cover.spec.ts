import { expect, test } from '@playwright/test';

test('archived video frame remains visible after image history finishes loading', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: {
        invoke: async (command: string) => {
          if (command === 'register_canvas_media_path') return undefined;
          return undefined;
        },
        convertFileSrc: () => '/flaqai_saas_asserts/home/example/video/1.mp4',
        transformCallback: () => 1,
        unregisterCallback: () => {},
      },
    });
    localStorage.setItem('flaq-creator-desktop-onboarding-complete', 'true');
    localStorage.setItem(
      'FLAQ-SAAS-TEMPLATE-video-history',
      JSON.stringify([
        {
          id: 'local-cover-ui-video',
          traceId: 'local-cover-ui-video',
          status: 'completed',
          platformName: 'seedance',
          categoryName: '',
          createTime: Date.now(),
          duration: 4,
          errorInfo: '',
          imageEndUrl: '',
          imageUrl: '',
          prompt: 'Local video cover',
          videoId: 'local-cover-ui-video',
          videoThumbnailUrl: 'https://assets.example.test/cover.jpg',
          coverImage: 'https://assets.example.test/cover.jpg',
          videoUrl: 'https://assets.example.test/video.mp4',
          localPath: '/archive/local-cover-ui-video.mp4',
          archiveStatus: 'saved',
          videoType: 'Text-to-video',
        },
      ]),
    );
    localStorage.setItem(
      'FLAQ-SAAS-TEMPLATE-image-history',
      JSON.stringify([
        {
          id: 'local-cover-ui-image',
          prompt: 'History image',
          createTime: Date.now(),
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
          thumbnailUrl: '',
          resolution: '1x1',
          status: 'completed',
        },
      ]),
    );
  });

  await page.route('https://assets.example.test/**', (route) => route.abort());
  await page.goto('/zh/ai-media-creator/');
  const videoTab = page.getByRole('tab', { name: '视频' }).last();
  const imageTab = page.getByRole('tab', { name: '图片' }).last();
  await videoTab.click();
  const cover = page.getByRole('button', { name: '查看详情' }).first().locator('img[src^="blob:"]');
  await expect(cover).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  await imageTab.click();
  const image = page.getByRole('button', { name: '查看详情' }).first().locator('img');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  await videoTab.click();
  await expect(cover).toBeVisible();
  await expect.poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});
