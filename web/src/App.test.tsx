import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the portfolio foundation and a healthy API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'ok',
            timestamp: new Date().toISOString(),
          }),
      }),
    )

    render(<App />)

    expect(
      screen.getByRole('heading', { name: /portfolio frontend foundation/i }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/api online/i)).toBeInTheDocument()
  })
})
