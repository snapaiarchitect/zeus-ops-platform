import { Booking, User } from '../types';

const CALENDLY_API_KEY = process.env.CALENDLY_API_KEY || '';
const CALENDLY_BASE_URL = 'https://api.calendly.com';
const APP_URL = process.env.APP_URL || 'https://app.zeus-ops.com';

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
}

const defaultRetry: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
};

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetry,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= config.maxRetries) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, config.delayMs * attempt));
    return withRetry(fn, config, attempt + 1);
  }
}

interface CalendlyApiResponse<T> {
  collection: T[];
  pagination?: {
    count: number;
    next_page?: string;
    previous_page?: string;
  };
}

interface CalendlyEventType {
  uri: string;
  name: string;
  description?: string;
  duration: number;
  slug: string;
  color?: string;
  active: boolean;
  scheduling_url: string;
}

interface CalendlyAvailabilitySlot {
  status: 'available' | 'unavailable';
  start_time: string;
  end_time: string;
  invitee_remaining?: number;
}

interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location?: {
    type: string;
    location?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
}

async function calendlyRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!CALENDLY_API_KEY) {
    throw new Error('Calendly API key not configured');
  }

  const url = `${CALENDLY_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${CALENDLY_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendly API error: ${response.status} ${error}`);
  }

  return response.json();
}

async function getCurrentUserUri(): Promise<string> {
  const response = await calendlyRequest<{ resource: { uri: string } }>('/users/me');
  return response.resource.uri;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  status: 'available' | 'unavailable';
}

export async function getAvailability(
  eventType: string,
  startTime?: string,
  endTime?: string
): Promise<AvailabilitySlot[]> {
  if (!CALENDLY_API_KEY) {
    console.warn('Calendly not configured, returning empty availability');
    return [];
  }

  const userUri = await getCurrentUserUri();
  const eventTypeUri = eventType.startsWith('https://')
    ? eventType
    : `${CALENDLY_BASE_URL}/event_types/${eventType}`;

  const now = new Date();
  const start = startTime || now.toISOString();
  const end =
    endTime ||
    new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const response = await withRetry(() =>
    calendlyRequest<{
      collection: CalendlyAvailabilitySlot[];
    }>(
      `/event_type_available_times?${new URLSearchParams({
        event_type: eventTypeUri,
        start_time: start,
        end_time: end,
      })}`
    )
  );

  return response.collection.map((slot) => ({
    startTime: slot.start_time,
    endTime: slot.end_time,
    status: slot.status,
  }));
}

export interface CreateBookingResult {
  id: string;
  uri: string;
  status: string;
  startTime: string;
  endTime: string;
  inviteeUri: string;
  rescheduleUrl: string;
  cancelUrl: string;
}

export async function createBooking(
  eventType: string,
  scheduledTime: string,
  invitee: {
    email: string;
    name: string;
    timezone?: string;
    questions?: Record<string, string>;
  }
): Promise<CreateBookingResult> {
  if (!CALENDLY_API_KEY) {
    throw new Error('Calendly not configured');
  }

  const eventTypeUri = eventType.startsWith('https://')
    ? eventType
    : `${CALENDLY_BASE_URL}/event_types/${eventType}`;

  const response = await withRetry(() =>
    calendlyRequest<{ resource: CalendlyScheduledEvent; invitee: { uri: string } }>(
      '/scheduled_events',
      {
        method: 'POST',
        body: JSON.stringify({
          event_type: eventTypeUri,
          start_time: scheduledTime,
          invitee: {
            email: invitee.email,
            name: invitee.name,
            timezone: invitee.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            questions_and_answers: Object.entries(invitee.questions || {}).map(
              ([question, answer]) => ({
                question,
                answer,
              })
            ),
          },
        }),
      }
    )
  );

  const eventId = response.resource.uri.split('/').pop() || '';

  return {
    id: eventId,
    uri: response.resource.uri,
    status: response.resource.status,
    startTime: response.resource.start_time,
    endTime: response.resource.end_time,
    inviteeUri: response.invitee.uri,
    rescheduleUrl: `${APP_URL}/bookings/${eventId}/reschedule`,
    cancelUrl: `${APP_URL}/bookings/${eventId}/cancel`,
  };
}

