/* oxlint-disable react/only-export-components -- mini-router exports hooks alongside components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'

interface RouterContextValue {
  path: string
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

function readPath(): string {
  return window.location.pathname
}

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(readPath)

  useEffect(() => {
    const onPopState = () => setPath(readPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const value = useMemo(
    () => ({
      path,
      navigate: (to: string) => {
        if (to === readPath()) {
          return
        }

        window.history.pushState({}, '', to)
        setPath(to)
      },
    }),
    [path],
  )

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  )
}

function useRouter(): RouterContextValue {
  const context = useContext(RouterContext)

  if (!context) {
    throw new Error('Router hooks must be used inside <Router>')
  }

  return context
}

export function usePath(): string {
  return useRouter().path
}

export function useNavigate(): (to: string) => void {
  return useRouter().navigate
}

export function Link({
  to,
  children,
  className,
}: {
  to: string
  children: ReactNode
  className?: string
}) {
  const navigate = useNavigate()

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return
    }

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} className={className} onClick={onClick}>
      {children}
    </a>
  )
}
