import { EVENT } from '../config/event.js';

export const CURRENT_EVENT_KEY = EVENT.key;
export const EVENT_TIME_ZONE = EVENT.timeZone;

const toValidDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function getApplicationWindowState(cycle, now = new Date()) {
  const currentTime = toValidDate(now) || new Date();

  if (!cycle) {
    return {
      status: 'unknown',
      isOpen: false,
      canEdit: false,
      opensAt: null,
      closesAt: null,
      closedAt: null,
    };
  }

  const opensAt = toValidDate(cycle.opens_at);
  const closesAt = toValidDate(cycle.edits_close_at);
  const closedAt = toValidDate(cycle.closed_at);

  if (!opensAt || !closesAt) {
    return {
      status: 'unknown',
      isOpen: false,
      canEdit: false,
      opensAt,
      closesAt,
      closedAt,
    };
  }

  if (currentTime < opensAt) {
    return {
      status: 'not_open',
      isOpen: false,
      canEdit: false,
      opensAt,
      closesAt,
      closedAt,
    };
  }

  if (closedAt || currentTime >= closesAt) {
    return {
      status: 'closed',
      isOpen: false,
      canEdit: false,
      opensAt,
      closesAt,
      closedAt,
    };
  }

  return {
    status: 'open',
    isOpen: true,
    canEdit: true,
    opensAt,
    closesAt,
    closedAt,
  };
}

export function formatApplicationDate(value) {
  const date = toValidDate(value);
  if (!date) return 'an administrator closes submissions';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TIME_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export function getApplicationWindowMessage(windowState) {
  if (windowState.status === 'open') {
    return `You can edit your submitted application until ${formatApplicationDate(windowState.closesAt)}.`;
  }
  if (windowState.status === 'not_open') {
    return `Applications open ${formatApplicationDate(windowState.opensAt)}.`;
  }
  if (windowState.status === 'closed') {
    return 'Applications are closed. Submitted applications are now read-only.';
  }
  return 'Application availability could not be confirmed. Please try again.';
}

export function getApplicationRpcErrorMessage(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  if (message.includes('applications_closed')) {
    return 'Applications closed while you were editing. Your latest changes were not saved.';
  }
  if (message.includes('applications_not_open')) {
    return 'Applications are not open yet.';
  }
  if (message.includes('application_invalid')) {
    return 'Some required application information is missing or invalid.';
  }
  if (message.includes('application_not_found_or_not_owned')) {
    return 'This application could not be updated. Refresh the page and try again.';
  }
  return 'Something went wrong while saving your application. Please try again.';
}
