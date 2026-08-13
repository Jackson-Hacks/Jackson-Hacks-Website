const ALLOWED_EVENTS = new Set([
  'application_error',
  'auth_error',
  'route_not_found',
  'unhandled_error',
]);

export function createOperationalPayload(eventName, pathname = window.location.pathname) {
  if (!ALLOWED_EVENTS.has(eventName)) return null;
  return {
    event: eventName,
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
    path: pathname,
    occurred_at: new Date().toISOString(),
  };
}

export function reportOperationalEvent(eventName) {
  const endpoint = import.meta.env.VITE_MONITORING_ENDPOINT;
  const payload = createOperationalPayload(eventName);
  if (!endpoint || !payload) return false;
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) return navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
  fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
  return true;
}

export function initializeOperationalMonitoring() {
  window.addEventListener('error', () => reportOperationalEvent('unhandled_error'));
  window.addEventListener('unhandledrejection', () => reportOperationalEvent('unhandled_error'));
}
