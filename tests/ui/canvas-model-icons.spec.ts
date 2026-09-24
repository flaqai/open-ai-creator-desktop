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
  await picker.click();

  for (const [model, icon] of [
    ['Nano Banana Pro', '/images/model-icon/veo.svg'],
    ['Nano Banana Pro Edit', '/images/model-icon/veo.svg'],
    ['Nano Banana 2', '/images/model-icon/veo.svg'],
    ['Nano Banana 2 Edit', '/images/model-icon/veo.svg'],
    ['GPT Image 2', '/images/model-icon/openai.svg'],
    ['GPT Image 2 Edit', '/images/model-icon/openai.svg'],
    ['GPT Image 2 Client', '/images/model-icon/openai.svg'],
    ['GPT Image 2 Edit Client', '/images/model-icon/openai.svg'],
    ['ChatGPT Images 2.5', '/images/model-icon/openai.svg'],
  ] as const) {
    await expect(page.getByRole('option', { name: model, exact: true }).locator('img')).toHaveAttribute('src', icon);
  }

  await page.getByRole('option', { name: 'GPT Image 2', exact: true }).click();
  await expect(picker.locator('img')).toHaveAttribute('src', '/images/model-icon/openai.svg');
});
