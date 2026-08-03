import { Controller, Get, Param } from '@nestjs/common';
import type { Project } from '../generated/prisma/client';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  listPublished(): Promise<Project[]> {
    return this.projectsService.findPublished();
  }

  @Get(':slug')
  getPublishedBySlug(@Param('slug') slug: string): Promise<Project> {
    return this.projectsService.findPublishedBySlug(slug);
  }
}
