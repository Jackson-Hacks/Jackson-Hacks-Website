import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENT } from '../config/event.js';
import { validateApplicationStep, normalizeApplicationData } from './applicationValidation.js';
import { createCsv, neutralizeSpreadsheetFormula } from './csv.js';
import { getApplicationStatusDetails } from './applicationStatus.js';
import {
  getAnonymousApplicantLabel,
  getReviewTotal,
  summarizeReviews,
  validateReviewScores,
} from './applicationReview.js';

test('CSV export neutralizes spreadsheet formulas and flattens line breaks', () => {
  assert.equal(neutralizeSpreadsheetFormula('=HYPERLINK("bad")'), "'=HYPERLINK(\"bad\")");
  const csv = createCsv([{ label: 'Name', value: (row) => row.name }], [{ name: '+cmd\nnext' }]);
  assert.equal(csv, '"Name"\r\n"\'+cmd next"');
});

test('application validation catches invalid identity, demographics, and paired emergency fields', () => {
  const stepOne = validateApplicationStep({ full_name: 'Ada', email: 'bad' }, 1);
  assert.equal(stepOne.email, 'Enter a valid email address');
  const stepFour = validateApplicationStep({
    age: '0',
    gender_identity: 'self_describe',
    gender_self_description: '',
    race_ethnicity: ['white', 'prefer_not_to_say'],
  }, 4);
  assert.equal(stepFour.age, 'Enter a valid age');
  assert.equal(stepFour.gender_self_description, 'Please describe your gender identity');
  assert.ok(stepFour.race_ethnicity);
  const stepFive = validateApplicationStep({ emergency_contact_name: 'Grace', emergency_contact_phone: '', agree_to_terms: true }, 5);
  assert.equal(stepFive.emergency_contact_phone, 'Add a phone number for this contact');
});

test('application normalization trims user-controlled strings', () => {
  assert.deepEqual(normalizeApplicationData({ full_name: '  Ada  ', agree_to_terms: true }), { full_name: 'Ada', agree_to_terms: true });
});

test('status mapping returns applicant-facing labels and safe unknown fallback', () => {
  assert.equal(getApplicationStatusDetails('under_review').label, 'Under review');
  assert.equal(getApplicationStatusDetails('unexpected').label, 'Unknown');
});

test('review rubric validates five decimal five-point categories and summarizes totals', () => {
  const scores = { motivation: '4.5', learning: '4', creativity: '3.5', collaboration: '4.5', response: '4' };
  assert.deepEqual(validateReviewScores(scores), {});
  assert.equal(getReviewTotal(scores), 20.5);
  assert.equal(validateReviewScores({ ...scores, response: '5.1' }).response, 'Response quality must be a number from 0 to 5 with at most one decimal place');
  assert.ok(validateReviewScores({ ...scores, response: '4.25' }).response);
  assert.deepEqual(summarizeReviews([{ total_score: 20.5 }, { total_score: 22.5 }]), { count: 2, average: 21.5 });
  assert.equal(getAnonymousApplicantLabel({ id: '12345678-abcd-efab-cdef-123456789abc' }), 'Applicant 123456');
});

test('shared event configuration has a valid chronological schedule', () => {
  assert.ok(new Date(EVENT.startsAt) < new Date(EVENT.endsAt));
  assert.equal(EVENT.timeZone, 'America/Toronto');
});
