import { expect, test } from '@playwright/test';

test('AI creator image history supports a visible detail delete and a confirmed context-menu delete', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('flaq-creator-desktop-onboarding-complete', 'true');
    localStorage.setItem(
      'FLAQ-SAAS-TEMPLATE-image-history',
      JSON.stringify([
        {
          id: 'delete-test-image',
          prompt: 'History image to remove',
          createTime: Date.now(),
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
          thumbnailUrl: '',
          resolution: '1x1',
          status: 'completed',
        },
      ]),
    );
  });

  await page.goto('/zh/ai-media-creator/');
  await page.getByRole('tab', { name: '图片' }).last().click();
  const card = page.getByRole('button', { name: '查看详情' }).first();
  await expect(card).toBeVisible();

  await card.click();
  await expect(page.getByRole('button', { name: '删除记录' })).toBeVisible();
  await page.keyboard.press('Escape');

  await card.click({ button: 'right' });
  await page.getByRole('menuitem', { name: '移除记录' }).click();
  await expect(page.getByText('移除这条历史记录？')).toBeVisible();
  await page.getByRole('alertdialog').getByRole('button', { name: '取消' }).click();
  await expect(card).toBeVisible();

  await card.click({ button: 'right' });
  await page.getByRole('menuitem', { name: '移除记录' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: '移除记录' }).click();
  await expect(card).toHaveCount(0);
});

test('AI creator video history offers the same confirmed context-menu deletion', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('flaq-creator-desktop-onboarding-complete', 'true');
    localStorage.setItem(
      'FLAQ-SAAS-TEMPLATE-video-history',
      JSON.stringify([
        {
          id: 'delete-test-video',
          traceId: 'delete-test-video',
          status: 'completed',
          platformName: 'seedance',
          categoryName: '',
          createTime: Date.now(),
          duration: 5,
          errorInfo: '',
          imageEndUrl: '',
          imageUrl: '',
          prompt: 'History video to remove',
          videoId: 'delete-test-video',
          videoThumbnailUrl: '',
          videoUrl: '/flaqai_saas_asserts/home/example/video/1.mp4',
          videoType: 'Text-to-video',
        },
      ]),
    );
  });

  await page.goto('/zh/ai-media-creator/');
  const card = page.getByRole('button', { name: '查看详情' }).first();
  await expect(card).toBeVisible();
  await card.click({ button: 'right' });
  await page.getByRole('menuitem', { name: '移除记录' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: '移除记录' }).click();
  await expect(card).toHaveCount(0);
});
