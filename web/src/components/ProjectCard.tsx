import { Link } from '../router.tsx'
import type { ProjectSummary } from '../api.ts'

interface ProjectCardProps {
  project: ProjectSummary
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="project-card">
      <Link to={`/projects/${project.slug}`} className="project-card__link">
        <div className="project-card__media">
          {project.coverImageUrl ? (
            <img
              src={project.coverImageUrl}
              alt={`${project.title} cover`}
              loading="lazy"
            />
          ) : (
            <div className="project-card__placeholder" aria-hidden="true">
              {project.title.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="project-card__body">
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <ul>
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <span className="project-card__cta">View project</span>
        </div>
      </Link>
    </article>
  )
}
