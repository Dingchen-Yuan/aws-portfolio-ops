export function matchProjectSlug(path: string): string | null {
  const match = path.match(/^\/projects\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}
