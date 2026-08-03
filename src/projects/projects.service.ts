import { Injectable, NotFoundException } from '@nestjs/common';
import type { Project } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished(): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findPublishedBySlug(slug: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { slug, published: true },
    });

    if (!project) {
      throw new NotFoundException(`Published project "${slug}" was not found`);
    }

    return project;
  }
}
