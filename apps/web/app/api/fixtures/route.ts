import { dateForDay, isIsoDate } from '@elap/core';
import { getFixtures } from '@/lib/server/service';
import { corsHeaders } from '@/lib/server/http';
import { readParams } from '@/lib/server/params';

export const dynamic = 'force-dynamic';

/** GET /api/fixtures?date=YYYY-MM-DD&tz=Area/City&country=SA&lang=ar */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { timeZone, lang, country } = readParams(url);
  const dateParam = url.searchParams.get('date');
  const date = isIsoDate(dateParam) ? dateParam : dateForDay('today', timeZone);

  try {
    const data = await getFixtures(date, timeZone, country, lang);
    return Response.json(data, { headers: { ...corsHeaders, 'cache-control': 'public, max-age=15' } });
  } catch (err) {
    console.error('fixtures failed', err);
    return Response.json({ error: 'upstream_unavailable' }, { status: 502, headers: corsHeaders });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
