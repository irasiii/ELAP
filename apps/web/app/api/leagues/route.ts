import { getLeagues } from '@/lib/server/service';
import { corsHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/** GET /api/leagues — major competitions grouped by country. */
export async function GET() {
  try {
    const data = await getLeagues();
    return Response.json(data, { headers: { ...corsHeaders, 'cache-control': 'public, max-age=3600' } });
  } catch (err) {
    console.error('leagues failed', err);
    return Response.json({ error: 'upstream_unavailable' }, { status: 502, headers: corsHeaders });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
