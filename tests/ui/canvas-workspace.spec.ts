import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('flaq-creator-desktop-onboarding-complete', 'true');
  });
});

test('desktop canvas creates and restores a local project without generation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/zh/ai-canvas/');
  const createProject = page.getByRole('button', { name: '新建项目' }).first();
  await expect(createProject).toBeVisible();
  await createProject.click();
  await expect(page).toHaveURL(/\/zh\/ai-canvas\/editor\/\?id=/);

  const editor = page.getByLabel('无限画布工作空间');
  await expect(editor).toBeVisible();
  await page.getByRole('button', { name: '生成配置', exact: true }).click();
  await expect(editor.locator('button[title="双击重命名节点"]').filter({ hasText: '生成配置' })).toBeVisible();

  const geometry = await page.evaluate(() => ({
    viewport: innerWidth,
    pageWidth: document.documentElement.scrollWidth,
    editorLeft: document.querySelector('.canvas-editor-shell')?.getBoundingClientRect().left ?? -1,
    sidebarRight: document.querySelector('.desktop-sidebar')?.getBoundingClientRect().right ?? -1,
  }));
  expect(geometry.pageWidth).toBeLessThanOrEqual(geometry.viewport);
  expect(geometry.editorLeft).toBeGreaterThanOrEqual(geometry.sidebarRight - 1);

  await page.getByRole('button', { name: '画布项目' }).click();
  await expect(page.getByText('1 节点')).toBeVisible();
  await page.getByRole('button', { name: /打开: 未命名画布/ }).click();
  await expect(page.getByRole('button', { name: '生成配置 生成配置' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('canvas background menu creates a node and supports keyboard dismissal', async ({ page }) => {
  await page.goto('/zh/ai-canvas/');
  await page.getByRole('button', { name: '新建项目' }).first().click();
  const surface = page.getByTestId('infinite-canvas-surface');
  await expect(surface).toBeVisible();
  await surface.click({ button: 'right', position: { x: 320, y: 180 } });
  const menu = page.getByRole('menu', { name: /打开画布菜单|快捷菜单/ });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: '文本' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();

  await surface.click({ button: 'right', position: { x: 320, y: 180 } });
  await menu.getByRole('menuitem', { name: '文本' }).click();
  await expect(page.getByText('双击编辑文本')).toBeVisible();
});

test('right-button drag temporarily pans while the select tool stays active', async ({ page }) => {
  await page.goto('/zh/ai-canvas/');
  await page.getByRole('button', { name: '新建项目' }).first().click();
  const surface = page.getByTestId('infinite-canvas-surface');
  const world = surface.locator(':scope > .origin-top-left');
  const before = await world.getAttribute('style');
  const box = await surface.boundingBox();
  if (!box) throw new Error('Canvas surface has no layout box');

  const startX = box.x + box.width * 0.55;
  const startY = box.y + box.height * 0.4;
  await page.mouse.move(startX, startY);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(startX + Math.min(80, box.width * 0.15), startY + 50, { steps: 5 });
  await page.mouse.up({ button: 'right' });

  await expect(world).not.toHaveAttribute('style', before || '');
  await expect(page.getByLabel('选择', { exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('menu', { name: /打开画布菜单|快捷菜单/ })).toBeHidden();
});

test('pan tool preserves buttons inside canvas cards', async ({ page }) => {
  await page.goto('/zh/ai-canvas/');
  await page.getByRole('button', { name: '新建项目' }).first().click();
  await page.getByRole('button', { name: '生成配置', exact: true }).click();
  const configNode = page.locator('[data-node-id^="config-"]');
  const modeSwitch = configNode.locator('.canvas-config-mode');
  const video = modeSwitch.getByRole('button', { name: '视频', exact: true });

  await page.getByRole('button', { name: '移动' }).click();
  await video.click();

  await expect(video).toHaveAttribute('aria-pressed', 'true');
});

test('denied system clipboard access does not leak an unhandled shortcut error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/zh/ai-canvas/');
  await page.getByRole('button', { name: '新建项目' }).first().click();
  await expect(page.getByTestId('infinite-canvas-surface')).toBeVisible();
  await page.evaluate(() => {
    const state = window as Window & { __clipboardReadCalls?: number; __clipboardUnhandled?: number };
    state.__clipboardReadCalls = 0;
    state.__clipboardUnhandled = 0;
    window.addEventListener('unhandledrejection', () => {
      state.__clipboardUnhandled = (state.__clipboardUnhandled || 0) + 1;
    });
    const denied = () => {
      state.__clipboardReadCalls = (state.__clipboardReadCalls || 0) + 1;
      return Promise.reject(new DOMException('Clipboard permission denied', 'NotAllowedError'));
    };
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { read: denied, readText: denied },
    });
  });

  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true }));
  });
  await page.waitForTimeout(100);

  const clipboardState = await page.evaluate(() => {
    const state = window as Window & { __clipboardReadCalls?: number; __clipboardUnhandled?: number };
    return { calls: state.__clipboardReadCalls || 0, unhandled: state.__clipboardUnhandled || 0 };
  });
  expect(clipboardState).toEqual({ calls: 2, unhandled: 0 });
  expect(errors).toEqual([]);
});

test('desktop edit-menu shortcuts operate on canvas nodes', async ({ page }) => {
  await page.goto('/zh/ai-canvas/');
  await page.getByRole('button', { name: '新建项目' }).first().click();
  const surface = page.getByTestId('infinite-canvas-surface');
  await expect(surface).toBeVisible();
  await page.getByRole('button', { name: '文本', exact: true }).last().click();
  await expect(page.locator('[data-node-id^="text-"]')).toHaveCount(1);
  await page.waitForTimeout(250);

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('flaq:desktop-canvas-command', { detail: 'canvas_copy' }));
    window.dispatchEvent(new CustomEvent('flaq:desktop-canvas-command', { detail: 'canvas_paste' }));
  });

  await expect(page.locator('[data-node-id^="text-"]')).toHaveCount(2);
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('flaq:desktop-canvas-command', { detail: 'canvas_undo' }));
  });
  await expect(page.locator('[data-node-id^="text-"]')).toHaveCount(1);
});
