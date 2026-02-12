import type { eventWithTime } from '@dom-replay/types';

declare const events: eventWithTime[] | undefined;

// Use the same replay data as packages/player/public/events.js
export const sampleEvents: eventWithTime[] = events ?? [];
