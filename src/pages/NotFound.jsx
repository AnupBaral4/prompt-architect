import styles from './Home.module.css'

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.brand}>Prompt Architect</div>
        <h1 className={styles.heading}>Page not found</h1>
        <p className={styles.subtext}>
          That page doesn't exist — it may have moved, or the link was wrong.
        </p>
        <a className={styles.cta} href="/">
          Back to homepage →
        </a>
      </div>
    </div>
  )
}
