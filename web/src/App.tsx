import { useEffect, useState } from 'react'
import { getApiHealth } from './api.ts'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking')

  useEffect(() => {
    const controller = new AbortController()

    getApiHealth(controller.signal)
      .then(() => setApiStatus('online'))
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiStatus('offline')
        }
      })

    return () => controller.abort()
  }, [])

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">AWS PORTFOLIO OPS</p>
        <h1>Portfolio frontend foundation</h1>
        <p className="intro">
          React presents the portfolio while NestJS, PostgreSQL, and AWS manage
          its content and assets.
        </p>
        <div className={`status status--${apiStatus}`} role="status">
          <span aria-hidden="true" />
          API {apiStatus}
        </div>
      </section>

      <section className="architecture" aria-labelledby="architecture-title">
        <h2 id="architecture-title">Application flow</h2>
        <div className="architecture__grid">
          <article>
            <strong>React</strong>
            <p>Public portfolio interface</p>
          </article>
          <article>
            <strong>NestJS</strong>
            <p>Content and asset API</p>
          </article>
          <article>
            <strong>AWS</strong>
            <p>S3 and CloudFront delivery</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
