import { expect, test } from '@playwright/test';

const applicantUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'applicant@example.com',
  role: 'authenticated',
  aud: 'authenticated',
};

const openCycle = {
  id: '33333333-3333-4333-8333-333333333333',
  event_key: 'jackson-hacks-2026',
  opens_at: '2026-01-01T05:00:00.000Z',
  edits_close_at: '2099-11-21T13:00:00.000Z',
  closed_at: null,
};

async function mockApplicantSession(page) {
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = Buffer.from(JSON.stringify({
    sub: applicantUser.id,
    email: applicantUser.email,
    role: applicantUser.role,
    aud: applicantUser.aud,
    iat: now,
    exp: now + 3600,
    session_id: '22222222-2222-4222-8222-222222222222',
  })).toString('base64url');
  const session = {
    access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.test-signature`,
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: now + 3600,
    token_type: 'bearer',
    user: applicantUser,
  };

  await page.addInitScript((storedSession) => {
    window.localStorage.setItem('sb-127-auth-token', JSON.stringify(storedSession));
  }, session);
  return session;
}

async function mockOpenApplicationCycle(page) {
  await page.route('**/rest/v1/application_cycles*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(openCycle),
  }));
}

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

test('applicants can enter an Other grade level', async ({ page }) => {
  await mockApplicantSession(page);
  await mockOpenApplicationCycle(page);
  await page.route('**/rest/v1/applications*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.route('**/rest/v1/application_drafts*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));

  await page.goto('/Register');
  await page.getByLabel('Full Name').fill('Test Applicant');
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByLabel('School / Institution').fill('Test School');
  await page.getByRole('combobox', { name: 'Grade Level' }).click();
  await page.getByRole('option', { name: 'Other' }).click();
  const customGrade = page.getByLabel('Enter your grade level');
  await expect(customGrade).toBeVisible();
  await customGrade.fill('Year 1');
  await page.getByRole('combobox', { name: 'Coding Experience' }).click();
  await page.getByRole('option', { name: 'Beginner - Just starting out' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.getByLabel(/Tell us why you want to attend Jackson Hacks/)).toBeVisible();
});

test('applicants can save a draft, return to the dashboard, and resume it', async ({ page }) => {
  const session = await mockApplicantSession(page);
  await mockOpenApplicationCycle(page);
  let savedDraft = null;
  let savedRequest = null;

  await page.route('**/rest/v1/applications*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.route('**/rest/v1/admin_users*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.route('**/rest/v1/application_drafts*', (route) => {
    const wantsSingle = route.request().headers().accept?.includes('application/vnd.pgrst.object+json');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: savedDraft
        ? JSON.stringify(wantsSingle ? savedDraft : [savedDraft])
        : '[]',
    });
  });
  await page.route('**/rest/v1/rpc/save_application_draft', async (route) => {
    savedRequest = route.request().postDataJSON();
    savedDraft = {
      id: '44444444-4444-4444-8444-444444444444',
      cycle_id: openCycle.id,
      user_id: applicantUser.id,
      draft_data: savedRequest.p_draft,
      current_step: savedRequest.p_current_step,
      created_at: '2026-08-21T03:00:00.000Z',
      updated_at: '2026-08-21T03:00:00.000Z',
    };
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(savedDraft),
    });
  });

  await page.goto('/Register');
  await page.getByLabel('Full Name').fill('Saved Applicant');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('School / Institution').fill('Saved School');
  await page.getByRole('combobox', { name: 'Grade Level' }).click();
  await page.getByRole('option', { name: 'Other' }).click();
  await page.getByLabel('Enter your grade level').fill('Year 1');

  await page.evaluate((refreshedSession) => {
    const channel = new BroadcastChannel('sb-127-auth-token');
    channel.postMessage({ event: 'TOKEN_REFRESHED', session: refreshedSession });
    channel.close();
  }, session);
  await expect(page.getByLabel('School / Institution')).toHaveValue('Saved School');

  await page.getByRole('button', { name: 'Save Draft' }).click();
  await expect(page).toHaveURL('/Dashboard');
  expect(savedRequest.p_current_step).toBe(2);
  expect(savedRequest.p_draft.school).toBe('Saved School');
  expect(savedRequest.p_draft.grade_other).toBe('Year 1');
  await expect(page.getByText('Draft saved')).toBeVisible();
  await expect(page.getByText('Your answers are private and saved at step 2 of 5.')).toBeVisible();

  await page.getByRole('button', { name: 'Continue Application' }).click();
  await expect(page).toHaveURL('/Register');
  await expect(page.getByRole('heading', { name: 'Continue Your Application' })).toBeVisible();
  await expect(page.getByLabel('School / Institution')).toHaveValue('Saved School');
  await expect(page.getByLabel('Enter your grade level')).toHaveValue('Year 1');
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

test('footer document links open at the top of each page', async ({ page }) => {
  const documents = [
    ['Terms', '/terms'],
    ['Privacy', '/privacy'],
    ['Code of Conduct', '/code-of-conduct'],
    ['Waiver', '/waiver'],
    ['Prize Rules', '/prizes'],
  ];

  for (const [label, route] of documents) {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(route);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
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
