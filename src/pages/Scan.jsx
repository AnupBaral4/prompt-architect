import { useState, useEffect } from 'react'
import styles from './Scan.module.css'

const SCAN_URL = 'https://rzqcjsxkvdyxlkgerubu.supabase.co/functions/v1/scan'
const GET_SCAN_URL = 'https://rzqcjsxkvdyxlkgerubu.supabase.co/functions/v1/get-scan'

function scoreLabel(score) {
  if (score >= 80) return { text: 'Good', tone: 'good' }
  if (score >= 50) return { text: 'Needs work', tone: 'mid' }
  return { text: 'Poor', tone: 'bad' }
}

function ScoreBar({ label, score }) {
  const tone = scoreLabel(score).tone
  return (
    <div className={styles.scoreBar}>
      <div className={styles.scoreBarHead}>
        <span>{label}</span>
        <span className={styles[`tone_${tone}`]}>{score}</span>
      </div>
      <div className={styles.scoreTrack}>
        <div className={`${styles.scoreFill} ${styles[`fill_${tone}`]}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function ChecklistSection({ title, items }) {
  if (!items.length) return null
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {items.map((item, i) => (
        <div key={i} className={styles.checkItem}>
          <span className={item.pass ? styles.checkPass : item.pass === false ? styles.checkFail : styles.checkMid}>
            {item.pass ? '✅' : item.pass === false ? '❌' : '⚠️'}
          </span>
          <div>
            <div className={styles.checkLabel}>{item.label}</div>
            <div className={styles.checkDetail}>{item.detail}</div>
            {item.fix && <div className={styles.checkFix}>Fix: {item.fix}</div>}
            {item.label === 'Stock availability' && (
              <div className={styles.debnixNote}>
                AI shopping assistants weigh stock accuracy directly — a wrong "in stock" status is
                worse than none at all.{' '}
                <a href="https://debnix.com" target="_blank" rel="noopener noreferrer">
                  Debnix
                </a>{' '}
                keeps that data accurate automatically for Shopify stores.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Report({ result }) {
  const overall = scoreLabel(result.scores.overall)
  const crawlerItems = result.checklist.filter((c) => c.category === 'crawler_access')
  const trainingItems = result.checklist.filter((c) => c.category === 'training_bots_informational')
  const schemaItems = result.checklist.filter((c) => c.category === 'structured_data')
  const visibilityItems = result.checklist.filter((c) => c.category === 'content_visibility')

  const permalink = `${window.location.origin}/s/${result.id}`

  return (
    <div className={styles.report}>
      <div className={styles.reportHead}>
        {result.autoDiscoveredFrom && (
          <div className={styles.autoDiscoverNote}>
            You submitted your homepage — we found and scanned this product page instead:
          </div>
        )}
        <div className={styles.scannedUrl}>{result.url}</div>
        <div className={styles.overallRow}>
          <div className={`${styles.overallScore} ${styles[`tone_${overall.tone}`]}`}>{result.scores.overall}</div>
          <div className={`${styles.overallLabel} ${styles[`tone_${overall.tone}`]}`}>{overall.text}</div>
        </div>
      </div>

      <div className={styles.bars}>
        <ScoreBar label="Crawler Access" score={result.scores.crawler_access} />
        <ScoreBar label="Structured Data" score={result.scores.structured_data} />
        <ScoreBar label="Content Visibility" score={result.scores.content_visibility} />
      </div>

      <ChecklistSection title="Can AI shopping assistants reach this page?" items={crawlerItems} />
      <ChecklistSection title="Does your product data describe itself correctly?" items={schemaItems} />
      <ChecklistSection title="Is your content readable without JavaScript?" items={visibilityItems} />
      <ChecklistSection title="Training bots (informational — doesn't affect your score)" items={trainingItems} />

      <div className={styles.shareRow}>
        <input className={styles.shareInput} readOnly value={permalink} onFocus={(e) => e.target.select()} />
        <button
          className={styles.shareButton}
          onClick={() => navigator.clipboard.writeText(permalink)}
        >
          Copy link
        </button>
      </div>
    </div>
  )
}

export default function Scan() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id')
    if (!id) return
    setStatus('loading')
    fetch(`${GET_SCAN_URL}?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus('error')
          setError('Scan not found — the link may be wrong or the result expired.')
        } else {
          setResult(data)
          setStatus('done')
        }
      })
      .catch(() => {
        setStatus('error')
        setError('Could not load that scan.')
      })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch(SCAN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) {
        setStatus('error')
        setError(data.error)
        return
      }
      setResult(data)
      setStatus('done')
      window.history.pushState({}, '', `/scan?id=${data.id}`)
    } catch {
      setStatus('error')
      setError('Something went wrong reaching the scanner. Try again.')
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.brand}>Prompt Architect</div>
        <h1 className={styles.heading}>AI Visibility Scanner</h1>
        <p className={styles.subtext}>
          Check whether AI shopping assistants like ChatGPT and Perplexity can actually read your
          product page. Paste a product URL — not your homepage.
        </p>

        {status !== 'done' && (
          <div className={styles.terminal}>
            <div className={styles.termDots}>
              <span /><span /><span />
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.srLabel} htmlFor="scan-url">
                Product page URL
              </label>
              <div className={styles.inputRow}>
                <span className={`${styles.prompt} mono`} aria-hidden="true">
                  &gt;
                </span>
                <input
                  id="scan-url"
                  className={`${styles.urlInput} mono`}
                  type="text"
                  placeholder="yourstore.com/products/your-product"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <button className={styles.scanButton} type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <span className={styles.scanningLabel}>
                    <span className={styles.pulseDot} />
                    Scanning…
                  </span>
                ) : (
                  'Run scan →'
                )}
              </button>
            </form>
          </div>
        )}

        {status === 'error' && <p className={styles.errorText}>{error}</p>}
        {status === 'done' && result && <Report result={result} />}

        {status === 'done' && (
          <button
            className={styles.rescanLink}
            onClick={() => {
              setStatus('idle')
              setResult(null)
              setUrl('')
              window.history.pushState({}, '', '/scan')
            }}
          >
            ← Scan another page
          </button>
        )}
      </div>
    </div>
  )
}
