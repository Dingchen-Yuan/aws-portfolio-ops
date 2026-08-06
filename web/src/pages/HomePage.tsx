import { useEffect, useState } from 'react'
import { getApiHealth, listProjects, type ProjectSummary } from '../api.ts'
import { ProjectCard } from '../components/ProjectCard.tsx'

export function HomePage() {
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
        <p className="eyebrow">DINGCHEN YUAN</p>
        <h1>Selected projects</h1>
        <p className="intro">
          Cloud-backed portfolio work powered by NestJS, PostgreSQL, and AWS.
          Browse published projects below.
        </p>
        <div className={`status status--${apiStatus}`} role="status">
          <span aria-hidden="true" />
          API {apiStatus}
        </div>
      </section>

      <section className="projects" aria-labelledby="projects-title">
        <h2 id="projects-title">Published work</h2>
        {projectsError ? (
          <p className="projects__empty">
            Unable to load projects from the API.
          </p>
        ) : projects.length === 0 ? (
          <p className="projects__empty">
            No published projects yet. Seed the database to see sample entries.
          </p>
        ) : (
          <div className="projects__grid">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
