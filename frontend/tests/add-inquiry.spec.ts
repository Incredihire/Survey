import { test, expect } from '@playwright/test';
import * as crypto from "crypto";

test.describe('AddInquiry Component', () => {
  // skipping for now because this will hit the real db
  test.skip('should submit a new inquiry', async ({ page }) => {
    await page.goto('/inquiries');
    await page.locator('button').getByText(/Add[\s\n]+Inquiry/).click();
    await page.fill('textarea[name="text"]', 'Why do birds suddenly appear every time you are near?');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Inquiry created successfully.')).toBeVisible();
  });

  test('should show required error', async ({ page }) => {
    await page.goto('/inquiries');
    await page.locator('button').getByText(/Add[\s\n]+Inquiry/).click();
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Inquiry text is required.')).toBeVisible();
  });

  test('should show min length error', async ({ page }) => {
    await page.goto('/inquiries');
    await page.locator('button').getByText(/Add[\s\n]+Inquiry/).click();
    await page.fill('textarea[name="text"]', 'Why do?');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Inquiry must be at least 10 characters.')).toBeVisible();
  });

  test('should show max length error', async ({ page }) => {
    await page.goto('/inquiries');
    await page.locator('button').getByText(/Add[\s\n]+Inquiry/).click();
    await page.fill('textarea[name="text"]', 'Why?'.repeat(100));
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Inquiry can not be greater than 255 characters.')).toBeVisible();
  });
  test('should show capitalization error', async ({ page }) => {
    await page.goto('/inquiries');
    await page.locator('button').getByText(/Add[\s\n]+Inquiry/).click();
    await page.fill('textarea[name="text"]', 'why do birds suddenly appear every time you are near?');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Inquiry must start with a capital letter.')).toBeVisible();
  });
  // skipping for now because this will hit the real db
  test.skip('should not allow duplicate inquiries', async ({ page }) => {
    await page.goto('/inquiries');
    await page.locator('button').getByText(/Add[\s\n]+Inquiry/).click();
    await page.fill('textarea[name="text"]', 'Why do birds suddenly appear every time you are near?');
    await page.click('button[type="submit"]');
    await page.locator('button').getByText(/Add[\s\n]+Inquiry/).click();
    await page.fill('textarea[name="text"]', 'Why do birds suddenly appear every time you are near?');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=This inquiry already exists.')).toBeVisible();
  });
});
