import { expect, test } from '@playwright/test';

for (const route of ['/zh/text-to-image/', '/zh/text-to-video/']) {
  test(`${route} keeps nested panes scrollable without extra visible scrollbars`, async ({ page }) => {
    await page.goto(route);
    const inner = page.locator('main .desktop-inner-scrollbar').first();
    const sidebar = page.locator('.desktop-sidebar nav');
    await expect(inner).toBeVisible();
    await expect(sidebar).toBeVisible();

    const before = await page.evaluate(() => {
      const inner = document.querySelector('main .desktop-inner-scrollbar') as HTMLElement;
      const sidebar = document.querySelector('.desktop-sidebar nav') as HTMLElement;
      return {
        innerOverflow: inner.scrollHeight > inner.clientHeight,
        sidebarOverflow: sidebar.scrollHeight > sidebar.clientHeight,
        innerScrollbar: getComputedStyle(inner).scrollbarWidth,
        sidebarScrollbar: getComputedStyle(sidebar).scrollbarWidth,
        outerScrollbar: getComputedStyle(document.documentElement).scrollbarWidth,
        outerColor: getComputedStyle(document.documentElement).scrollbarColor,
      };
    });
    expect(before.innerScrollbar).toBe('none');
    expect(before.sidebarScrollbar).toBe('none');
    expect(before.outerScrollbar).toBe('thin');
    expect(before.outerColor).not.toBe('auto');

    if (before.innerOverflow) {
      await inner.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      expect(await inner.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    }
    if (before.sidebarOverflow) {
      await sidebar.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      expect(await sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    }
  });
}
