import { useEffect, useState } from 'react'
import {
  clearAdminToken,
  getAdminToken,
  listAdminProjects,
  updateAdminProject,
  type ProjectDetail,
} from '../api.ts'
import { Link, useNavigate } from '../router.tsx'

export function AdminProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectDetail[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!getAdminToken()) {
      navigate('/admin/login')
      return
    }

    const controller = new AbortController()

    listAdminProjects(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setProjects(items)
          setError('')
          setIsLoading(false)
        }
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load admin projects.'
        setError(message)
        setIsLoading(false)

        if (message.includes('Session expired')) {
          navigate('/admin/login')
        }
      })

    return () => controller.abort()
  }, [navigate])

  async function handleTogglePublished(project: ProjectDetail) {
    setUpdatingId(project.id)
    setError('')

    try {
      const updated = await updateAdminProject(project.id, {
        published: !project.published,
      })
      setProjects((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to update project.'
      setError(message)
      if (message.includes('Session expired')) {
        navigate('/admin/login')
      }
    } finally {
      setUpdatingId(null)
    }
  }

  function handleSignOut() {
    clearAdminToken()
    navigate('/admin/login')
  }

  return (
    <main className="admin">
      <section className="admin__panel admin__panel--wide">
        <div className="admin__header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Projects</h1>
          </div>
          <div className="admin__actions">
            <Link to="/">View site</Link>
            <button className="admin__text-button" onClick={handleSignOut} type="button">
              Sign out
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="projects__empty">Loading projects…</p>
        ) : error ? (
          <p className="admin__error">{error}</p>
        ) : projects.length === 0 ? (
          <p className="projects__empty">No projects found.</p>
        ) : (
          <ul className="admin__list">
            {projects.map((project) => (
              <li key={project.id}>
                <div>
                  <strong>{project.title}</strong>
                  <span>{project.slug}</span>
                </div>
                <button
                  disabled={updatingId === project.id}
                  onClick={() => {
                    void handleTogglePublished(project)
                  }}
                  type="button"
                >
                  {updatingId === project.id
                    ? 'Saving…'
                    : project.published
                      ? 'Unpublish'
                      : 'Publish'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
