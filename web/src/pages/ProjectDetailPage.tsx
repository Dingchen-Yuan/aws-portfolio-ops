import { useEffect, useState } from 'react'
import { Link } from '../router.tsx'
import { getProjectBySlug, type ProjectDetail } from '../api.ts'
import { copyText, projectShareUrl } from '../copyText.ts'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; project: ProjectDetail }

export function ProjectDetailPage({ slug }: { slug: string }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })

    getProjectBySlug(slug, controller.signal)
      .then((project) => {
        if (!controller.signal.aborted) {
          setState({ status: 'ready', project })
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Unable to load project',
          })
        }
      })

    return () => controller.abort()
  }, [slug])

  return (
    <main className="detail">
      <p className="detail__back">
        <Link to="/">Back to projects</Link>
      </p>

      {state.status === 'loading' ? (
        <p className="projects__empty">Loading project...</p>
      ) : null}

      {state.status === 'error' ? (
        <section className="detail__panel">
          <h1>Project unavailable</h1>
          <p className="intro">{state.message}</p>
        </section>
      ) : null}

      {state.status === 'ready' ? (
        <article className="detail__panel">
          {state.project.coverImageUrl ? (
            <div className="detail__cover">
              <img
                src={state.project.coverImageUrl}
                alt={`${state.project.title} cover`}
              />
            </div>
          ) : null}

          <p className="eyebrow">{state.project.slug}</p>
          <h1>{state.project.title}</h1>
          <p className="intro">{state.project.summary}</p>

          <ul className="detail__tags">
            {state.project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          <div className="detail__body">
            {state.project.description
              .split('\n')
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>

          <p className="detail__actions">
            <button
              className="detail__copy"
              onClick={() => {
                void copyText(projectShareUrl(state.project.slug))
                  .then(() => {
                    setCopyStatus('copied')
                    window.setTimeout(() => setCopyStatus('idle'), 2000)
                  })
                  .catch(() => {
                    setCopyStatus('error')
                    window.setTimeout(() => setCopyStatus('idle'), 2500)
                  })
              }}
              type="button"
            >
              {copyStatus === 'copied'
                ? 'Copied'
                : copyStatus === 'error'
                  ? 'Copy failed'
                  : 'Copy link'}
            </button>
            {state.project.pdfUrl ? (
              <a href={state.project.pdfUrl} target="_blank" rel="noreferrer">
                Download PDF
              </a>
            ) : null}
          </p>
        </article>
      ) : null}
    </main>
  )
}
