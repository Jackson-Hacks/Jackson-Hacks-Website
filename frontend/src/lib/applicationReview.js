export const REVIEW_CATEGORIES = Object.freeze([
  {
    key: 'motivation',
    column: 'motivation_score',
    label: 'Motivation',
    description: 'Clear and genuine interest in attending.',
  },
  {
    key: 'learning',
    column: 'learning_score',
    label: 'Learning mindset',
    description: 'Curiosity, growth, and goals for the event.',
  },
  {
    key: 'creativity',
    column: 'creativity_score',
    label: 'Creativity & initiative',
    description: 'Original thinking and willingness to make something.',
  },
  {
    key: 'collaboration',
    column: 'collaboration_score',
    label: 'Community contribution',
    description: 'Potential to collaborate and support other hackers.',
  },
  {
    key: 'response',
    column: 'response_score',
    label: 'Response quality',
    description: 'Thoughtfulness, clarity, and effort in the written answer.',
  },
]);

export const EMPTY_REVIEW_SCORES = Object.freeze(
  Object.fromEntries(REVIEW_CATEGORIES.map(({ key }) => [key, ''])),
);

export function scoresFromReview(review) {
  if (!review) return { ...EMPTY_REVIEW_SCORES };
  return Object.fromEntries(
    REVIEW_CATEGORIES.map(({ key, column }) => [key, String(review[column])]),
  );
}

export function validateReviewScores(scores) {
  return Object.fromEntries(
    REVIEW_CATEGORIES.flatMap(({ key, label }) => {
      const value = Number(scores[key]);
      const hasAtMostOneDecimal = /^\d(?:\.\d)?$/.test(String(scores[key]));
      return scores[key] === '' || !Number.isFinite(value) || !hasAtMostOneDecimal || value < 0 || value > 5
        ? [[key, `${label} must be a number from 0 to 5 with at most one decimal place`]]
        : [];
    }),
  );
}

export function getReviewTotal(scores) {
  if (Object.keys(validateReviewScores(scores)).length) return null;
  const total = REVIEW_CATEGORIES.reduce((sum, { key }) => sum + Number(scores[key]), 0);
  return Math.round(total * 10) / 10;
}

export function summarizeReviews(reviews) {
  if (!reviews?.length) return { count: 0, average: null };
  const total = reviews.reduce((sum, review) => sum + Number(review.total_score || 0), 0);
  return { count: reviews.length, average: Math.round((total / reviews.length) * 10) / 10 };
}

export function getAnonymousApplicantLabel(application) {
  return `Applicant ${String(application?.id || '').replaceAll('-', '').slice(0, 6).toUpperCase()}`;
}
