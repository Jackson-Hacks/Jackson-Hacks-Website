import { GENDER_OPTIONS, RACE_ETHNICITY_OPTIONS } from './applicationDemographics.js';
import { REVIEW_CATEGORIES } from './applicationReview.js';
import { APPLICATION_STATUSES, getApplicationStatusDetails } from './applicationStatus.js';
import { EVENT } from '../config/event.js';

export const ANALYTICS_APPLICATION_COLUMNS = 'id,status,submitted_at,age,gender_identity,race_ethnicity,country,city,province_state,school,grade,experience_level,heard_from,tshirt_size';
export const ANALYTICS_REVIEW_COLUMNS = 'id,application_id,reviewer_id,total_score,motivation_score,learning_score,creativity_score,collaboration_score,response_score';
const EXPERIENCE_OPTIONS = Object.freeze([
  { value: 'beginner', label: 'Beginner - Just starting out' },
  { value: 'intermediate', label: 'Intermediate - Built some projects' },
  { value: 'advanced', label: 'Advanced - Experienced developer' },
]);
const REFERRAL_OPTIONS = Object.freeze([
  { value: 'social_media', label: 'Social Media' }, { value: 'friend', label: 'Friend / Word of Mouth' },
  { value: 'school', label: 'School Announcement' }, { value: 'mlh', label: 'MLH' },
  { value: 'search', label: 'Google Search' }, { value: 'other', label: 'Other' },
]);

const percentage = (count, total) => total ? Math.round(count / total * 1000) / 10 : 0;
const average = (values) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100 : null;
const numericValues = (values) => values.filter((value) => value !== null && value !== undefined && value !== '').map(Number).filter(Number.isFinite);
const dayKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: EVENT.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

/**
 * @param {Array<Record<string, any>>} applications
 * @param {(application: Record<string, any>) => Array<unknown>} valuesFor
 * @param {readonly {value: string, label: string}[]} options
 */
