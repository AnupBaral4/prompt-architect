// supabase/functions/scan/index.ts
//
// Deploy with:
//   npx supabase functions deploy scan --no-verify-jwt --project-ref <your-project-ref>
//
// POST { "url": "https://example-store.com" }
// -> { id, url, scores: {...}, checklist: [...] }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { customAlphabet } from 'https://esm.sh/nanoid@5'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Bots that actually determine whether a store shows up in an AI answer TODAY.
// This is the one that should drive most of the crawler-access score.
const ANSWER_BOTS = [
  { name: 'OAI-SearchBot', label: 'ChatGPT Search' },
  { name: 'ChatGPT-User', label: 'ChatGPT (on-demand browsing)' },
  { name: 'PerplexityBot', label: 'Perplexity' },
  { name: 'Claude-User', label: 'Claude (on-demand browsing)' },
  { name: 'Claude-SearchBot', label: 'Claude Search' },
  { name: 'Google-Extended', label: 'Gemini / Google AI' },
]

// Bots used for model training, not live answers. Blocking these is a legitimate
// content-licensing choice and shouldn't be scored the same as blocking answer bots.
const TRAINING_BOTS = [
  { name: 'GPTBot', label: 'OpenAI training' },
  { name: 'ClaudeBot', label: 'Anthropic training' },
  { name: 'CCBot', label: 'Common Crawl' },
  { name: 'Bytespider', label: 'ByteDance training' },
]

const SCHEMA_FIELDS = [
  { path: 'name', label: 'Product name', weight: 15 },
  { path: 'image', label: 'Product image', weight: 15 },
  { path: 'offers.price', label: 'Price', weight: 20 },
  { path: 'offers.availability', label: 'Stock availability', weight: 20 },
  { path: 'aggregateRating', label: 'Review rating', weight: 10 },
  { path: 'brand', label: 'Brand', weight: 10 },
  { path: ['gtin', 'gtin13', 'gtin12', 'gtin8', 'mpn', 'sku'], label: 'Product ID (GTIN/MPN/SKU)', weight: 10 },
]

function normalizeUrl(input) {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  return new URL(url)
}

// Simplified robots.txt parser: per bot, finds its block (exact match, else
// wildcard), and checks for a site-wide "Disallow: /". Path-level blocks
// (cart, checkout, account) are normal and not treated as a problem.
function parseRobots(text, botName) {
  const lines = text.split('\n').map((l) => l.trim())
  const blocks = []
  let current = null

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const [rawKey, ...rest] = line.split(':')
    const key = rawKey.trim().toLowerCase()
    const value = rest.join(':').trim()

    if (key === 'user-agent') {
      if (!current || current.rules.length > 0) {
        current = { agents: [value], rules: [] }
        blocks.push(current)
      } else {
        current.agents.push(value)
      }
    } else if ((key === 'disallow' || key === 'allow') && current) {
      current.rules.push({ type: key, value })
    } else {
      current = null
    }
  }

  const exact = blocks.find((b) => b.agents.some((a) => a.toLowerCase() === botName.toLowerCase()))
  const wildcard = blocks.find((b) => b.agents.includes('*'))
  const block = exact || wildcard

  if (!block) return { blocked: false, matchedBlock: 'none (default allow)' }

  const siteWideDisallow = block.rules.find((r) => r.type === 'disallow' && r.value === '/')
  const siteWideAllow = block.rules.find((r) => r.type === 'allow' && r.value === '/')

  const blocked = !!siteWideDisallow && !siteWideAllow
  return { blocked, matchedBlock: exact ? `User-agent: ${botName}` : 'User-agent: *' }
}

function getByPath(obj, path) {
  if (Array.isArray(path)) return path.some((p) => getByPath(obj, p) !== undefined)
  const parts = path.split('.')
  function resolve(node, remaining) {
    if (remaining.length === 0) return node
    if (node == null) return undefined
    // Shopify (and others) often emit "offers" as an array, one per variant.
    // Check every element for the remaining path instead of failing outright.
    if (Array.isArray(node)) {
      for (const item of node) {
        const result = resolve(item, remaining)
        if (result !== undefined) return result
      }
      return undefined
    }
    if (typeof node !== 'object') return undefined
    const [key, ...rest] = remaining
    return resolve(node[key], rest)
  }
  return resolve(obj, parts)
}

