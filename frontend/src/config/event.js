export const EVENT = Object.freeze({
  // This persisted cycle key stays the same when the event is rescheduled.
  key: 'jackson-hacks-2026',
  name: 'Jackson Hacks',
  date: '2027-02-20',
  startsAt: '2027-02-20T08:00:00-05:00',
  endsAt: '2027-02-20T22:00:00-05:00',
  dateLabel: 'February 20, 2027',
  shortDateLabel: 'Feb. 20, 2027',
  timeLabel: '8 AM–10 PM',
  timeZone: 'America/Toronto',
  timeZoneLabel: 'EST',
  venue: 'A. Y. Jackson Secondary School',
  venueShort: 'A. Y. Jackson SS',
  address: '50 Francine Dr, North York, ON',
  mapUrl: 'https://maps.google.com/?q=A.+Y.+Jackson+SS',
  contactEmail: 'ayjacksonhacks@gmail.com',
  contactMailto: 'mailto:ayjacksonhacks@gmail.com',
  applicationOpensAt: '2026-01-01T00:00:00-05:00',
  applicationClosesAt: '2027-02-20T08:00:00-05:00',
});

export const EVENT_MARQUEE_ITEMS = Object.freeze([
  EVENT.name,
  EVENT.dateLabel,
  EVENT.timeLabel,
  EVENT.venueShort,
  'Student builders welcome',
  'Free to attend',
]);