export async function cancelBooking(
  eventId: string,
  reason?: string
): Promise<void> {
  if (!CALENDLY_API_KEY) {
    throw new Error('Calendly not configured');
  }

  const eventUri = eventId.startsWith('https://')
    ? eventId
    : `${CALENDLY_BASE_URL}/scheduled_events/${eventId}`;

  await withRetry(() =>
    calendlyRequest(`/scheduled_events/${eventId}/cancellation`, {
      method: 'POST',
      body: JSON.stringify({
        reason: reason || 'Cancelled by user',
      }),
    })
  );
}

export async function rescheduleBooking(
  eventId: string,
  newStartTime: string
): Promise<CreateBookingResult> {
  if (!CALENDLY_API_KEY) {
    throw new Error('Calendly not configured');
  }

  const eventUri = eventId.startsWith('https://')
    ? eventId
    : `${CALENDLY_BASE_URL}/scheduled_events/${eventId}`;

  const response = await withRetry(() =>
    calendlyRequest<{ resource: CalendlyScheduledEvent }>(
      `/scheduled_events/${eventId}/rescheduling`,
      {
        method: 'POST',
        body: JSON.stringify({
          start_time: newStartTime,
        }),
      }
    )
  );

  return {
    id: response.resource.uri.split('/').pop() || '',
    uri: response.resource.uri,
    status: response.resource.status,
    startTime: response.resource.start_time,
    endTime: response.resource.end_time,
    inviteeUri: '',
    rescheduleUrl: '',
    cancelUrl: '',
  };
}

export interface CalendlyWebhookPayload {
  event: string;
  payload: {
    event_type?: CalendlyEventType;
    scheduled_event?: CalendlyScheduledEvent;
    invitee?: {
      uri: string;
      email: string;
      name: string;
      status: string;
      questions_and_answers?: Array<{ question: string; answer: string }>;
      tracking?: Record<string, string>;
    };
    event?: string;
    old_event?: string;
    new_event?: string;
    time?: string;
  };
}

export async function handleWebhook(payload: CalendlyWebhookPayload): Promise<void> {
  const { event, payload: data } = payload;

  switch (event) {
    case 'invitee.created':
      console.log('New booking created:', data.invitee?.email);
      break;

    case 'invitee.canceled':
      console.log('Booking cancelled:', data.invitee?.email);
      break;

    case 'invitee.rescheduled':
      console.log('Booking rescheduled:', data.invitee?.email);
      break;

    case 'routing_form_submission.created':
      console.log('Routing form submission created');
      break;

    default:
      console.log('Unhandled Calendly webhook event:', event);
  }
}

export async function getEventTypes(): Promise<
  Array<{
    id: string;
    name: string;
    description?: string;
    duration: number;
    slug: string;
    active: boolean;
    url: string;
  }>
> {
  if (!CALENDLY_API_KEY) {
    return [];
  }

  const userUri = await getCurrentUserUri();
  const response = await withRetry(() =>
    calendlyRequest<CalendlyApiResponse<CalendlyEventType>>(
      `/event_types?${new URLSearchParams({ user: userUri })}`
    )
  );

  return response.collection.map((et) => ({
    id: et.uri.split('/').pop() || '',
    name: et.name,
    description: et.description,
    duration: et.duration,
    slug: et.slug,
    active: et.active,
    url: et.scheduling_url,
  }));
}

export async function getScheduledEvents(
  userId?: string,
  minStartTime?: string,
  maxStartTime?: string
): Promise<
  Array<{
    id: string;
    name: string;
    status: string;
    startTime: string;
    endTime: string;
    location?: string;
    inviteesCount: number;
  }>
> {
  if (!CALENDLY_API_KEY) {
    return [];
  }

  const userUri = await getCurrentUserUri();
  const params = new URLSearchParams({
    user: userUri,
  });

  if (minStartTime) params.append('min_start_time', minStartTime);
  if (maxStartTime) params.append('max_start_time', maxStartTime);

  const response = await withRetry(() =>
    calendlyRequest<CalendlyApiResponse<CalendlyScheduledEvent>>(
      `/scheduled_events?${params}`
    )
  );

  return response.collection.map((event) => ({
    id: event.uri.split('/').pop() || '',
    name: event.name,
    status: event.status,
    startTime: event.start_time,
    endTime: event.end_time,
    location: event.location?.location,
    inviteesCount: event.invitees_counter.total,
  }));
}
