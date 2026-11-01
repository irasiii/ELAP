import { getTeam } from '@/lib/server/service';
import { corsHeaders } from '@/lib/server/http';
import { readId, readParams } from '@/lib/server/params';

export const dynamic = 'force-dynamic';

/** GET /api/teams/:id?lang=ar — team profile, form, upcoming schedule, recent results and update story. */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = readId((await ctx.params).id);
  if (!id) return Response.json({ error: 'bad_id' }, { status: 400, headers: corsHeaders });
  const { lang } = readParams(new URL(request.url));
  try {
    const team = await getTeam(id, lang);
    if (!team) return Response.json({ error: 'not_found' }, { status: 404, headers: corsHeaders });
    return Response.json(team, { headers: { ...corsHeaders, 'cache-control': 'public, max-age=60' } });
  } catch (err) {
    console.error('team failed', err);
    return Response.json({ error: 'upstream_unavailable' }, { status: 502, headers: corsHeaders });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
