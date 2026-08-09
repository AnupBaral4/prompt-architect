import styles from './HowItWorks.module.css'

export default function HowItWorks() {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.brand}>Prompt Architect</div>
        <h1 className={styles.heading}>How AI shopping assistants actually see your store</h1>
        <p className={styles.lede}>
          ChatGPT, Perplexity, and other AI assistants are starting to recommend products
          directly — but they can only recommend what they can actually read. Most stores are
          harder to read than their owners think. Here's what "visible to AI" really means,
          mechanically.
        </p>

        <h2 className={styles.h2}>Three separate things have to go right</h2>
        <p className={styles.p}>
          "AI visibility" isn't one setting you turn on. It's three independent layers, and a
          store can pass one and fail the other two without anyone noticing — the store still
          looks completely normal in a browser.
        </p>

        <h3 className={styles.h3}>1. Can the crawler actually reach the page?</h3>
        <p className={styles.p}>
          Your <code className={styles.code}>robots.txt</code> file controls this, and most
          advice online gets one thing wrong: it treats every "AI bot" the same. They're not.
        </p>
        <p className={styles.p}>
          <strong>Training bots</strong> — <code className={styles.code}>GPTBot</code>,{' '}
          <code className={styles.code}>ClaudeBot</code>,{' '}
          <code className={styles.code}>CCBot</code> — crawl content to train future models.
          Blocking them is a legitimate content-licensing choice and has nothing to do with
          whether you show up in an answer today.
        </p>
        <p className={styles.p}>
          <strong>Answer bots</strong> — <code className={styles.code}>OAI-SearchBot</code>{' '}
          (ChatGPT Search), <code className={styles.code}>ChatGPT-User</code> (on-demand
          browsing), <code className={styles.code}>PerplexityBot</code>,{' '}
          <code className={styles.code}>Claude-User</code> — fetch pages live, right now, to
          answer a real question someone just asked. These are the ones that determine whether
          you show up in a shopping answer. Blocking one of these is very different from blocking
          a training bot, and the two get conflated constantly.
        </p>

        <h3 className={styles.h3}>2. Does the page describe itself correctly?</h3>
        <p className={styles.p}>
          AI assistants don't parse your page the way a human reads it. They look for structured
          data — JSON-LD, usually a <code className={styles.code}>Product</code> schema block —
          that states plainly: this is the name, this is the price, this is whether it's in
          stock, this is the rating. Without it, an assistant is trying to guess price and
          availability from marketing copy, which it will often just decline to do.
        </p>
        <p className={styles.p}>
          The fields that matter most: <code className={styles.code}>name</code>,{' '}
          <code className={styles.code}>image</code>,{' '}
          <code className={styles.code}>offers.price</code>,{' '}
          <code className={styles.code}>offers.availability</code>,{' '}
          <code className={styles.code}>aggregateRating</code>, and a product identifier (
          <code className={styles.code}>gtin</code> or <code className={styles.code}>sku</code>
          ). Shopify's default themes usually generate most of this automatically — but "usually"
          is doing a lot of work in that sentence, and customized themes frequently break it
          without anyone realizing.
        </p>

        <h3 className={styles.h3}>3. Is the content actually there, or does it need JavaScript?</h3>
        <p className={styles.p}>
          This is the one that surprises people. Answer bots generally don't execute JavaScript —
          they read the raw HTML a server sends back, the same way{' '}
          <code className={styles.code}>view-source:</code> shows it. If your price, title, or
          description only appear after client-side JavaScript runs, a human sees a perfectly
          normal page and a crawler sees something close to blank.
        </p>
        <p className={styles.p}>
          This is invisible from a browser. The only way to know is to look at what the server
          actually sends before any JavaScript runs — which is exactly what a raw HTML fetch
          shows, and a normal page view never does.
        </p>

        <h2 className={styles.h2}>Check where your own store stands</h2>
        <p className={styles.p}>
          All three checks — crawler access, structured data, and raw content visibility — take
          about ten seconds to run against a real product page.
        </p>
        <a className={styles.cta} href="/scan.html">
          Scan your store free →
        </a>

        <a className={styles.backHome} href="/">
          ← Back home
        </a>
      </div>
    </div>
  )
}
