export function matchProjectSlug(path: string): string | null {
  const match = path.match(/^\/projects\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

export function matchAdminRoute(
  path: string,
): 'login' | 'projects' | null {
  if (path === '/admin/login' || path === '/admin/login/') {
    return 'login'
  }

  if (path === '/admin' || path === '/admin/') {
    return 'projects'
  }

  return null
}
