import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function mockFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'

      if (url.includes('/auth/login') && method === 'POST') {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              accessToken: 'test-token',
              tokenType: 'Bearer',
              expiresIn: '8h',
            }),
        }
      }

      if (url.includes('/admin/projects/') && method === 'DELETE') {
        return {
          ok: true,
          json: async () => null,
        }
      }

      if (url.includes('/admin/projects') && method === 'POST') {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              id: '2',
              slug: 'new-project',
              title: 'New Project',
              summary: 'Created from admin UI for testing.',
              description:
                'A longer description that satisfies the create validation rules.',
              tags: ['React'],
              coverImageUrl: null,
              pdfUrl: null,
              published: false,
              sortOrder: 0,
              createdAt: '2026-08-10T00:00:00.000Z',
              updatedAt: '2026-08-10T00:00:00.000Z',
            }),
        }
      }

      if (url.includes('/admin/projects/') && method === 'PATCH') {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              id: '1',
              slug: 'focusforge',
              title: 'FocusForge',
              summary: 'Cognitive training app',
              description:
                'Full-stack focus and memory training app with NestJS and React.',
              tags: ['React', 'NestJS'],
              coverImageUrl: 'https://example.cloudfront.net/cover.png',
              pdfUrl: 'https://example.cloudfront.net/resume.pdf',
              published: false,
              sortOrder: 1,
              createdAt: '2026-08-01T00:00:00.000Z',
              updatedAt: '2026-08-01T00:00:00.000Z',
            }),
        }
      }

      if (url.includes('/admin/projects')) {
        return {
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: '1',
                slug: 'focusforge',
                title: 'FocusForge',
                summary: 'Cognitive training app',
                description:
                  'Full-stack focus and memory training app with NestJS and React.',
                tags: ['React', 'NestJS'],
                coverImageUrl: 'https://example.cloudfront.net/cover.png',
                pdfUrl: 'https://example.cloudfront.net/resume.pdf',
                published: true,
                sortOrder: 1,
                createdAt: '2026-08-01T00:00:00.000Z',
                updatedAt: '2026-08-01T00:00:00.000Z',
              },
            ]),
        }
      }

      if (url.includes('/health')) {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'ok',
              database: 'up',
              timestamp: new Date().toISOString(),
            }),
        }
      }

      if (url.includes('/projects/focusforge')) {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              id: '1',
              slug: 'focusforge',
              title: 'FocusForge',
              summary: 'Cognitive training app',
              description:
                'Full-stack focus and memory training app with NestJS and React.',
              tags: ['React', 'NestJS'],
              coverImageUrl: 'https://example.cloudfront.net/cover.png',
              pdfUrl: 'https://example.cloudfront.net/resume.pdf',
              published: true,
              sortOrder: 1,
              createdAt: '2026-08-01T00:00:00.000Z',
              updatedAt: '2026-08-01T00:00:00.000Z',
            }),
        }
      }

      return {
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: '1',
              slug: 'focusforge',
              title: 'FocusForge',
              summary: 'Cognitive training app',
              tags: ['React', 'NestJS'],
              coverImageUrl: 'https://example.cloudfront.net/cover.png',
              pdfUrl: 'https://example.cloudfront.net/resume.pdf',
              published: true,
              sortOrder: 1,
            },
          ]),
      }
    }),
  )
}

describe('App', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    sessionStorage.clear()
    window.history.pushState({}, '', '/')
  })

  it('shows published projects with cover images on the home page', async () => {
    mockFetch()
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /selected projects/i }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/api online/i)).toBeInTheDocument()
    expect(await screen.findByText('FocusForge')).toBeInTheDocument()
    expect(screen.getByText('Cognitive training app')).toBeInTheDocument()
    expect(screen.getByAltText('FocusForge cover')).toHaveAttribute(
      'src',
      'https://example.cloudfront.net/cover.png',
    )
  })

  it('opens a project detail page with description and PDF link', async () => {
    const user = userEvent.setup()
    mockFetch()
    render(<App />)

    await user.click(await screen.findByRole('link', { name: /focusforge/i }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'FocusForge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Full-stack focus and memory training app with NestJS and React.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute(
      'href',
      'https://example.cloudfront.net/resume.pdf',
    )
    expect(
      screen.getByRole('link', { name: /back to projects/i }),
    ).toBeInTheDocument()
  })

  it('signs into admin and toggles project publish state', async () => {
    const user = userEvent.setup()
    mockFetch()
    window.history.pushState({}, '', '/admin/login')
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByRole('heading', { name: /projects/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('FocusForge')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /unpublish/i }))
    expect(await screen.findByRole('button', { name: /publish/i })).toBeInTheDocument()
  })

  it('creates a project from the admin form', async () => {
    const user = userEvent.setup()
    mockFetch()
    sessionStorage.setItem('portfolio-ops-admin-token', 'test-token')
    window.history.pushState({}, '', '/admin')
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: /new project/i }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^slug$/i), 'new-project')
    await user.type(screen.getByLabelText(/^title$/i), 'New Project')
    await user.type(
      screen.getByLabelText(/^summary$/i),
      'Created from admin UI for testing.',
    )
    await user.type(
      screen.getByLabelText(/^description$/i),
      'A longer description that satisfies the create validation rules.',
    )
    await user.click(screen.getByRole('button', { name: /create project/i }))

    expect(await screen.findByText('New Project')).toBeInTheDocument()
    expect(screen.getByText('new-project')).toBeInTheDocument()
  })
})
