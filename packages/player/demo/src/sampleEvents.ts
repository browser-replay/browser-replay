import type { eventWithTime } from '@dom-replay/types';

declare const events: eventWithTime[] | undefined;

// Populated at runtime via the <script src="/events.js"> tag in index.html (served from demo/public/events.js)
export const sampleEvents: eventWithTime[] = events ?? [];
