import { expect, test } from '@playwright/test';

const pages = [
  { name: 'home', path: '/#/' },
  { name: 'about', path: '/#/about' },
  { name: 'academy', path: '/#/academy' },
  { name: 'finals', path: '/#/finals' },
  { name: 'gallery', path: '/#/gallery' },
  { name: 'faq', path: '/#/faq' },
  { name: 'apply', path: '/#/apply' },
  { name: 'login', path: '/#/login' },
];

test.beforeEach(async ({ page }) => {
  await page.route('https://firestore.googleapis.com/**', (route) => route.abort());
  await page.route('https://*.firebaseio.com/**', (route) => route.abort());
  await page.route('https://picsum.photos/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="650"><rect width="100%" height="100%" fill="#0f172a"/></svg>',
    })
  );

});

for (const publicPage of pages) {
  test(`${publicPage.name} visual identity`, async ({ page }) => {
    await page.goto(publicPage.path, { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          caret-color: transparent !important;
        }
      `,
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(750);

    await expect(page).toHaveScreenshot(`${publicPage.name}.png`, {
      fullPage: true,
    });
  });
}
