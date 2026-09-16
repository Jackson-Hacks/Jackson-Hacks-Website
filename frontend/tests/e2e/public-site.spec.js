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
  launched_at: '2026-08-01T12:00:00.000Z',
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
  await mockOpenApplicationCycle(page);
  await page.goto('/Register');
  await expect(page.getByRole('heading', { name: 'Apply to Jackson Hacks' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Forgot your password?' })).toBeVisible();
  await page.goto('/Dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('registration stays on the coming-soon page before an admin launches it', async ({ page }) => {
  await page.route('**/rest/v1/application_cycles*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ...openCycle, launched_at: null, closed_at: new Date().toISOString() }),
  }));

  await page.goto('/Register');
  await expect(page.getByRole('heading', { name: 'Applications Opening Soon' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Apply to Jackson Hacks' })).toHaveCount(0);
});

test('an admin can launch applications without a redeployment', async ({ page }) => {
  await mockApplicantSession(page);
  let cycle = { ...openCycle, launched_at: null, closed_at: new Date().toISOString() };
  let toggleRequest = null;

  await page.route('**/rest/v1/application_cycles*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(cycle),
  }));
  await page.route('**/rest/v1/applications*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('**/rest/v1/application_drafts*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('**/rest/v1/admin_users*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ user_id: applicantUser.id }]),
  }));
  await page.route('**/rest/v1/application_reviews*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('**/rest/v1/rpc/set_application_window_closed', (route) => {
    toggleRequest = route.request().postDataJSON();
    cycle = {
      ...cycle,
      launched_at: new Date().toISOString(),
      closed_at: null,
      closed_by: null,
    };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(cycle) });
  });

  await page.goto('/Dashboard');
  const openButton = page.getByRole('button', { name: 'Open Applications' });
  await expect(openButton).toBeVisible();
  await openButton.click();
  await expect(page.getByRole('button', { name: 'Close Applications' })).toBeVisible();
  expect(toggleRequest).toMatchObject({ p_closed: false, p_event_key: 'jackson-hacks-2026' });

  await page.goto('/Register');
  await expect(page.getByRole('heading', { name: 'Apply to Jackson Hacks' })).toBeVisible();
});

test('application analytics are admin-only and load numeric summaries without identity fields', async ({ page }) => {
  await mockApplicantSession(page);
  let applicationRequestUrl = '';
  await page.route('**/rest/v1/admin_users*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: applicantUser.id }]) }));
  await page.route('**/rest/v1/application_cycles*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: openCycle.id, name: 'Jackson Hacks 2026' }) }));
  await page.route(/\/rest\/v1\/applications\?/, (route) => {
    applicationRequestUrl = decodeURIComponent(route.request().url());
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { id: 'app-1', status: 'submitted', submitted_at: new Date().toISOString(), age: 17, gender_identity: 'woman', race_ethnicity: ['east_asian'], country: 'Canada', city: 'Toronto', province_state: 'Ontario', school: 'Test School', grade: '12', experience_level: 'beginner', heard_from: 'friend', tshirt_size: 'M' },
      { id: 'app-2', status: 'under_review', submitted_at: new Date().toISOString(), age: 16, gender_identity: null, race_ethnicity: [], country: 'Canada', city: 'Ottawa', province_state: 'Ontario', school: 'Another School', grade: '11', experience_level: 'advanced', heard_from: null, tshirt_size: 'S' },
    ]) });
  });
  await page.route('**/rest/v1/application_reviews*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
    { id: 'review-1', application_id: 'app-1', reviewer_id: applicantUser.id, total_score: 20, motivation_score: 4, learning_score: 4, creativity_score: 4, collaboration_score: 4, response_score: 4 },
  ]) }));
  await page.goto('/ApplicationAnalytics');
  await expect(page.getByRole('heading', { name: 'Application Analytics' })).toBeVisible();
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Application status' })).toBeVisible();
  expect(applicationRequestUrl).not.toContain('full_name');
  expect(applicationRequestUrl).not.toContain('email');
  expect(applicationRequestUrl).not.toContain('why_attend');
});

