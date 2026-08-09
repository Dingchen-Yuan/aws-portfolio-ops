import { matchAdminRoute, matchProjectSlug } from './match-route.ts'
import { Router, usePath } from './router.tsx'
import { AdminLoginPage } from './pages/AdminLoginPage.tsx'
import { AdminProjectsPage } from './pages/AdminProjectsPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { ProjectDetailPage } from './pages/ProjectDetailPage.tsx'
import './App.css'

function AppRoutes() {
  const path = usePath()
  const adminRoute = matchAdminRoute(path)
  const projectSlug = matchProjectSlug(path)

  if (adminRoute === 'login') {
    return <AdminLoginPage />
  }

  if (adminRoute === 'projects') {
    return <AdminProjectsPage />
  }

  if (projectSlug) {
    return <ProjectDetailPage slug={projectSlug} />
  }

  return <HomePage />
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App
