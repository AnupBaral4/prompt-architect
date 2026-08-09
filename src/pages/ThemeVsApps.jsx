import styles from './HowItWorks.module.css'

export default function ThemeVsApps() {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.brand}>Prompt Architect</div>
        <h1 className={styles.heading}>
          Does your Shopify store actually have a JavaScript problem for AI crawlers?
        </h1>
        <p className={styles.lede}>
          Probably not your theme. Possibly one of your apps. Here's the difference, and why most
          of what's being written about this right now doesn't account for it.
        </p>

        <h2 className={styles.h2}>The scary version you've probably seen</h2>
        <p className={styles.p}>
          There's a lot of content right now about AI crawlers not executing JavaScript — GPTBot,
          ClaudeBot, and PerplexityBot fetch raw HTML and move on, so a page that only renders
          content client-side can look like an empty shell to them, even though it looks completely
          normal in a browser. That part is true, and it's a real problem. What's missing from
          almost all of it is any distinction between platforms — it's written as if every website
          is equally at risk, React SPA or not.
        </p>
        <p className={styles.p}>
          Shopify stores mostly aren't built the way that content assumes.
        </p>

        <h2 className={styles.h2}>How Shopify themes actually render</h2>
        <p className={styles.p}>
          Most Shopify stores run on Liquid, Shopify's own templating language. Liquid processes on
          Shopify's servers and sends back complete HTML — your product title, price, and
          description are already in the response before any JavaScript runs. This is the default
          for the entire Shopify Theme Store, including Dawn and every theme built on Online Store
          2.0. There's no client-side rendering step for your core content to hide behind.
        </p>
        <p className={styles.p}>
          Even Shopify's headless option, Hydrogen, ships server-side rendering by default. Going
          headless doesn't automatically create this problem — you'd have to specifically build a
          custom frontend that skips SSR, which is unusual and not how Hydrogen is meant to be used.
        </p>
        <p className={styles.p}>
          So if you're running a standard Shopify theme, or even a properly built Hydrogen
          storefront, your core product content is very likely fine at the theme level. That's
          worth knowing before spending time worrying about a problem you probably don't have.
        </p>

        <h2 className={styles.h2}>Where the real risk actually is</h2>
        <p className={styles.p}>
          The genuine risk for Shopify merchants isn't the theme — it's specific apps that inject
          content into the page after it loads, rather than having Shopify's servers render it up
          front. A few common patterns worth checking:
        </p>
        <p className={styles.p}>
          <strong>Review and rating apps</strong> that pull star ratings in via a client-side widget
          instead of writing them into the page's structured data. <strong>Dynamic pricing or
          discount apps</strong> that calculate and display the real price only after a script runs.{' '}
          <strong>Personalization or recommendation widgets</strong> that load an entire product
          section client-side. Any of these can leave a real gap in what an AI crawler sees, even
          though your theme itself is completely fine.
        </p>

        <h2 className={styles.h2}>How to actually check, instead of assuming</h2>
        <p className={styles.p}>
          "I use a normal Shopify theme so I'm fine" is a reasonable default, not a guarantee — the
          only way to know for sure is to look at what a crawler actually sees. You can check this
          yourself: view a product page's source (not the browser inspector, the actual raw
          response) and search for text you know is on the page, like the price. If it's there,
          you're fine. If it's missing, something on that page — usually an app — is injecting it
          client-side.
        </p>
        <p className={styles.p}>
          Our own scanner does exactly this check automatically, along with checking crawler access
          and structured data completeness, so you don't have to dig through source code by hand.
        </p>

        <h2 className={styles.h2}>What we actually found testing this</h2>
        <p className={styles.p}>
          In our own testing across real Shopify stores, theme-level content visibility came back
          clean every time — which lines up with what the Liquid architecture would predict. The
          one place we found a real, total content-visibility failure was on our own separate
          product, Debnix, which isn't a Shopify theme at all — it's a fully custom marketing site
          built as a client-rendered React app with no server rendering whatsoever. That's a much
          more extreme version of the problem than any typical Shopify app would cause, but it's a
          useful confirmation of the actual pattern: the failure showed up on custom, non-Liquid
          code, not on a standard storefront.
        </p>
        <p className={styles.p}>
          Read the full story in our{' '}
          <a href="/blog/ai-visibility-real-shopify-stores" style={{ color: 'var(--phosphor)' }}>
            case study on real store scans
          </a>
          , including how we found and fixed it.
        </p>

        <a className={styles.cta} href="/scan">
          Check your own store free →
        </a>

        <a className={styles.backHome} href="/">
          ← Back home
        </a>
      </div>
    </div>
  )
}
