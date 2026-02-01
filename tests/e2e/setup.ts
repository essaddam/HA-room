import { chromium, Browser, Page } from '@playwright/test';
import { TEST_CREDENTIALS, DEFAULT_TEST_CONFIG } from './test-credentials';

export async function setupBrowser(): Promise<Browser> {
  return await chromium.launch(DEFAULT_TEST_CONFIG);
}

export async function loginToHA(page: Page, url: string = 'http://localhost:8123'): Promise<void> {
  await page.goto(url);
  await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
  await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

export async function navigateToLovelace(page: Page): Promise<void> {
  await page.goto('http://localhost:8123/lovelace');
  await page.waitForLoadState('networkidle');
}