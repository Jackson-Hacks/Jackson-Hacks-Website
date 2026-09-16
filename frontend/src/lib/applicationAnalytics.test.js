import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApplicationAnalytics } from './applicationAnalytics.js';

const applications = [
  { id: 'a', status: 'submitted', submitted_at: '2026-09-15T15:00:00Z', age: 16, gender_identity: 'woman', race_ethnicity: ['east_asian'], country: 'Canada', province_state: 'Ontario', city: 'Toronto', school: 'School A', grade: '11', experience_level: 'beginner', heard_from: 'school', tshirt_size: 'M' },
  { id: 'b', status: 'under_review', submitted_at: '2026-09-10T15:00:00Z', age: 18, gender_identity: 'man', race_ethnicity: ['east_asian', 'white'], country: 'Canada', province_state: 'Ontario', city: 'Ottawa', school: 'School B', grade: '12', experience_level: 'advanced', heard_from: 'friend', tshirt_size: 'L' },
  { id: 'c', status: 'accepted', submitted_at: '2026-08-01T15:00:00Z', age: null, gender_identity: null, race_ethnicity: [], country: 'USA', province_state: 'New York', city: 'New York', school: 'School C', grade: 'Other', experience_level: 'beginner', heard_from: null, tshirt_size: null },
];
const reviews = [
  { application_id: 'a', reviewer_id: 'r1', total_score: 20, motivation_score: 4, learning_score: 4, creativity_score: 4, collaboration_score: 4, response_score: 4 },
  { application_id: 'a', reviewer_id: 'r2', total_score: 22, motivation_score: 5, learning_score: 4, creativity_score: 4, collaboration_score: 4, response_score: 5 },
  { application_id: 'b', reviewer_id: 'r1', total_score: 15, motivation_score: 3, learning_score: 3, creativity_score: 3, collaboration_score: 3, response_score: 3 },
  { application_id: 'outside-cycle', reviewer_id: 'r1', total_score: 25 },
];

test('application analytics count applicants and reviews without counting outside-cycle rows', () => {
  const result = buildApplicationAnalytics(applications, reviews, new Date('2026-09-16T16:00:00Z'));
  assert.equal(result.total, 3);
  assert.equal(result.reviewed, 2);
  assert.equal(result.unreviewed, 1);
  assert.equal(result.reviewCount, 3);
  assert.equal(result.reviewerCount, 2);
  assert.equal(result.reviewCoverage, 66.7);
  assert.equal(result.averageScore, 18);
  assert.equal(result.averageAge, 17);
  assert.equal(result.last7Days, 2);
});

test('multi-select demographics use applicants as denominator and retain missing answers', () => {
  const result = buildApplicationAnalytics(applications, reviews);
  const race = result.breakdowns.find(({ title }) => title === 'Race / ethnicity').rows;
  assert.deepEqual(race.find(({ label }) => label === 'East Asian'), { label: 'East Asian', count: 2, percent: 66.7 });
  assert.deepEqual(race.find(({ label }) => label === 'Not provided'), { label: 'Not provided', count: 1, percent: 33.3 });
  const gender = result.breakdowns.find(({ title }) => title === 'Gender').rows;
  assert.equal(gender.find(({ label }) => label === 'Not provided').count, 1);
});