test('non-admins cannot view application analytics', async ({ page }) => {
  await mockApplicantSession(page);
  await page.route('**/rest/v1/admin_users*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.goto('/ApplicationAnalytics');
  await expect(page.getByRole('heading', { name: 'Admin access required' })).toBeVisible();
  await expect(page.getByText('Total applications')).toHaveCount(0);
});

test('applicants can enter an Other grade level', async ({ page }, testInfo) => {
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
  await expect(page.getByText('Country is required')).toBeVisible();
  await expect(page.getByText('City is required')).toBeVisible();
  await page.getByLabel('Country', { exact: false }).fill('Japan');
  await page.getByLabel('City', { exact: false }).fill('Tokyo');
  await page.screenshot({ path: testInfo.outputPath('application-location.png'), fullPage: true });
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

  const writtenResponse = page.getByLabel(/Tell us why you want to attend Jackson Hacks/);
  await expect(writtenResponse).toBeVisible();
  await writtenResponse.fill('I want to build, learn, and meet other students.');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByLabel('Age')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Gender identity' })).toBeVisible();
  await expect(page.getByText('Race / ethnicity', { exact: false })).toBeVisible();
  await expect(page.getByText(/first-generation college or university student/i)).toHaveCount(0);
});

test('location and demographics submit, reload, and remain editable', async ({ page }) => {
  await mockApplicantSession(page);
  await mockOpenApplicationCycle(page);
  let saved = null;
  let request = null;
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.route('**/rest/v1/applications*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(saved || []) }));
  await page.route('**/rest/v1/application_drafts*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('**/rest/v1/rpc/save_application', (route) => {
    request = route.request().postDataJSON();
    saved = { ...request.p_application, id: '88888888-8888-4888-8888-888888888888', user_id: applicantUser.id, cycle_id: openCycle.id, status: 'submitted', revision_number: 1, submitted_at: new Date().toISOString() };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(saved) });
  });
  await page.goto('/Register');
  await page.getByLabel('Full Name').fill('Location Applicant');
  await page.getByLabel('Country', { exact: false }).fill(' Canada ');
  await page.getByLabel('City', { exact: false }).fill(' Montréal ');
  await page.getByLabel('Province / State').fill(' Québec ');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('School / Institution').fill('Test School');
  await page.getByRole('combobox', { name: 'Grade Level' }).click();
  await page.getByRole('option', { name: 'Grade 12' }).click();
  await page.getByRole('combobox', { name: 'Coding Experience' }).click();
  await page.getByRole('option', { name: 'Beginner - Just starting out' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel(/Tell us why you want to attend/).fill('I would like to learn and build with a team.');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Age').fill('17');
  await page.getByRole('combobox', { name: 'Gender identity' }).click();
  await page.getByRole('option', { name: 'Non-binary / gender diverse' }).click();
  await page.getByRole('checkbox', { name: 'East Asian', exact: true }).check();
  await page.getByRole('checkbox', { name: 'White', exact: true }).check();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('checkbox', { name: /I confirm that my information is accurate/ }).check();
  await page.getByRole('button', { name: 'Submit Application' }).click();
  await expect(page.getByRole('button', { name: 'Edit Submission' })).toBeVisible();
  expect(request.p_application).toMatchObject({ country: 'Canada', city: 'Montréal', province_state: 'Québec', age: '17', gender_identity: 'non_binary', race_ethnicity: ['east_asian', 'white'] });
  await page.reload();
  await page.getByRole('button', { name: 'Edit Submission' }).click();
  await expect(page.getByLabel('Country', { exact: false })).toHaveValue('Canada');
  await expect(page.getByLabel('City', { exact: false })).toHaveValue('Montréal');
  await expect(page.getByLabel('Province / State')).toHaveValue('Québec');
  await page.getByLabel('City', { exact: false }).fill('Ottawa');
  await page.getByLabel('Province / State').fill('Ontario');
  for (let step = 0; step < 3; step++) await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByLabel('Age')).toHaveValue('17');
  await expect(page.getByRole('combobox', { name: 'Gender identity' })).toContainText('Non-binary');
  await expect(page.getByRole('checkbox', { name: 'East Asian', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('button', { name: 'Edit Submission' })).toBeVisible();
  expect(request.p_application_id).toBe(saved.id);
  expect(request.p_application.city).toBe('Ottawa');
  expect(browserErrors).toEqual([]);
});

test('editing an application shows the final page after demographics', async ({ page }) => {
  await mockApplicantSession(page);
  await mockOpenApplicationCycle(page);
  const existingApplication = {
    id: '55555555-5555-4555-8555-555555555555',
    cycle_id: openCycle.id,
    user_id: applicantUser.id,
    status: 'submitted',
    full_name: 'Existing Applicant',
    email: applicantUser.email,
    phone: '',
    country: 'Canada',
    city: 'Toronto',
    province_state: 'Ontario',
    age: 17,
    school: 'Existing School',
    grade: '12',
    experience_level: 'intermediate',
    why_attend: 'I want to build, learn, and meet other students.',
    race_ethnicity: [],
    agree_to_terms: true,
    submitted_at: '2026-08-20T20:00:00.000Z',
    updated_at: '2026-08-20T20:00:00.000Z',
    revision_number: 1,
  };

  await page.route('**/rest/v1/applications*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(existingApplication),
  }));
  await page.route('**/rest/v1/application_drafts*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));

  await page.goto('/Register');
  await page.getByRole('button', { name: 'Edit Submission' }).click();

  await expect(page.getByLabel('Country', { exact: false })).toHaveValue('Canada');
  await expect(page.getByLabel('City', { exact: false })).toHaveValue('Toronto');
  await expect(page.getByLabel('Province / State')).toHaveValue('Ontario');

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Step 2 of 5: School & Experience')).toBeAttached();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Step 3 of 5: Written Response')).toBeAttached();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Step 4 of 5: Demographics')).toBeAttached();

  const demographicsNext = page.getByRole('button', { name: 'Next' });
  await expect(demographicsNext).toBeEnabled();
  await demographicsNext.evaluate((button) => {
    button.click();
    button.click();
  });

  await expect(page.getByText('Step 5 of 5: Final Details')).toBeAttached();
  await expect(page.getByRole('combobox', { name: 'T-Shirt Size' })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
});

