import { getLeagues } from '@/lib/server/service';
import { corsHeaders } from '@/lib/server/http';
import { readParams } from '@/lib/server/params';

export const dynamic = 'force-dynamic';

/** GET /api/leagues?country=SA&lang=ar — competitions grouped by country, viewer's country first. */
export async function GET(request: Request) {
  const { lang, country } = readParams(new URL(request.url));
  try {
    const data = await getLeagues(country, lang);
    return Response.json(data, { headers: { ...corsHeaders, 'cache-control': 'public, max-age=3600' } });
  } catch (err) {
    console.error('leagues failed', err);
    return Response.json({ error: 'upstream_unavailable' }, { status: 502, headers: corsHeaders });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
