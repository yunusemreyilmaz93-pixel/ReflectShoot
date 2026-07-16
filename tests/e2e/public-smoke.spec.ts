import { expect, test } from '@playwright/test';

/**
 * Functional smoke — no visual snapshots.
 * Asserts routes render key chrome without requiring live Firebase data.
 */
test.beforeEach(async ({ page }) => {
  // Avoid flaky live backend noise; app should still shell-render.
  await page.route('https://firestore.googleapis.com/**', (route) => route.abort());
  await page.route('https://identitytoolkit.googleapis.com/**', (route) => route.abort());
  await page.route('https://securetoken.googleapis.com/**', (route) => route.abort());
  await page.route('**/api/public-showcase', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ applications: [], scores: {} }),
    });
  });
});

const publicRoutes = [
  { path: '/#/', heading: /Reflect|Shoot|Yarışma|Başvuru/i },
  { path: '/#/about', heading: /hakkında|kural|yarışma/i },
  { path: '/#/academy', heading: /akademi|eğitim|atölye/i },
  { path: '/#/faq', heading: /soru|sss|faq/i },
  { path: '/#/login', heading: /giriş|e-posta|şifre/i },
  { path: '/#/apply', heading: /kayıt|başvuru|öğretmen/i },
];

for (const route of publicRoutes) {
  test(`smoke: ${route.path} loads shell`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    // Navbar brand or main landmark should exist
    const body = page.locator('body');
    await expect(body).toBeVisible();
    // Page has interactive chrome (nav or form or main content)
    const hasChrome =
      (await page.locator('nav, header, main, form, h1, h2').count()) > 0;
    expect(hasChrome).toBeTruthy();
    // Soft content signal (Turkish product language)
    const text = await page.locator('body').innerText();
    expect(text.length).toBeGreaterThan(20);
  });
}

test('smoke: protected /#/dashboard redirects unauthenticated users to login', async ({
  page,
}) => {
  await page.goto('/#/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  // HashRouter: expect login form fields or login path text
  const url = page.url();
  const onLogin =
    url.includes('/login') ||
    (await page.getByRole('button', { name: /giriş|login/i }).count()) > 0 ||
    (await page.locator('input[type="email"], input[type="password"]').count()) > 0;
  expect(onLogin).toBeTruthy();
});

test('smoke: protected /#/admin redirects unauthenticated users', async ({ page }) => {
  await page.goto('/#/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const url = page.url();
  const gated =
    url.includes('/login') ||
    (await page.locator('input[type="email"], input[type="password"]').count()) > 0 ||
    (await page.getByText(/giriş|e-posta/i).count()) > 0;
  expect(gated).toBeTruthy();
});

test('smoke: /#/jury redirects unauthenticated users', async ({ page }) => {
  await page.goto('/#/jury', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const url = page.url();
  const gated =
    url.includes('/login') ||
    (await page.locator('input[type="email"], input[type="password"]').count()) > 0;
  expect(gated).toBeTruthy();
});
