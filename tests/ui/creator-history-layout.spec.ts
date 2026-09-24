import { expect, test } from '@playwright/test';

test('history cards keep multiple columns after switching between image and video', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    localStorage.setItem('flaq-creator-desktop-onboarding-complete', 'true');
    const videoUrl = '/flaqai_saas_asserts/home/example/video/1.mp4';
    localStorage.setItem(
      'FLAQ-SAAS-TEMPLATE-video-history',
      JSON.stringify(
        Array.from({ length: 30 }, (_, index) => ({
          id: `layout-video-${index}`,
          traceId: `layout-video-${index}`,
          status: 'completed',
          platformName: 'seedance',
          categoryName: '',
          createTime: index,
          duration: 4,
          errorInfo: '',
          imageEndUrl: '',
          imageUrl: '',
          prompt: `Layout video ${index}`,
          videoId: `layout-video-${index}`,
          videoThumbnailUrl: '',
          videoUrl: index % 3 === 0 ? '' : videoUrl,
          videoType: 'Text-to-video',
        })),
      ),
    );
    localStorage.setItem(
      'FLAQ-SAAS-TEMPLATE-image-history',
      JSON.stringify(
        Array.from({ length: 30 }, (_, index) => ({
          id: `layout-image-${index}`,
          prompt: `Layout image ${index}`,
          createTime: index,
          url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="500"><rect width="100" height="500" fill="#777"/></svg>')}`,
          thumbnailUrl: '',
          resolution: '1:1',
          status: 'completed',
        })),
      ),
    );
  });

  await page.goto('/zh/ai-media-creator/');
  const history = page.getByRole('heading', { name: '生成历史' }).locator('xpath=ancestor::section[1]');
  const tabs = history.getByRole('tab');
  const captions = history.locator('p.line-clamp-2');

  for (let index = 0; index < 4; index += 1) {
    await tabs.getByText(index % 2 === 0 ? '图片' : '视频').click();
    await page.waitForTimeout(100);
    const widths = await history.evaluate((section) => {
      const gallery = Array.from(section.querySelectorAll<HTMLElement>('div[style*="column-width"]')).at(-1);
      return { gallery: gallery?.scrollWidth ?? 0, section: section.clientWidth };
    });
    expect(widths.gallery, `switch ${index} should not expand the gallery beyond its section`).toBeLessThanOrEqual(
      widths.section + 1,
    );
    await page.waitForTimeout(550);
    expect(await captions.count()).toBeGreaterThan(1);
    const leftEdges = await captions.evaluateAll((elements) =>
      elements.map((element) => Math.round(element.closest('.inline-block')!.getBoundingClientRect().left)),
    );
    expect(new Set(leftEdges).size, `switch ${index} should keep a full-width history grid`).toBeGreaterThanOrEqual(3);
  }

  await tabs.getByText('图片').click();
  await page.waitForTimeout(550);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(captions).toHaveCount(30);
  await tabs.getByText('视频').click();
  await tabs.getByText('图片').click();
  await page.waitForTimeout(550);
  await expect(captions).toHaveCount(30);
});
