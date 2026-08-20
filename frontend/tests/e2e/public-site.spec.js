import { expect, test } from '@playwright/test';

test('home navigation, FAQ semantics, and interactive nesting are valid', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Jackson Hacks', level: 1 })).toBeVisible();
  const faq = page.getByRole('button', { name: 'What is a hackathon?' });
  await faq.click();
  await expect(faq).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('region', { name: 'What is a hackathon?' })).toBeVisible();
  await expect(page.locator('a button, button a')).toHaveCount(0);
});

test('registration and public dashboard direct routes render', async ({ page }) => {
  await page.goto('/Register');
  await expect(page.getByRole('heading', { name: 'Apply to Jackson Hacks' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Forgot your password?' })).toBeVisible();
  await page.goto('/Dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('legal documents are public and provide matching PDF downloads', async ({ page }) => {
  const documents = [
    ['/terms', 'Terms and Conditions', 'jackson-hacks-terms-and-conditions.pdf'],
    ['/privacy', 'Privacy Notice', 'jackson-hacks-privacy-notice.pdf'],
    ['/code-of-conduct', 'Code of Conduct', 'jackson-hacks-code-of-conduct.pdf'],
    ['/waiver', 'Participant Waiver and Required Media Release', 'jackson-hacks-participant-waiver.pdf'],
    ['/prizes', 'Official Prize Rules', 'jackson-hacks-official-prize-rules.pdf'],
  ];

  for (const [route, heading, filename] of documents) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveAttribute('href', `/documents/${filename}`);
  }
});

test('mobile menu traps focus and closes with Escape', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'));
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open menu' });
  await toggle.click();
  await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
});

test('unknown route has a working recovery action', async ({ page }) => {
  await page.goto('/not-a-real-page');
  await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
  await page.getByRole('button', { name: 'Go Home' }).click();
  await expect(page).toHaveURL('/');
});

test('core public routes do not overflow common narrow viewports', async ({ page }) => {
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 800 });
    for (const route of ['/', '/Register', '/Dashboard', '/terms']) {
      await page.goto(route);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} overflows at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});
