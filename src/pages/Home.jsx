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
          crawlers, or content that only renders after JavaScript loads.
        </p>
      </div>

      <div className={styles.compare} aria-hidden="true">
        <div className={styles.pane}>
          <div className={`${styles.paneLabel} mono`}>What shoppers see</div>
          <div className={styles.paneWindow}>
            <div className={styles.dots}>
              <span /><span /><span />
            </div>
            <div className={styles.mockCard}>
              <div className={styles.mockImage}>
                <svg viewBox="0 0 120 70" className={styles.shoeIcon} aria-hidden="true">
                  <path
                    d="M8 52c0-6 3-10 8-13l14-8c4-2 7-6 8-10 1-4 4-6 8-5l22 6c5 1 9 4 11 9l6 14c1 3 0 6-3 7-6 2-45 2-64 2-6 0-10-1-10-2z"
                    fill="none"
                    stroke="#7a6f52"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <path d="M8 52c0 3 4 4 10 4h64c3 0 4-1 4-3" fill="none" stroke="#7a6f52" strokeWidth="2.5" />
                  <path d="M38 21c2 5 6 9 11 11" fill="none" stroke="#7a6f52" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className={styles.mockTitle}>Wool Runner — Natural</div>
              <div className={styles.mockPrice}>$98.00 · In stock</div>
              <div className={styles.mockButton}>Add to cart</div>
            </div>
          </div>
        </div>

        <div className={styles.vs}>vs</div>

        <div className={styles.pane}>
          <div className={`${styles.paneLabel} mono`}>What GPTBot sees</div>
          <div className={`${styles.paneWindow} ${styles.paneWindowEmpty}`}>
            <div className={styles.dots}>
              <span /><span /><span />
            </div>
            <div className={`${styles.mockCode} mono`}>
              <span className={styles.punct}>&lt;</span>
              <span className={styles.tag}>body</span>
              <span className={styles.punct}>&gt;</span>
              <br />
              &nbsp;&nbsp;
              <span className={styles.punct}>&lt;</span>
              <span className={styles.tag}>div</span> <span className={styles.attr}>id</span>
              <span className={styles.punct}>=</span>
              <span className={styles.str}>"root"</span>
              <span className={styles.punct}>&gt;&lt;/</span>
              <span className={styles.tag}>div</span>
              <span className={styles.punct}>&gt;</span>
              <br />
              <span className={styles.punct}>&lt;/</span>
              <span className={styles.tag}>body</span>
              <span className={styles.punct}>&gt;</span>
            </div>
          </div>
        </div>
      </div>

      <a className={styles.cta} href="/scan">
        Scan your store free →
      </a>

      <div className={styles.steps}>
        <h2 className={styles.stepsHeading}>How it works</h2>
        <div className={styles.stepsGrid}>
          {STEPS.map((s) => (
            <div className={styles.step} key={s.n}>
              <div className={`${styles.stepNum} mono`}>{s.n}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <a className={styles.contactLink} href="/about">
          How this actually works →
        </a>
        <span className={styles.footerDot}>·</span>
        <a className={styles.contactLink} href="/blog/ai-visibility-real-shopify-stores">
          Read the case study →
        </a>
        <span className={styles.footerDot}>·</span>
        <a className={styles.contactLink} href="/contact">
          Get in touch →
        </a>
        <div className={styles.copyright}>&copy; 2026 Prompt Architect</div>
      </footer>
    </div>
  )
}


