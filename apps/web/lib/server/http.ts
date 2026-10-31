/** The API is read-only public data, so any origin may read it (needed for the Expo web build). */
export const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};
