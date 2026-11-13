import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('Load app, check dashboard, create and validate domain', async ({ page }) => {
  // Wait for the app to load. Since mock auth is true, it should immediately load the dashboard.
  await page.goto('/');

  // With no domains yet, the dashboard shows the getting started flow instead of the iframe
  await expect(page.getByRole('heading', { name: 'Get started' })).toBeVisible();
  await expect(page.locator('iframe[title="Analytics"]')).toHaveCount(0);

  // Navigate to Domains
  await page.getByRole('link', { name: 'Domains' }).click();
  await page.waitForURL('http://localhost:5174/domains');

  // Verify Domains page loaded
  await expect(page.locator('h1:has-text("Domains")')).toBeVisible();

  // Fill in the domain form
  const testDomain = `test.analiza.lan`;
  await page.locator('input[placeholder="example.com"]').fill(testDomain);
  await page.getByRole('button', { name: 'Add domain' }).click();

  // Validate the domain appears in the list
  await expect(page.locator(`td:has-text("${testDomain}")`)).toBeVisible();

  // The install section of the new domain expands automatically
  await expect(page.getByRole('tab', { name: 'WordPress' })).toBeVisible();
});

test('Export page opens from nav and validates the email inline', async ({ page }) => {
  // Mock the export_requests API so this test runs without the full stack.
  await page.route('**/export_requests**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });

  await page.goto('/');

  // Navigate to Export via the nav link
  await page.getByRole('link', { name: 'Export' }).click();
  await page.waitForURL('http://localhost:5174/export');
  await expect(page.locator('h1:has-text("Export")')).toBeVisible();

  // The email input is prefilled with the mocked Auth0 user's email
  const emailInput = page.locator('#export-email');
  await expect(emailInput).toHaveValue('test@analiza.dev');

  // An invalid email shows an inline validation error and does not submit
  await emailInput.fill('not-an-email');
  await page.getByRole('button', { name: 'Request export' }).click();
  await expect(page.getByRole('alert')).toContainText("doesn't look like a valid email address");

  // A valid email submits successfully
  await emailInput.fill('test@analiza.dev');
  await page.getByRole('button', { name: 'Request export' }).click();
  await expect(page.getByText('Export requested.')).toBeVisible();
});

test('Layout shows a Support link to the prefilled GitHub issue form', async ({ page }) => {
  // Mock auth is on, so loading the app lands directly in the layout.
  await page.goto('/');

  const support = page.getByRole('link', { name: 'Support' });
  await expect(support).toBeVisible();
  await expect(support).toHaveAttribute('href', 'https://github.com/ecyshor/analiza/issues/new?template=support.yml');
  await expect(support).toHaveAttribute('target', '_blank');
});
