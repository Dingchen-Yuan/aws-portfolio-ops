import { useEffect, useState } from 'react'
import { getApiHealth, listProjects, type ProjectSummary } from './api.ts'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking')
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [projectsError, setProjectsError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    getApiHealth(controller.signal)
      .then(() => setApiStatus('online'))
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiStatus('offline')
        }
      })

    listProjects(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setProjects(items)
          setProjectsError(false)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setProjectsError(true)
        }
      })

    return () => controller.abort()
  }, [])

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">AWS PORTFOLIO OPS</p>
        <h1>Selected projects</h1>
        <p className="intro">
          React presents published portfolio projects while NestJS, PostgreSQL,
          and AWS manage content and delivery.
        </p>
        <div className={`status status--${apiStatus}`} role="status">
          <span aria-hidden="true" />
          API {apiStatus}
        </div>
      </section>

      <section className="projects" aria-labelledby="projects-title">
        <h2 id="projects-title">Published work</h2>
        {projectsError ? (
          <p className="projects__empty">Unable to load projects from the API.</p>
        ) : projects.length === 0 ? (
          <p className="projects__empty">
            No published projects yet. Seed the database to see sample entries.
          </p>
        ) : (
          <div className="projects__grid">
            {projects.map((project) => (
              <article key={project.id}>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <ul>
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
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
