import { useEffect, useMemo, useState } from 'react'
import { getApiHealth, listProjects, type ProjectSummary } from '../api.ts'
import { ProjectCard } from '../components/ProjectCard.tsx'

export function HomePage() {
  const [apiStatus, setApiStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking')
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [projectsError, setProjectsError] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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

  const tags = useMemo(() => {
    const unique = new Set<string>()
    for (const project of projects) {
      for (const tag of project.tags) {
        unique.add(tag)
      }
    }
    return [...unique].sort((a, b) => a.localeCompare(b))
  }, [projects])

  const visibleProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return projects.filter((project) => {
      if (selectedTag && !project.tags.includes(selectedTag)) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = [
        project.title,
        project.summary,
        project.slug,
        ...project.tags,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [projects, searchQuery, selectedTag])

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
        <label className="projects__search-label" htmlFor="project-search">
          Search projects
        </label>
        <input
          className="projects__search"
          id="project-search"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by title, summary, or tag…"
          type="search"
          value={searchQuery}
        />
        {tags.length > 0 && (
          <div
            aria-label="Filter projects by tag"
            className="projects__filters"
            role="group"
          >
            <button
              aria-pressed={selectedTag === null}
              className={
                selectedTag === null
                  ? 'projects__filter projects__filter--active'
                  : 'projects__filter'
              }
              onClick={() => setSelectedTag(null)}
              type="button"
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                aria-pressed={selectedTag === tag}
                className={
                  selectedTag === tag
                    ? 'projects__filter projects__filter--active'
                    : 'projects__filter'
                }
                key={tag}
                onClick={() =>
                  setSelectedTag((current) => (current === tag ? null : tag))
                }
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        {projectsError ? (
          <p className="projects__empty">
            Unable to load projects from the API.
          </p>
        ) : projects.length === 0 ? (
          <p className="projects__empty">
            No published projects yet. Seed the database to see sample entries.
          </p>
        ) : visibleProjects.length === 0 ? (
          <p className="projects__empty">
            {searchQuery.trim()
              ? `No projects match “${searchQuery.trim()}”.`
              : `No projects match the “${selectedTag}” tag.`}
          </p>
        ) : (
          <div className="projects__grid">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
