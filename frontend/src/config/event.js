export const EVENT = Object.freeze({
  key: 'jackson-hacks-2026',
  name: 'Jackson Hacks',
  date: '2026-11-21',
  startsAt: '2026-11-21T08:00:00-05:00',
  endsAt: '2026-11-21T22:00:00-05:00',
  dateLabel: 'November 21, 2026',
  shortDateLabel: 'Nov. 21, 2026',
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
  applicationClosesAt: '2026-11-21T08:00:00-05:00',
});

export const EVENT_MARQUEE_ITEMS = Object.freeze([
  EVENT.name,
  EVENT.dateLabel,
  EVENT.timeLabel,
  EVENT.venueShort,
  'Student builders welcome',
  'Free to attend',
]);
