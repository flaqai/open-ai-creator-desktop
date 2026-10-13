import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('flaq-creator-desktop-onboarding-complete', 'true');
  });
});

test('canvas image model picker shows provider icons for Google and OpenAI variants', async ({ page }) => {
  await page.goto('/zh/ai-canvas/');
  await page.getByRole('button', { name: '新建项目' }).first().click();
  await page.getByRole('button', { name: '生成配置', exact: true }).click();

  const picker = page.locator('.canvas-composer-model-picker').first();
  await expect(picker).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  });
  await picker.click();

  for (const [model, icon] of [
    ['Nano Banana Pro', '/images/model-icon/veo.svg'],
    ['Nano Banana 2', '/images/model-icon/veo.svg'],
    ['GPT Image 2', '/images/model-icon/openai.svg'],
    ['GPT Image 2 Client', '/images/model-icon/openai.svg'],
    ['ChatGPT Images 2.5', '/images/model-icon/openai.svg'],
  ] as const) {
    const visibleIcon = page.getByRole('option', { name: model, exact: true }).locator('img:visible');
    await expect(visibleIcon).toHaveAttribute('src', icon.includes('veo') ? '/images/model-icon/veo-light.svg' : icon);
  }
  await expect(page.getByRole('option', { name: 'Nano Banana Pro Edit', exact: true })).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'GPT Image 2 Edit', exact: true })).toHaveCount(0);

  const lightOpenAi = page.getByRole('option', { name: 'GPT Image 2', exact: true }).locator('img:visible');
  await expect(lightOpenAi).toHaveCSS('filter', 'invert(1)');

  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  });
  await expect(
    page.getByRole('option', { name: 'Nano Banana Pro', exact: true }).locator('img:visible'),
  ).toHaveAttribute('src', '/images/model-icon/veo.svg');
  await expect(page.getByRole('option', { name: 'GPT Image 2', exact: true }).locator('img:visible')).toHaveCSS(
    'filter',
    'none',
  );

  await page.getByRole('option', { name: 'GPT Image 2', exact: true }).click();
  await expect(picker.locator('img:visible')).toHaveAttribute('src', '/images/model-icon/openai.svg');
});