test('admin review keeps secondary applicant details in Other info', async ({ page }) => {
  await mockApplicantSession(page);
  await mockOpenApplicationCycle(page);
  const reviewedApplication = {
    id: '66666666-6666-4666-8666-666666666666',
    cycle_id: openCycle.id,
    user_id: '77777777-7777-4777-8777-777777777777',
    status: 'submitted',
    full_name: 'Review Applicant',
    email: 'review@example.com',
    phone: '416-555-0199',
    country: 'Canada',
    city: 'Toronto',
    province_state: 'Ontario',
    school: 'Review School',
    grade: '12',
    experience_level: 'intermediate',
    tshirt_size: 'M',
    heard_from: 'School announcement',
    why_attend: 'I want to learn with other students.',
    submitted_at: '2026-08-20T20:00:00.000Z',
  };

  await page.route('**/rest/v1/applications*', (route) => {
    const isOwnApplicationRequest = new URL(route.request().url()).searchParams.has('user_id');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isOwnApplicationRequest ? [] : [reviewedApplication]),
    });
  });
  await page.route('**/rest/v1/application_drafts*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.route('**/rest/v1/admin_users*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ user_id: applicantUser.id }]),
  }));
  await page.route('**/rest/v1/application_reviews*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));

  await page.goto('/Dashboard');
  await page.getByRole('button', { name: 'Review', exact: true }).click();

  const reviewDialog = page.getByRole('dialog', { name: 'Application review' });
  await expect(reviewDialog.getByText('Phone', { exact: true })).toBeHidden();
  await expect(reviewDialog.getByText('T-shirt size', { exact: true })).toBeHidden();
  await expect(reviewDialog.getByText('Heard from', { exact: true })).toBeHidden();
  await expect(reviewDialog.getByText('Toronto', { exact: true })).toBeHidden();

  await reviewDialog.getByText('Other info', { exact: true }).click();
  await expect(reviewDialog.getByText('Phone', { exact: true })).toBeVisible();
  await expect(reviewDialog.getByText('416-555-0199')).toBeVisible();
  await expect(reviewDialog.getByText('T-shirt size', { exact: true })).toBeVisible();
  await expect(reviewDialog.getByText('M', { exact: true })).toBeVisible();
  await expect(reviewDialog.getByText('Heard from', { exact: true })).toBeVisible();
  await expect(reviewDialog.getByText('School announcement')).toBeVisible();
  await expect(reviewDialog.getByText('Canada', { exact: true })).toBeVisible();
  await expect(reviewDialog.getByText('Toronto', { exact: true })).toBeVisible();
  await expect(reviewDialog.getByText('Ontario', { exact: true })).toBeVisible();
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
  await page.getByLabel('Country', { exact: false }).fill('Canada');
  await page.getByLabel('City', { exact: false }).fill('Montréal');
  await page.getByLabel('Province / State').fill('Québec');
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
  expect(savedRequest.p_draft.country).toBe('Canada');
  expect(savedRequest.p_draft.city).toBe('Montréal');
  expect(savedRequest.p_draft.province_state).toBe('Québec');
  await expect(page.getByText('Draft saved')).toBeVisible();
  await expect(page.getByText('Your answers are private and saved at step 2 of 5.')).toBeVisible();

  await page.getByRole('button', { name: 'Continue Application' }).click();
  await expect(page).toHaveURL('/Register');
  await expect(page.getByRole('heading', { name: 'Continue Your Application' })).toBeVisible();
  await expect(page.getByLabel('School / Institution')).toHaveValue('Saved School');
  await expect(page.getByLabel('Enter your grade level')).toHaveValue('Year 1');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('Country', { exact: false })).toHaveValue('Canada');
  await expect(page.getByLabel('City', { exact: false })).toHaveValue('Montréal');
  await expect(page.getByLabel('Province / State')).toHaveValue('Québec');
});

