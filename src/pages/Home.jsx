import styles from './Home.module.css'

const STEPS = [
  { n: '01', title: 'Paste a product URL', body: 'No signup, no email required. Just the link.' },
  { n: '02', title: 'Get scored', body: 'We check crawler access, structured data, and whether your content is readable without JavaScript.' },
  { n: '03', title: 'Fix what matters', body: 'Every failed check comes with a specific, actionable fix — not just a grade.' },
]

export default function Home() {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.brand}>Prompt Architect</div>
        <h1 className={styles.heading}>Can ChatGPT actually see your Shopify store?</h1>
        <p className={styles.subtext}>
          AI shopping assistants like ChatGPT and Perplexity can only recommend products they can
          read. Most Shopify stores are invisible to them — missing structured data, blocked
          crawlers, or content that only renders after JavaScript loads. Free scan, results in
          seconds.
        </p>
        <a className={styles.cta} href="/scan.html">
          Scan your store free →
        </a>
      </div>

      <div className={styles.steps}>
        <h2 className={styles.stepsHeading}>How it works</h2>
        <div className={styles.stepsGrid}>
          {STEPS.map((s) => (
            <div className={styles.step} key={s.n}>
              <div className={styles.stepNum}>{s.n}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <a className={styles.contactLink} href="/about.html">
          How this actually works →
        </a>
        <span className={styles.footerDot}>·</span>
        <a className={styles.contactLink} href="/contact.html">
          Get in touch →
        </a>
        <div className={styles.copyright}>&copy; 2026 Prompt Architect</div>
      </footer>
    </div>
  )
}

