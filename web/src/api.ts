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
