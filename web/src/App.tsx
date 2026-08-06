import { matchProjectSlug } from './match-route.ts'
import { Router, usePath } from './router.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { ProjectDetailPage } from './pages/ProjectDetailPage.tsx'
import './App.css'

function AppRoutes() {
  const path = usePath()
  const projectSlug = matchProjectSlug(path)

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
