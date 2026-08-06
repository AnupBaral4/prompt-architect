import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <div className={styles.brand}>Prompt Architect</div>
        <h1 className={styles.heading}>We're building something new.</h1>
        <p className={styles.subtext}>
          Our old AI prompt generator has been retired. A new free tool for
          online store owners is on the way — check back soon.
        </p>
        <a className={styles.contactLink} href="/contact.html">
          Have feedback or a question? Get in touch →
        </a>
      </div>
      <footer className={styles.footer}>&copy; 2026 Prompt Architect</footer>
    </div>
  )
}
