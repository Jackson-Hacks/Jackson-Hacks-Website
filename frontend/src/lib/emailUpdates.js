export const EMAIL_UPDATES_CONSENT_VERSION = '2026-10-03';
export const EMAIL_UPDATES_CONSENT_TEXT = 'Notify me when Jackson Hacks 2027 applications open.';

export function normalizeSignupEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function validateEmailSignup(email, consent) {
  const normalized = normalizeSignupEmail(email);
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return 'Enter a valid email address.';
  }
  if (consent !== true) return 'Please agree to receive Jackson Hacks email updates.';
  return null;
}

export function getEmailSignupError(error) {
  if (['PGRST202', '42883'].includes(error?.code)) {
    return 'Email signup is not available yet. Please try again later.';
  }
  return 'Your email could not be saved. Please try again.';
}
