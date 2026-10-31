import { getMatchDetail } from '@/lib/server/service';
import { corsHeaders } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/** GET /api/matches/:id — match detail with events, lineups and broadcast info. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return Response.json({ error: 'bad_id' }, { status: 400, headers: corsHeaders });
  }
  try {
    const match = await getMatchDetail(numericId);
    if (!match) return Response.json({ error: 'not_found' }, { status: 404, headers: corsHeaders });
    return Response.json(match, { headers: { ...corsHeaders, 'cache-control': 'public, max-age=15' } });
  } catch (err) {
    console.error('match failed', err);
    return Response.json({ error: 'upstream_unavailable' }, { status: 502, headers: corsHeaders });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
