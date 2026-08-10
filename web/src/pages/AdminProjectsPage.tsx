import { useEffect, useState, type FormEvent } from 'react'
import {
  clearAdminToken,
  createAdminProject,
  deleteAdminProject,
  getAdminToken,
  listAdminProjects,
  updateAdminProject,
  type ProjectDetail,
} from '../api.ts'
import { Link, useNavigate } from '../router.tsx'

const emptyForm = {
  slug: '',
  title: '',
  summary: '',
  description: '',
  tags: '',
  published: false,
}

export function AdminProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectDetail[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isCreating, setIsCreating] = useState(false)

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

  function handleAuthError(message: string) {
    setError(message)
    if (message.includes('Session expired')) {
      navigate('/admin/login')
    }
  }

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
      handleAuthError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to update project.',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDelete(project: ProjectDetail) {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) {
      return
    }

    setUpdatingId(project.id)
    setError('')

    try {
      await deleteAdminProject(project.id)
      setProjects((current) => current.filter((item) => item.id !== project.id))
    } catch (requestError) {
      handleAuthError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to delete project.',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreating(true)
    setError('')

    const tags = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    try {
      const created = await createAdminProject({
        slug: form.slug.trim(),
        title: form.title.trim(),
        summary: form.summary.trim(),
        description: form.description.trim(),
        tags,
        published: form.published,
      })
      setProjects((current) => [created, ...current])
      setForm(emptyForm)
    } catch (requestError) {
      handleAuthError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to create project.',
      )
    } finally {
      setIsCreating(false)
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

        <form className="admin__form admin__form--create" onSubmit={handleCreate}>
          <h2>New project</h2>
          <label htmlFor="project-slug">Slug</label>
          <input
            id="project-slug"
            minLength={2}
            onChange={(event) =>
              setForm((current) => ({ ...current, slug: event.target.value }))
            }
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            placeholder="my-project"
            required
            value={form.slug}
          />

          <label htmlFor="project-title">Title</label>
          <input
            id="project-title"
            minLength={2}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            required
            value={form.title}
          />

          <label htmlFor="project-summary">Summary</label>
          <input
            id="project-summary"
            minLength={8}
            onChange={(event) =>
              setForm((current) => ({ ...current, summary: event.target.value }))
            }
            required
            value={form.summary}
          />

          <label htmlFor="project-description">Description</label>
          <textarea
            id="project-description"
            minLength={16}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            required
            rows={4}
            value={form.description}
          />

          <label htmlFor="project-tags">Tags (comma-separated)</label>
          <input
            id="project-tags"
            onChange={(event) =>
              setForm((current) => ({ ...current, tags: event.target.value }))
            }
            placeholder="React, NestJS, AWS"
            value={form.tags}
          />

          <label className="admin__checkbox" htmlFor="project-published">
            <input
              checked={form.published}
              id="project-published"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  published: event.target.checked,
                }))
              }
              type="checkbox"
            />
            Publish immediately
          </label>

          <button disabled={isCreating} type="submit">
            {isCreating ? 'Creating…' : 'Create project'}
          </button>
        </form>

        {error && <p className="admin__error">{error}</p>}

        {isLoading ? (
          <p className="projects__empty">Loading projects…</p>
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
                <div className="admin__row-actions">
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
                  <button
                    className="admin__danger"
                    disabled={updatingId === project.id}
                    onClick={() => {
                      void handleDelete(project)
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