test('older drafts return to missing location questions before submitting', async ({ page }) => {
  await mockApplicantSession(page);
  await mockOpenApplicationCycle(page);
  const draft = {
    id: '99999999-9999-4999-8999-999999999999',
    user_id: applicantUser.id,
    cycle_id: openCycle.id,
    current_step: 5,
    draft_data: {
      full_name: 'Legacy Draft', email: applicantUser.email,
      school: 'Test School', grade: '12', experience_level: 'beginner',
      why_attend: 'I want to learn and build with other students.',
      age: '17', agree_to_terms: true,
    },
  };
  let submissionCount = 0;
  await page.route('**/rest/v1/applications*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('**/rest/v1/application_drafts*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(draft) }));
  await page.route('**/rest/v1/rpc/save_application', (route) => {
    submissionCount++;
    return route.fulfill({ status: 400, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/Register');
  await page.getByRole('button', { name: 'Submit Application' }).click();
  await expect(page.getByText('Country is required')).toBeVisible();
  await expect(page.getByText('City is required')).toBeVisible();
  await expect(page.getByLabel('Full Name')).toHaveValue('Legacy Draft');
  expect(submissionCount).toBe(0);
  await page.getByLabel('Country', { exact: false }).fill('Canada');
  await page.getByLabel('City', { exact: false }).fill('Toronto');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByLabel('School / Institution')).toHaveValue('Test School');
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