function findProductSchema(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const match of blocks) {
    try {
      const parsed = JSON.parse(match[1])
      const items = Array.isArray(parsed) ? parsed : parsed['@graph'] ? parsed['@graph'] : [parsed]
      const product = items.find((item) => {
        const type = item?.['@type']
        return type === 'Product' || (Array.isArray(type) && type.includes('Product'))
      })
      if (product) return product
    } catch {
      // malformed JSON-LD block, skip it
    }
  }
  return null
}

// If someone scans a homepage (very common in practice), try to find an actual
// product page linked from it and scan that instead of just saying "no schema here."
function findProductLink(html, baseUrl) {
  const matches = [...html.matchAll(/href=["']([^"'#?]*\/products\/[a-zA-Z0-9\-_%]+)[^"']*["']/gi)]
  for (const m of matches) {
    try {
      return new URL(m[1], baseUrl).toString()
    } catch {
      continue
    }
  }
  return null
}

function textVisibilityCheck(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  const body = bodyMatch ? bodyMatch[1] : html

  const withoutScripts = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')

  const text = withoutScripts
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const hasEmptyRootShell = /<div[^>]+id=["'](root|app|__next)["'][^>]*>\s*<\/div>/i.test(body)

  return { textLength: text.length, hasEmptyRootShell, sample: text.slice(0, 200) }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { url: rawUrl } = await req.json()
    if (!rawUrl) throw new Error('Missing url')

    const target = normalizeUrl(rawUrl)
    const checklist = []

    // --- 1. Crawler access (robots.txt) ---
    let robotsText = ''
    try {
      const robotsRes = await fetch(`${target.origin}/robots.txt`, { signal: AbortSignal.timeout(8000) })
      robotsText = robotsRes.ok ? await robotsRes.text() : ''
    } catch {
      robotsText = ''
    }

    let answerBotsBlocked = 0
    for (const bot of ANSWER_BOTS) {
      const result = parseRobots(robotsText, bot.name)
      if (result.blocked) answerBotsBlocked++
      checklist.push({
        category: 'crawler_access',
        pass: !result.blocked,
        label: `${bot.label} (${bot.name})`,
        detail: result.blocked
          ? `Blocked site-wide in robots.txt. This bot can't see your store at all.`
          : `Not blocked — can access your store.`,
        fix: result.blocked ? `Remove the site-wide "Disallow: /" rule for ${bot.name} in robots.txt.` : null,
      })
    }

    for (const bot of TRAINING_BOTS) {
      const result = parseRobots(robotsText, bot.name)
      checklist.push({
        category: 'training_bots_informational',
        pass: !result.blocked,
        label: `${bot.label} (${bot.name})`,
        detail: result.blocked
          ? `Blocked. This only affects model training use, not whether you show up in AI answers today.`
          : `Not blocked.`,
        fix: null,
      })
    }

    const scoreCrawlerAccess = Math.round(((ANSWER_BOTS.length - answerBotsBlocked) / ANSWER_BOTS.length) * 100)

    // --- 2. Fetch the actual page ---
    let scannedUrl = target
    let pageRes = await fetch(target.toString(), {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'PromptArchitect-Scanner/1.0' },
    })
    let html = await pageRes.text()

    // --- 3. Structured data (with homepage auto-discovery) ---
    let product = findProductSchema(html)
    let autoDiscoveredFrom = null
    const looksLikeHomepage = target.pathname === '/' || target.pathname === ''

    if (!product && looksLikeHomepage) {
      const discovered = findProductLink(html, target.toString())
      if (discovered) {
        try {
          const discoveredRes = await fetch(discovered, {
            signal: AbortSignal.timeout(10000),
            headers: { 'User-Agent': 'PromptArchitect-Scanner/1.0' },
          })
          const discoveredHtml = await discoveredRes.text()
          const discoveredProduct = findProductSchema(discoveredHtml)
          // Only switch over if the discovered page actually has product schema —
          // otherwise stick with the original homepage result.
          if (discoveredProduct) {
            autoDiscoveredFrom = target.toString()
            scannedUrl = new URL(discovered)
            html = discoveredHtml
            product = discoveredProduct
          }
        } catch {
          // discovered link didn't resolve; fall through to homepage messaging below
        }
      }
    }

    let structuredDataEarned = 0
    const structuredDataTotal = SCHEMA_FIELDS.reduce((sum, f) => sum + f.weight, 0)

    if (!product) {
      checklist.push({
        category: 'structured_data',
        pass: false,
        label: 'Product schema (JSON-LD)',
        detail: looksLikeHomepage
          ? `This looks like your store's homepage, not a product page — and no linked product page could be found automatically either. Homepages don't carry Product schema, that's expected.`
          : 'No Product schema found on this page at all.',
        fix: looksLikeHomepage
          ? 'Scan a specific product page instead (e.g. yourstore.com/products/some-item) to check its schema.'
          : 'Add JSON-LD Product structured data — this is the main way AI shopping assistants read price, stock, and ratings.',
      })
    } else {
      for (const field of SCHEMA_FIELDS) {
        const present = getByPath(product, field.path)
        if (present) structuredDataEarned += field.weight
        checklist.push({
          category: 'structured_data',
          pass: !!present,
          label: field.label,
          detail: present ? 'Present in schema.' : 'Missing from schema.',
          fix: present ? null : `Add "${Array.isArray(field.path) ? field.path[0] : field.path}" to your Product JSON-LD.`,
        })
      }
    }
    const scoreStructuredData = product ? Math.round((structuredDataEarned / structuredDataTotal) * 100) : 0

    // --- 4. Content visibility (JS-rendering gap) ---
    const visibility = textVisibilityCheck(html)
    let scoreContentVisibility
    if (visibility.hasEmptyRootShell || visibility.textLength < 200) {
      scoreContentVisibility = 10
      checklist.push({
        category: 'content_visibility',
        pass: false,
        label: 'Content visible without JavaScript',
        detail: `Only ${visibility.textLength} characters of real text found in the raw HTML. AI crawlers don't run JavaScript, so this page likely looks nearly blank to them even though it looks fine in a browser.`,
        fix: 'Server-render (or pre-render) product title, price, and description into the initial HTML instead of relying on client-side JavaScript.',
      })
    } else if (visibility.textLength < 600) {
      scoreContentVisibility = 55
      checklist.push({
        category: 'content_visibility',
        pass: null,
        label: 'Content visible without JavaScript',
        detail: `${visibility.textLength} characters of text found in raw HTML — partial content. Some key details may be missing from what crawlers see.`,
        fix: 'Check that price, availability, and full description are in the server-rendered HTML, not injected by JS.',
      })
    } else {
      scoreContentVisibility = 100
      checklist.push({
        category: 'content_visibility',
        pass: true,
        label: 'Content visible without JavaScript',
        detail: `${visibility.textLength} characters of real text found in raw HTML — good, this page is readable by non-JS crawlers.`,
        fix: null,
      })
    }

    // --- 5. Overall score ---
    const scoreOverall = Math.round(
      scoreCrawlerAccess * 0.35 + scoreStructuredData * 0.4 + scoreContentVisibility * 0.25,
    )

    // --- 6. Save result ---
    const id = nanoid()
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

    const result = {
      id,
      url: scannedUrl.toString(),
      autoDiscoveredFrom,
      scores: {
        overall: scoreOverall,
        crawler_access: scoreCrawlerAccess,
        structured_data: scoreStructuredData,
        content_visibility: scoreContentVisibility,
      },
      checklist,
    }

    const { error } = await supabase.from('scans').insert({
      id,
      url: scannedUrl.toString(),
      score_overall: scoreOverall,
      score_crawler_access: scoreCrawlerAccess,
      score_structured_data: scoreStructuredData,
      score_content_visibility: scoreContentVisibility,
      details: checklist,
      auto_discovered_from: autoDiscoveredFrom,
    })
    if (error) throw error

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Scan failed' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
})
