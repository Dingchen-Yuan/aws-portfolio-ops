const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

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
