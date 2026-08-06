import { useState } from 'react'
import styles from './Contact.module.css'

const WEB3FORMS_ACCESS_KEY = '8ba53645-0162-4356-9101-6fed185347f5'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          email_to: 'dev.promptarchitect@gmail.com',
          ...form,
        }),
      })
      const data = await res.json()
      setStatus(data.success ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className={styles.wrap}>
        <div className={styles.content}>
          <div className={styles.brand}>Prompt Architect</div>
          <h1 className={styles.heading}>Message sent.</h1>
          <p className={styles.subtext}>Thanks for reaching out — we'll get back to you soon.</p>
          <a className={styles.contactLink} href="/">← Back home</a>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <div className={styles.brand}>Prompt Architect</div>
        <h1 className={styles.heading}>Get in touch.</h1>
        <p className={styles.subtext}>
          Have feedback, a question, or an idea for the new tool? Send it over.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
          </div>
          <div className={styles.field}>
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="5" required value={form.message} onChange={handleChange} />
          </div>

          <button className={styles.submit} type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>

          {status === 'error' && (
            <p className={styles.errorText}>
              Something went wrong — email us directly at dev.promptarchitect@gmail.com instead.
            </p>
          )}
        </form>

        <a className={styles.contactLink} href="/">← Back home</a>
      </div>
    </div>
  )
}
