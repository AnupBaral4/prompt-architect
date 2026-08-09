// supabase/functions/get-scan/index.ts
//
// Deploy with:
//   npx supabase functions deploy get-scan --no-verify-jwt --project-ref <your-project-ref>
//
// GET ?id=xk29pq1a
// -> { id, url, scores: {...}, checklist: [...] }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  const { data, error } = await supabase.from('scans').select('*').eq('id', id).single()

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Scan not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  return new Response(
    JSON.stringify({
      id: data.id,
      url: data.url,
      autoDiscoveredFrom: data.auto_discovered_from,
      scores: {
        overall: data.score_overall,
        crawler_access: data.score_crawler_access,
        structured_data: data.score_structured_data,
        content_visibility: data.score_content_visibility,
      },
      checklist: data.details,
      created_at: data.created_at,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } },
  )
})
