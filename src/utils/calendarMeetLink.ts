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
    if (typeof value === 'string' && /^https?:\/\//i.test(value)) return value;
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
    if (video?.uri && /^https?:\/\//i.test(video.uri)) return video.uri;
  }

  return undefined;
};
