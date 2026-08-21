import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatApplicationDate,
  getApplicationRpcErrorMessage,
  getApplicationWindowState,
} from './applicationWindow.js';

const cycle = {
  opens_at: '2026-01-01T05:00:00.000Z',
  edits_close_at: '2026-11-21T13:00:00.000Z',
  closed_at: null,
};

test('application window is open between its configured timestamps', () => {
  const state = getApplicationWindowState(cycle, new Date('2026-08-07T12:00:00.000Z'));
  assert.equal(state.status, 'open');
  assert.equal(state.canEdit, true);
});

test('manual closure takes precedence over the scheduled cutoff', () => {
  const state = getApplicationWindowState(
    { ...cycle, closed_at: '2026-08-07T13:00:00.000Z' },
    new Date('2026-08-07T14:00:00.000Z'),
  );
  assert.equal(state.status, 'closed');
  assert.equal(state.canEdit, false);
});

test('scheduled cutoff closes edits at the exact database timestamp', () => {
  const state = getApplicationWindowState(cycle, new Date(cycle.edits_close_at));
  assert.equal(state.status, 'closed');
  assert.equal(state.canEdit, false);
});

test('window reports not-open before its opening timestamp', () => {
  const state = getApplicationWindowState(cycle, new Date('2025-12-31T12:00:00.000Z'));
  assert.equal(state.status, 'not_open');
});

test('missing or invalid cycle data fails closed', () => {
  assert.equal(getApplicationWindowState(null).canEdit, false);
  assert.equal(getApplicationWindowState({ opens_at: 'bad', edits_close_at: 'bad' }).status, 'unknown');
});

test('deadline formatting uses the Toronto event timezone', () => {
  const formatted = formatApplicationDate(cycle.edits_close_at);
  assert.match(formatted, /November 21, 2026/);
  assert.match(formatted, /8:00/);
});

test('RPC errors provide a specific closed-window message', () => {
  assert.match(
    getApplicationRpcErrorMessage({ message: 'applications_closed' }),
    /closed while you were editing/i,
  );
});

test('draft RPC errors provide applicant-facing recovery guidance', () => {
  assert.match(
    getApplicationRpcErrorMessage({ message: 'application_already_submitted' }),
    /already submitted/i,
  );
  assert.match(
    getApplicationRpcErrorMessage({ message: 'draft_too_large' }),
    /draft could not be saved/i,
  );
});
