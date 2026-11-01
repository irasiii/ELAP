import { getMatchDetail } from '@/lib/server/service';
import { corsHeaders } from '@/lib/server/http';
import { readId, readParams } from '@/lib/server/params';

export const dynamic = 'force-dynamic';

/** GET /api/matches/:id?lang=ar — match detail with events, lineups and broadcast info. */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = readId((await ctx.params).id);
  if (!id) return Response.json({ error: 'bad_id' }, { status: 400, headers: corsHeaders });
  const { lang } = readParams(new URL(request.url));
  try {
    const match = await getMatchDetail(id, lang);
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
