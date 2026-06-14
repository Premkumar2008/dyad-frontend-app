const isHttpUrl = (value: unknown): value is string =>

  typeof value === 'string' && /^https?:\/\//i.test(value);



const MEET_URL_RE = /https:\/\/meet\.google\.com\/[a-z0-9-]+/i;



/** Normalize meetingLink from API (handles bare meet.google.com URLs). */

export const normalizeMeetLink = (value: unknown): string => {

  if (typeof value !== 'string') return '';

  const trimmed = value.trim();

  if (!trimmed) return '';

  if (isHttpUrl(trimmed)) return trimmed;

  if (/^meet\.google\.com\//i.test(trimmed)) return `https://${trimmed}`;

  const match = trimmed.match(MEET_URL_RE);

  if (match?.[0]) return match[0];

  return '';

};



/** Unwrap nested API envelopes (`data`, `result`, `payload`) up to several levels deep. */

export const unwrapApiPayload = (raw: Record<string, unknown>): Record<string, unknown> => {

  let current: Record<string, unknown> = raw;



  for (let depth = 0; depth < 5; depth++) {

    if (normalizeMeetLink(current.meetingLink) || normalizeMeetLink(current.meetLink)) {

      return current;

    }



    let nested: Record<string, unknown> | undefined;

    for (const key of ['data', 'result', 'payload'] as const) {

      const value = current[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {

        nested = value as Record<string, unknown>;

        break;

      }

    }



    if (!nested) return current;

    current = nested;

  }



  return current;

};



const findMeetUrlDeep = (value: unknown, depth = 0): string | undefined => {

  if (depth > 8 || value == null) return undefined;

  if (typeof value === 'string') {

    const match = value.match(MEET_URL_RE);

    return match?.[0];

  }

  if (Array.isArray(value)) {

    for (const item of value) {

      const found = findMeetUrlDeep(item, depth + 1);

      if (found) return found;

    }

    return undefined;

  }

  if (typeof value === 'object') {

    for (const v of Object.values(value as Record<string, unknown>)) {

      const found = findMeetUrlDeep(v, depth + 1);

      if (found) return found;

    }

  }

  return undefined;

};



export const extractMeetingLinkFromResponse = (

  data: Record<string, unknown> | undefined,

): string | undefined => {

  if (!data) return undefined;



  const candidates = [

    data.meetingLink,

    data.meetLink,

    data.hangoutLink,

    data.conferenceLink,

    data.videoLink,

    data.meetUrl,

    data.meetingUrl,

  ];

  for (const value of candidates) {

    const normalized = normalizeMeetLink(value);

    if (normalized) return normalized;

  }



  const nestedEvent = data.event;

  if (nestedEvent && typeof nestedEvent === 'object') {

    const fromEvent = extractMeetingLinkFromResponse(nestedEvent as Record<string, unknown>);

    if (fromEvent) return fromEvent;

  }



  const conference = data.conferenceData;

  if (conference && typeof conference === 'object') {

    const entryPoints = (conference as { entryPoints?: Array<{ entryPointType?: string; uri?: string }> })

      .entryPoints;

    const video = entryPoints?.find(

      ep => ep.entryPointType === 'video' || ep.entryPointType === 'more',

    );

    if (video?.uri) {

      const normalized = normalizeMeetLink(video.uri);

      if (normalized) return normalized;

    }

  }



  return undefined;

};



/** Resolve Google Meet URL from POST /create-event response. */

export const resolveMeetingLinkFromCreateEventResponse = (

  raw: Record<string, unknown> | undefined,

): string | undefined => {

  if (!raw) return undefined;



  const body = unwrapApiPayload(raw);

  const fromBody = normalizeMeetLink(body.meetingLink);

  if (fromBody) return fromBody;



  const fromExtractor =

    extractMeetingLinkFromResponse(body) ?? extractMeetingLinkFromResponse(raw);

  if (fromExtractor) return fromExtractor;



  return findMeetUrlDeep(raw) ?? findMeetUrlDeep(body);

};



/** Read meetingLink directly from POST /create-event response (top-level `meetingLink` first). */

export const getCreateEventMeetingLink = (

  raw: Record<string, unknown> | undefined,

): string => {

  if (!raw) return '';



  const direct = normalizeMeetLink(raw.meetingLink);

  if (direct) return direct;



  const body = unwrapApiPayload(raw);

  const fromBody = normalizeMeetLink(body.meetingLink);

  if (fromBody) return fromBody;



  const resolved = resolveMeetingLinkFromCreateEventResponse(raw);

  return resolved || '';

};


