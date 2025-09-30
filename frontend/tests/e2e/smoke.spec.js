import { test, expect } from '@playwright/test';

test('home page loads', async ({ page, baseURL }) => {
  await page.goto(baseURL || '/');
  await expect(page).toHaveTitle(/./); // any non-empty title
  // Example: check something visible on your page
  await expect(page.locator('body')).toBeVisible();
});