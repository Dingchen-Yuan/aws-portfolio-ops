import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows published projects when the API is healthy', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)

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
                coverImageUrl: null,
                pdfUrl: null,
                published: true,
                sortOrder: 1,
              },
            ]),
        }
      }),
    )

    render(<App />)

    expect(
      screen.getByRole('heading', { name: /selected projects/i }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/api online/i)).toBeInTheDocument()
    expect(await screen.findByText('FocusForge')).toBeInTheDocument()
    expect(screen.getByText('Cognitive training app')).toBeInTheDocument()
  })
})
