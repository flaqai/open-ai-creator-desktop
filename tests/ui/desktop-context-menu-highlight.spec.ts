import { expect, test } from '@playwright/test';

test('pointer hover removes the initial context menu highlight', async ({ page }) => {
  await page.goto('/zh/recommended-prompts/');
  await page.getByRole('button', { name: '先看看' }).click();
  await page.getByRole('heading', { name: '提示词素材库' }).click({ button: 'right' });

  const menu = page.getByRole('menu', { name: '快捷菜单' });
  const settings = menu.getByRole('menuitem', { name: '设置' });
  const history = menu.getByRole('menuitem', { name: '历史记录' });
  await expect(settings).toBeVisible();
  await history.hover();
  await expect(settings).toHaveAttribute('data-active', 'false');
  await expect(history).toHaveAttribute('data-active', 'true');

  const colors = await menu.evaluate((element) => {
    const first = element.querySelector<HTMLElement>('[data-action-id="settings"]');
    const second = element.querySelector<HTMLElement>('[data-action-id="history"]');
    return {
      first: first && getComputedStyle(first).backgroundColor,
      second: second && getComputedStyle(second).backgroundColor,
    };
  });
  expect(colors.first).not.toBe(colors.second);
});
