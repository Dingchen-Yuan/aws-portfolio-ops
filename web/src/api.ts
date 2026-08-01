const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

interface HealthResponse {
  status: 'ok'
  timestamp: string
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
