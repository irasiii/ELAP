import { DEFAULT_TIMEZONE, dateForDay, isIsoDate, isValidTimeZone } from '@elap/core';
import { getFixtures } from '@/lib/server/service';
import { corsHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/** GET /api/fixtures?date=YYYY-MM-DD&tz=Area/City */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tzParam = url.searchParams.get('tz');
  const tz = isValidTimeZone(tzParam) ? tzParam : DEFAULT_TIMEZONE;
  const dateParam = url.searchParams.get('date');
  const date = isIsoDate(dateParam) ? dateParam : dateForDay('today', tz);

  try {
    const data = await getFixtures(date, tz);
    return Response.json(data, { headers: { ...corsHeaders, 'cache-control': 'public, max-age=15' } });
  } catch (err) {
    console.error('fixtures failed', err);
    return Response.json({ error: 'upstream_unavailable' }, { status: 502, headers: corsHeaders });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
