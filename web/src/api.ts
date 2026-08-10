const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

const ADMIN_TOKEN_KEY = 'portfolio-ops-admin-token'

interface HealthResponse {
  status: 'ok'
  database: 'up'
  timestamp: string
}

export interface ProjectSummary {
  id: string
  slug: string
  title: string
  summary: string
  tags: string[]
  coverImageUrl: string | null
  pdfUrl: string | null
  published: boolean
  sortOrder: number
}

export interface ProjectDetail extends ProjectSummary {
  description: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: string
}

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
}

export async function getApiHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, { signal })

  if (!response.ok) {
    throw new Error(`API health check failed with status ${response.status}`)
  }

  return (await response.json()) as HealthResponse
}

export async function listProjects(
  signal?: AbortSignal,
): Promise<ProjectSummary[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, { signal })

  if (!response.ok) {
    throw new Error(`Projects request failed with status ${response.status}`)
  }

  return (await response.json()) as ProjectSummary[]
}

export async function getProjectBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<ProjectDetail> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${encodeURIComponent(slug)}`,
    { signal },
  )

  if (response.status === 404) {
    throw new Error('Project not found')
  }

  if (!response.ok) {
    throw new Error(`Project request failed with status ${response.status}`)
  }

  return (await response.json()) as ProjectDetail
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Invalid username or password.'
        : `Login failed with status ${response.status}`,
    )
  }

  return (await response.json()) as LoginResponse
}

export async function listAdminProjects(
  signal?: AbortSignal,
): Promise<ProjectDetail[]> {
  const response = await authorizedFetch('/admin/projects', { signal })

  if (response.status === 401) {
    clearAdminToken()
    throw new Error('Session expired. Sign in again.')
  }

  if (!response.ok) {
    throw new Error(`Admin projects request failed with status ${response.status}`)
  }

  return (await response.json()) as ProjectDetail[]
}

export async function updateAdminProject(
  id: string,
  patch: { published: boolean },
): Promise<ProjectDetail> {
  const response = await authorizedFetch(`/admin/projects/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })

  if (response.status === 401) {
    clearAdminToken()
    throw new Error('Session expired. Sign in again.')
  }

  if (!response.ok) {
    throw new Error(`Project update failed with status ${response.status}`)
  }

  return (await response.json()) as ProjectDetail
}

export interface CreateAdminProjectInput {
  slug: string
  title: string
  summary: string
  description: string
  tags?: string[]
  published?: boolean
}

export async function createAdminProject(
  input: CreateAdminProjectInput,
): Promise<ProjectDetail> {
  const response = await authorizedFetch('/admin/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (response.status === 401) {
    clearAdminToken()
    throw new Error('Session expired. Sign in again.')
  }

  if (!response.ok) {
    throw new Error(`Project create failed with status ${response.status}`)
  }

  return (await response.json()) as ProjectDetail
}

export async function deleteAdminProject(id: string): Promise<void> {
  const response = await authorizedFetch(
    `/admin/projects/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )

  if (response.status === 401) {
    clearAdminToken()
    throw new Error('Session expired. Sign in again.')
  }

  if (!response.ok) {
    throw new Error(`Project delete failed with status ${response.status}`)
  }
}

async function authorizedFetch(path: string, init: RequestInit = {}) {
  const token = getAdminToken()
  const headers = new Headers(init.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })
}
