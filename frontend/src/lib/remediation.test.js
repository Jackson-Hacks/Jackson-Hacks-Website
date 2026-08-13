import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENT } from '../config/event.js';
import { validateApplicationStep, normalizeApplicationData } from './applicationValidation.js';
import { createCsv, neutralizeSpreadsheetFormula } from './csv.js';
import { getApplicationStatusDetails } from './applicationStatus.js';

test('CSV export neutralizes spreadsheet formulas and flattens line breaks', () => {
  assert.equal(neutralizeSpreadsheetFormula('=HYPERLINK("bad")'), "'=HYPERLINK(\"bad\")");
  const csv = createCsv([{ label: 'Name', value: (row) => row.name }], [{ name: '+cmd\nnext' }]);
  assert.equal(csv, '"Name"\r\n"\'+cmd next"');
});

test('application validation catches invalid identity and paired emergency fields', () => {
  const stepOne = validateApplicationStep({ full_name: 'Ada', email: 'bad', age: '0' }, 1);
  assert.equal(stepOne.email, 'Enter a valid email address');
  assert.equal(stepOne.age, 'Enter a valid age');
  const stepFour = validateApplicationStep({ emergency_contact_name: 'Grace', emergency_contact_phone: '', agree_to_terms: true }, 4);
  assert.equal(stepFour.emergency_contact_phone, 'Add a phone number for this contact');
});

test('application normalization trims user-controlled strings', () => {
  assert.deepEqual(normalizeApplicationData({ full_name: '  Ada  ', agree_to_terms: true }), { full_name: 'Ada', agree_to_terms: true });
});

test('status mapping returns applicant-facing labels and safe unknown fallback', () => {
  assert.equal(getApplicationStatusDetails('under_review').label, 'Under review');
  assert.equal(getApplicationStatusDetails('unexpected').label, 'Unknown');
});

test('shared event configuration has a valid chronological schedule', () => {
  assert.ok(new Date(EVENT.startsAt) < new Date(EVENT.endsAt));
  assert.equal(EVENT.timeZone, 'America/Toronto');
});
