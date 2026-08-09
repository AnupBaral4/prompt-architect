// supabase/functions/scan-page/index.ts
//
// Deploy with:
//   npx supabase functions deploy scan-page --no-verify-jwt --project-ref <your-project-ref>
//
// Serves a fully server-rendered HTML report for a saved scan — no JavaScript
// required to view it. This is the permalink target (proxied from
// promptsarchitect.com/s/:id via a Vercel rewrite), and exists specifically
// so scan results are readable by non-JS crawlers, get correct per-scan
// social preview cards, and are indexable — none of which the React-only
// scan.html page can do for dynamic, per-scan content.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function scoreLabel(score) {
  if (score >= 80) return { text: 'Good', tone: '#00ff88' }
  if (score >= 50) return { text: 'Needs work', tone: '#ffd166' }
  return { text: 'Poor', tone: '#ff6b6b' }
}

function renderChecklist(items, categoryFilter, title) {
  const filtered = items.filter((i) => i.category === categoryFilter)
  if (!filtered.length) return ''
  const rows = filtered
    .map((item) => {
      const icon = item.pass ? '✅' : item.pass === false ? '❌' : '⚠️'
      const debnixNote =
        item.label === 'Stock availability'
          ? `<div class="debnixNote">AI shopping assistants weigh stock accuracy directly — a wrong "in stock" status is worse than none at all. <a href="https://debnix.com" target="_blank" rel="noopener noreferrer">Debnix</a> keeps that data accurate automatically for Shopify stores.</div>`
          : ''
      return `
        <div class="check">
          <span class="icon">${icon}</span>
          <div>
            <div class="checkLabel">${escapeHtml(item.label)}</div>
            <div class="checkDetail">${escapeHtml(item.detail)}</div>
            ${item.fix ? `<div class="checkFix">Fix: ${escapeHtml(item.fix)}</div>` : ''}
            ${debnixNote}
          </div>
        </div>`
    })
    .join('')
  return `<div class="section"><h2>${escapeHtml(title)}</h2>${rows}</div>`
}

Deno.serve(async (req) => {
  const id = new URL(req.url).searchParams.get('id')
  const notFoundHtml = `<!DOCTYPE html><html><head><title>Scan not found — Prompt Architect</title><meta name="robots" content="noindex"></head><body style="font-family:sans-serif;background:#0a0a0a;color:#fff;text-align:center;padding:80px 24px;">Scan not found. <a href="https://www.promptsarchitect.com/scan.html" style="color:#00ff88;">Run a new scan →</a></body></html>`

  if (!id) {
    return new Response(notFoundHtml, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  const { data, error } = await supabase.from('scans').select('*').eq('id', id).single()

  if (error || !data) {
    return new Response(notFoundHtml, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  const overall = scoreLabel(data.score_overall)
  const items = data.details || []
  const safeUrl = escapeHtml(data.url)
  const pageTitle = `${data.url.replace(/^https?:\/\//, '')} scored ${data.score_overall}/100 — AI Visibility Scan`
  const pageDescription = `AI shopping-assistant visibility scan for ${data.url.replace(/^https?:\/\//, '')}: ${data.score_overall}/100 (${overall.text}). Crawler access ${data.score_crawler_access}, structured data ${data.score_structured_data}, content visibility ${data.score_content_visibility}.`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(pageTitle)} | Prompt Architect</title>
<meta name="description" content="${escapeHtml(pageDescription)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.promptsarchitect.com/s/${escapeHtml(id)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Prompt Architect">
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${escapeHtml(pageDescription)}">
<meta property="og:url" content="https://www.promptsarchitect.com/s/${escapeHtml(id)}">
<meta property="og:image" content="https://www.promptsarchitect.com/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(pageTitle)}">
<link rel="icon" type="image/png" href="https://www.promptsarchitect.com/favicon.png">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WY34XWK7V2"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-WY34XWK7V2');</script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 100%); color:#fff; padding:60px 24px 80px; }
  .inner { max-width:640px; margin:0 auto; }
  .brand { font-size:14px; letter-spacing:0.2em; text-transform:uppercase; color:#00ff88; text-align:center; margin-bottom:24px; font-weight:600; }
  .url { font-size:13px; color:#888; text-align:center; word-break:break-all; margin-bottom:16px; }
  .scoreWrap { text-align:center; margin-bottom:32px; }
  .score { font-size:64px; font-weight:700; color:${overall.tone}; }
  .scoreLabel { font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:${overall.tone}; }
  .bars { background:rgba(255,255,255,0.02); border:1px solid #252525; border-radius:12px; padding:20px; margin-bottom:36px; font-size:13px; }
  .bars div { display:flex; justify-content:space-between; padding:6px 0; }
  .section { margin-bottom:28px; }
  .section h2 { font-size:13px; text-transform:uppercase; letter-spacing:0.05em; color:#888; margin-bottom:14px; font-weight:600; }
  .check { display:flex; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
  .checkLabel { font-size:14px; font-weight:500; }
  .checkDetail { font-size:13px; color:#888; line-height:1.5; }
  .checkFix { font-size:13px; color:#00ff88; margin-top:4px; }
  .debnixNote { font-size:12px; color:#888; margin-top:8px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.08); line-height:1.5; }
  .debnixNote a { color:#00ff88; font-weight:600; text-decoration:none; }
  .autoDiscover { font-size:13px; color:#00ff88; text-align:center; margin-bottom:8px; }
  .cta { display:block; text-align:center; background:#00ff88; color:#0a0a0a; font-weight:600; text-decoration:none; padding:14px 28px; border-radius:999px; margin:32px auto 0; max-width:240px; }
</style>
</head>
<body>
<div class="inner">
  <div class="brand">Prompt Architect</div>
  ${data.auto_discovered_from ? `<div class="autoDiscover">You submitted your homepage — we found and scanned this product page instead:</div>` : ''}
  <div class="url">${safeUrl}</div>
  <div class="scoreWrap">
    <div class="score">${data.score_overall}</div>
    <div class="scoreLabel">${overall.text}</div>
  </div>
  <div class="bars">
    <div><span>Crawler Access</span><span>${data.score_crawler_access}</span></div>
    <div><span>Structured Data</span><span>${data.score_structured_data}</span></div>
    <div><span>Content Visibility</span><span>${data.score_content_visibility}</span></div>
  </div>
  ${renderChecklist(items, 'crawler_access', 'Can AI shopping assistants reach this page?')}
  ${renderChecklist(items, 'structured_data', 'Does your product data describe itself correctly?')}
  ${renderChecklist(items, 'content_visibility', 'Is your content readable without JavaScript?')}
  ${renderChecklist(items, 'training_bots_informational', "Training bots (informational — doesn't affect your score)")}
  <a class="cta" href="https://www.promptsarchitect.com/scan.html">Scan your own store free →</a>
</div>
</body>
</html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
})
