import styles from './HowItWorks.module.css'

export default function CaseStudy() {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.brand}>Prompt Architect</div>
        <h1 className={styles.heading}>
          We scanned real Shopify stores for AI visibility. One of them was ours.
        </h1>
        <p className={styles.lede}>
          We built a free tool that checks whether AI shopping assistants can actually read a
          Shopify product page. Before writing a word about how it works, we ran it against real
          stores — including, eventually, our own. Here's what we found.
        </p>

        <h2 className={styles.h2}>Two stores, same near-perfect score</h2>
        <p className={styles.p}>
          We started with a couple of small independent Shopify stores — a clothing boutique and a
          merch shop, both real, both live. Both came back at <strong>96/100</strong>. Crawler
          access: fully open. Content visibility: fine, real text in the raw HTML. The only thing
          either was missing was <code className={styles.code}>aggregateRating</code> in their
          product schema — no review-rating markup, which is common on smaller stores without a
          dedicated reviews app installed.
        </p>
        <p className={styles.p}>
          One pattern showed up immediately and kept repeating: people paste their homepage, not a
          product page. Every single early test — ours included, before we built a fix for it —
          was someone's root domain, not a product URL. We ended up building the scanner to
          auto-detect this and find a real product page on its own, because the mistake was
          apparently universal.
        </p>

        <h2 className={styles.h2}>Then we scanned our own site</h2>
        <p className={styles.p}>
          We run Debnix, a separate Shopify inventory app, and its marketing site and blog have
          been our main growth channel for months — SEO content, community posts, the whole
          strategy. Scanning debnix.com felt like a formality.
        </p>
        <p className={styles.p}>
          It came back <strong>0 characters of real text</strong> in the raw HTML. Not low. Zero.
          Same result on the homepage and on one of our best-performing blog posts. To an AI
          crawler that doesn't execute JavaScript, both pages were an empty shell —{' '}
          <code className={styles.code}>&lt;div id="root"&gt;&lt;/div&gt;</code> and nothing else.
          A human visitor saw a completely normal page. A crawler saw almost nothing.
        </p>
        <p className={styles.p}>
          The cause was simple in hindsight: the whole site — app and blog both — was a
          client-rendered React app with no server-side rendering or pre-rendering step anywhere.
          Every page, including content we'd spent real time writing, only existed after JavaScript
          ran. Worse, every route was also serving the same generic homepage title and meta
          description in the raw response, since our meta tags only updated client-side too — so a
          blog post about inventory audits was announcing itself as our homepage to anything reading
          raw HTML.
        </p>

        <h2 className={styles.h2}>What we did about it</h2>
        <p className={styles.p}>
          We added a build-time prerendering step scoped to just the public marketing and blog
          routes — the authenticated app behind login was correctly left alone, since it was never
          meant to be crawled anyway. After deploying, we re-ran the exact same scans:{' '}
          <strong>content visibility went from 10 to 100</strong> on both the homepage and the
          blog post, with real text — thousands of characters of it — now present in the raw
          response.
        </p>

        <h2 className={styles.h2}>The actual lesson here</h2>
        <p className={styles.p}>
          Crawler access almost never breaks by accident — robots.txt defaults are permissive, and
          nobody hand-writes a block on their own AI traffic. The two things that actually go
          wrong, repeatedly, across every store we've tested: missing structured data (usually just
          one or two fields, not everything), and content that only exists after JavaScript runs.
        </p>
        <p className={styles.p}>
          The second one is the dangerous one, because it's completely invisible from a normal
          browser. Your page looks fine to you. It can still look like nothing to the exact systems
          you're trying to be found by. That said — this is much rarer for typical Shopify stores
          than it sounds. We wrote up{' '}
          <a href="/blog/shopify-theme-vs-apps-javascript-ai" style={{ color: 'var(--phosphor)' }}>
            why most Shopify themes don't actually have this problem
          </a>
          , and where the real risk usually hides instead.
        </p>

        <a className={styles.cta} href="/scan">
          Scan your own store free →
        </a>

        <a className={styles.backHome} href="/">
          ← Back home
        </a>
      </div>
    </div>
  )
}
