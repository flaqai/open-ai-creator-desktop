import { expect, test } from '@playwright/test';

test('a desktop history upload can be removed without deleting its remote URL', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('flaq-creator-desktop-onboarding-complete', 'true');
    localStorage.setItem(
      'FLAQ-CREATOR-DESKTOP-media-library-uploads-v1',
      JSON.stringify({
        version: 1,
        items: [
          {
            id: 'upload:https://storage.flaq.ai/test/reference.png',
            url: 'https://storage.flaq.ai/test/reference.png',
            name: 'reference.png',
            mimeType: 'image/png',
            kind: 'image',
            createdAt: Date.now(),
          },
        ],
      }),
    );
  });
  await page.goto('/zh/');
  await page.getByRole('button', { name: '设置', exact: true }).click();
  await page.getByRole('button', { name: '历史记录' }).click();
  await page.getByRole('button', { name: /reference\.png/ }).click();
  await page.getByRole('button', { name: '移除记录' }).click();
  await expect(page.getByText('移除这条历史记录？')).toBeVisible();
  await page.getByRole('alertdialog').getByRole('button', { name: '移除记录' }).click();
  await expect(page.getByText('这里还没有匹配的素材')).toBeVisible();
  await expect(page.getByText('已从本机历史记录移除')).toBeVisible();
});
