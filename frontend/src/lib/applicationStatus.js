export const APPLICATION_STATUSES = Object.freeze([
  'submitted',
  'under_review',
  'accepted',
  'rejected',
  'waitlisted',
  'withdrawn',
]);

const STATUS_DETAILS = Object.freeze({
  submitted: {
    label: 'Submitted',
    tone: 'text-[#6EA8DF]',
    nextStep: 'Your application is in the review queue. You can still edit it while submissions are open.',
  },
  under_review: {
    label: 'Under review',
    tone: 'text-[#9CC4EA]',
    nextStep: 'The organizing team is reviewing your application. No action is required right now.',
  },
  accepted: {
    label: 'Accepted',
    tone: 'text-green-400',
    nextStep: 'You have been accepted. Watch your email for attendance and check-in instructions.',
  },
  rejected: {
    label: 'Not selected',
    tone: 'text-red-400',
    nextStep: 'Your application was not selected for this event cycle.',
  },
  waitlisted: {
    label: 'Waitlisted',
    tone: 'text-amber-400',
    nextStep: 'You are on the waitlist. The team will contact you if a place becomes available.',
  },
  withdrawn: {
    label: 'Withdrawn',
    tone: 'text-[#B4BAC0]',
    nextStep: 'This application has been withdrawn.',
  },
});

export function getApplicationStatusDetails(status) {
  return STATUS_DETAILS[status] || {
    label: 'Unknown',
    tone: 'text-[#B4BAC0]',
    nextStep: 'Contact the organizing team if this status persists.',
  };
}