function distribution(applications, valuesFor, options = []) {
  const counts = new Map(options.map(({ label }) => [label, 0]));
  const labels = new Map(options.map(({ value, label }) => [value, label]));
  const canonical = new Map();
  applications.forEach((application) => {
    const values = valuesFor(application).map((value) => String(value ?? '').trim()).filter(Boolean);
    const unique = new Set(values.length ? values : ['Not provided']);
    unique.forEach((value) => {
      const label = labels.get(value) || value;
      const key = label.toLocaleLowerCase('en-CA');
      if (!canonical.has(key)) canonical.set(key, label);
      const display = canonical.get(key);
      counts.set(display, (counts.get(display) || 0) + 1);
    });
  });
  return [...counts].map(([label, count]) => ({ label, count, percent: percentage(count, applications.length) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'en-CA', { numeric: true }));
}

export function buildApplicationAnalytics(applications = [], reviews = [], now = new Date()) {
  const ids = new Set(applications.map((application) => application.id));
  const cycleReviews = reviews.filter((review) => ids.has(review.application_id));
  const reviewedIds = new Set(cycleReviews.map((review) => review.application_id));
  const applicantScores = new Map();
  cycleReviews.forEach((review) => {
    const values = applicantScores.get(review.application_id) || [];
    values.push(...numericValues([review.total_score]));
    applicantScores.set(review.application_id, values);
  });
  const submissionDates = applications.map((application) => new Date(application.submitted_at))
    .filter((date) => Number.isFinite(date.getTime()));
  const dates = new Map();
  submissionDates.forEach((date) => dates.set(dayKey(date), (dates.get(dayKey(date)) || 0) + 1));
  const daily = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now.getTime() - (13 - index) * 86400000);
    const label = dayKey(date);
    const count = dates.get(label) || 0;
    return { label, count, percent: percentage(count, applications.length) };
  });
  const recentlySubmitted = (duration) => submissionDates.filter((date) => date.getTime() <= now.getTime() && date.getTime() > now.getTime() - duration).length;
  return {
    total: applications.length,
    reviewed: reviewedIds.size,
    unreviewed: applications.length - reviewedIds.size,
    reviewCount: cycleReviews.length,
    reviewerCount: new Set(cycleReviews.map((review) => review.reviewer_id)).size,
    reviewCoverage: percentage(reviewedIds.size, applications.length),
    averageScore: average([...applicantScores.values()].map(average).filter((value) => value !== null)),
    averageAge: average(numericValues(applications.map((application) => application.age))),
    last24Hours: recentlySubmitted(86400000),
    last7Days: recentlySubmitted(7 * 86400000),
    rubric: REVIEW_CATEGORIES.map(({ column, label }) => ({ label, average: average(numericValues(cycleReviews.map((review) => review[column]))) })),
    daily,
    breakdowns: [
      { title: 'Application status', rows: distribution(applications, (a) => [a.status], APPLICATION_STATUSES.map((value) => ({ value, label: getApplicationStatusDetails(value).label }))) },
      { title: 'Age', rows: distribution(applications, (a) => [a.age]) },
      { title: 'Gender', rows: distribution(applications, (a) => [a.gender_identity], GENDER_OPTIONS) },
      { title: 'Race / ethnicity', note: 'Multiple selections allowed. Each percentage uses all applications as the denominator, so percentages may exceed 100% in total.', rows: distribution(applications, (a) => Array.isArray(a.race_ethnicity) ? a.race_ethnicity : [], RACE_ETHNICITY_OPTIONS) },
      { title: 'Country', rows: distribution(applications, (a) => [a.country]) },
      { title: 'Province / State', rows: distribution(applications, (a) => [a.province_state]) },
      { title: 'City', rows: distribution(applications, (a) => [a.city ? [a.city, a.province_state, a.country].filter(Boolean).join(', ') : null]) },
      { title: 'School', rows: distribution(applications, (a) => [a.school]) },
      { title: 'Grade level', rows: distribution(applications, (a) => [/^(9|10|11|12)$/.test(a.grade) ? `Grade ${a.grade}` : a.grade]) },
      { title: 'Coding experience', rows: distribution(applications, (a) => [a.experience_level], EXPERIENCE_OPTIONS) },
      { title: 'Heard about us', rows: distribution(applications, (a) => [a.heard_from], REFERRAL_OPTIONS) },
      { title: 'T-shirt size', rows: distribution(applications, (a) => [a.tshirt_size]) },
    ],
  };
}

// Page through every result; do not silently report only the API's first page.
async function readAll(makeQuery) {
  const rows = [];
  for (;;) {
    const { data, error, count } = await makeQuery().range(rows.length, rows.length + 499);
    if (error) throw error;
    const page = data || [];
    rows.push(...page);
    if (count !== null && count !== undefined) {
      if (rows.length >= count) return rows;
      if (!page.length) throw new Error('Analytics results were incomplete. Please refresh.');
    } else if (page.length < 500) return rows;
  }
}

export async function loadApplicationAnalytics(client, userId, eventKey) {
  if (!userId) return { allowed: false };
  const { data: admins, error: adminError } = await client.from('admin_users').select('user_id').eq('user_id', userId).limit(1);
  if (adminError) throw adminError;
  if (!admins?.length) return { allowed: false };
  const { data: cycle, error: cycleError } = await client.from('application_cycles').select('id,name').eq('event_key', eventKey).single();
  if (cycleError) throw cycleError;
  const applications = await readAll(() => client.from('applications').select(ANALYTICS_APPLICATION_COLUMNS, { count: 'exact' }).eq('cycle_id', cycle.id).order('id'));
  const reviews = [];
  for (let start = 0; start < applications.length; start += 100) {
    const ids = applications.slice(start, start + 100).map((application) => application.id);
    reviews.push(...await readAll(() => client.from('application_reviews').select(ANALYTICS_REVIEW_COLUMNS, { count: 'exact' }).in('application_id', ids).order('id')));
  }
  return { allowed: true, cycle, analytics: buildApplicationAnalytics(applications, reviews), updatedAt: new Date() };
}
