import { useState, type FormEvent } from 'react'
import { login, setAdminToken } from '../api.ts'
import { Link, useNavigate } from '../router.tsx'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const tokens = await login(username, password)
      setAdminToken(tokens.accessToken)
      navigate('/admin')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to sign in.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="admin">
      <section className="admin__panel">
        <p className="eyebrow">Admin</p>
        <h1>Sign in</h1>
        <p className="intro">
          Manage published portfolio projects with your admin credentials.
        </p>
        <form className="admin__form" onSubmit={handleSubmit}>
          <label htmlFor="admin-username">Username</label>
          <input
            autoComplete="username"
            id="admin-username"
            onChange={(event) => setUsername(event.target.value)}
            required
            value={username}
          />

          <label htmlFor="admin-password">Password</label>
          <input
            autoComplete="current-password"
            id="admin-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
          {error && <p className="admin__error">{error}</p>}
        </form>
        <p className="admin__back">
          <Link to="/">Back to portfolio</Link>
        </p>
      </section>
    </main>
  )
}
