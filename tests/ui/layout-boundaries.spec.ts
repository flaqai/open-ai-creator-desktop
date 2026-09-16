import { expect, test } from '@playwright/test';

const TOLERANCE = 1;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('flaq-creator-desktop-onboarding-complete', 'true');
  });
  await page.goto('/zh/image-to-image/');
  await page.locator('body').evaluate((body) => body.classList.add('desktop-app'));
  await page.locator('html').evaluate((html) => {
    html.classList.remove('dark');
    html.classList.add('light');
  });
});

test('visible controls stay inside the image generation form', async ({ page }) => {
  const form = page.getByTestId('image-generation-form');
  await expect(form).toBeVisible();

  const formBounds = await form.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left };
  });

  const overflow = await form
    .locator('button, input, textarea, select, [role="button"], [role="combobox"]')
    .evaluateAll(
      (elements, { boundary, tolerance }) =>
        elements.flatMap((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') {
            return [];
          }

          const sides = {
            left: boundary.left - rect.left,
            top: boundary.top - rect.top,
            right: rect.right - boundary.right,
            bottom: rect.bottom - boundary.bottom,
          };
          const escaped = Object.entries(sides).filter(([, amount]) => amount > tolerance);
          if (escaped.length === 0) return [];

          const name =
            element.getAttribute('data-testid') ||
            element.getAttribute('aria-label') ||
            element.getAttribute('name') ||
            element.tagName.toLowerCase();
          return [`${name}: ${escaped.map(([side, amount]) => `${side} ${amount.toFixed(2)}px`).join(', ')}`];
        }),
      { boundary: formBounds, tolerance: TOLERANCE },
    );

  expect(overflow, `Controls escaped the form boundary:\n${overflow.join('\n')}`).toEqual([]);
});

test('focused prompt field keeps its visual outline inside its rounded boundary', async ({ page }) => {
  const boundary = page.getByTestId('prompt-field-boundary');
  const textarea = page.getByTestId('prompt-textarea');
  const initialBorderColor = await boundary.evaluate((element) => getComputedStyle(element).borderColor);

  await textarea.click();
  await expect(textarea).toBeFocused();

  const result = await textarea.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const container = element.closest<HTMLElement>('[data-testid="prompt-field-boundary"]');
    if (!container) throw new Error('Prompt field boundary was not found');

    const boundaryRect = container.getBoundingClientRect();
    const style = getComputedStyle(element);
    const outlineWidth = style.outlineStyle === 'none' ? 0 : Number.parseFloat(style.outlineWidth) || 0;
    const outlineOffset = Number.parseFloat(style.outlineOffset) || 0;
    const outlineExtent = style.outlineStyle === 'none' ? 0 : Math.max(0, outlineWidth + outlineOffset);

    return {
      control: {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
      },
      visual: {
        top: rect.top - outlineExtent,
        right: rect.right + outlineExtent,
        bottom: rect.bottom + outlineExtent,
        left: rect.left - outlineExtent,
      },
      boundary: {
        top: boundaryRect.top,
        right: boundaryRect.right,
        bottom: boundaryRect.bottom,
        left: boundaryRect.left,
      },
      outline: {
        style: style.outlineStyle,
        width: outlineWidth,
        offset: outlineOffset,
      },
      borderColor: getComputedStyle(container).borderColor,
    };
  });

  const geometry = JSON.stringify(result, null, 2);
  expect(result.visual.left, geometry).toBeGreaterThanOrEqual(result.boundary.left - TOLERANCE);
  expect(result.visual.top).toBeGreaterThanOrEqual(result.boundary.top - TOLERANCE);
  expect(result.visual.right).toBeLessThanOrEqual(result.boundary.right + TOLERANCE);
  expect(result.visual.bottom).toBeLessThanOrEqual(result.boundary.bottom + TOLERANCE);
  expect(result.borderColor).not.toBe(initialBorderColor);
});
