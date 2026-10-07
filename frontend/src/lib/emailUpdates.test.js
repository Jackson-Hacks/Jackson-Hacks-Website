import test from 'node:test';
import assert from 'node:assert/strict';
import { getEmailSignupError, normalizeSignupEmail, validateEmailSignup } from './emailUpdates.js';

test('email updates require a bounded email and explicit consent', () => {
  assert.equal(normalizeSignupEmail(' Test@Example.COM '), 'test@example.com');
  assert.equal(validateEmailSignup(' Test@Example.COM ', true), null);
  for (const email of ['', 'not-an-email', 'a@@example.com', 'a@b', 'a\n@example.com', `${'a'.repeat(250)}@test.com`]) {
    assert.equal(validateEmailSignup(email, true), 'Enter a valid email address.');
  }
  assert.match(validateEmailSignup('test@example.com', false), /agree/);
  assert.match(validateEmailSignup('test@example.com', 'true'), /agree/);
});

test('email signup errors do not claim success or expose database details', () => {
  assert.match(getEmailSignupError({ code: 'PGRST202' }), /not available/);
  assert.match(getEmailSignupError({ message: 'secret database details' }), /could not be saved/);
});
