import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('Load app, check dashboard, create and validate domain', async ({ page }) => {
  // Wait for the app to load. Since mock auth is true, it should immediately load the dashboard.
  await page.goto('/');

  // Dashboard should load (iframe with title "Analytics")
  await expect(page.locator('iframe[title="Analytics"]')).toBeVisible();

  // Navigate to Domains
  await page.getByRole('link', { name: 'Domains' }).click();
  await page.waitForURL('http://localhost:5174/domains');

  // Verify Domains page loaded
  await expect(page.locator('h1:has-text("Domains")')).toBeVisible();

  // Fill in the domain form
  const testDomain = `test.analiza.lan`;
  await page.locator('input[placeholder="example.com"]').fill(testDomain);
  await page.getByRole('button', { name: 'Add Domain' }).click();

  // Validate the domain appears in the list
  await expect(page.locator(`td:has-text("${testDomain}")`)).toBeVisible();
});
