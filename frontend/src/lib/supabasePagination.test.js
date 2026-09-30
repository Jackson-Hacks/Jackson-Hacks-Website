import test from 'node:test';
import assert from 'node:assert/strict';
import { readAllRows } from './supabasePagination.js';

test('pagination retains applicants beyond 1000 even with a smaller server page limit', async () => {
  const applicants = Array.from({ length: 1203 }, (_, id) => ({ id }));
  const rows = await readAllRows(() => ({
    range: async (start, end) => ({
      data: applicants.slice(start, Math.min(end + 1, start + 200)),
      error: null,
      count: applicants.length,
    }),
  }));
  assert.deepEqual(rows, applicants);
});

test('pagination rejects API errors and incomplete results instead of exporting partial data', async () => {
  let attempt = 0;
  await assert.rejects(readAllRows(() => ({
    range: async () => ++attempt === 1
      ? { data: [{ id: 1 }], count: 2 }
      : { data: [], count: 2 },
  })), /incomplete/);
  await assert.rejects(readAllRows(() => ({
    range: async () => ({ error: new Error('permission denied') }),
  })), /permission denied/);
});
