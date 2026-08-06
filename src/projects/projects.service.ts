import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import type { Project } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished(): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findAll(): Promise<Project[]> {
    return this.prisma.project.findMany({
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

  async findById(id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project "${id}" was not found`);
    }

    return project;
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    try {
      return await this.prisma.project.create({
        data: {
          slug: dto.slug,
          title: dto.title,
          summary: dto.summary,
          description: dto.description,
          tags: dto.tags ?? [],
          coverImageUrl: dto.coverImageUrl,
          pdfUrl: dto.pdfUrl,
          published: dto.published ?? false,
          sortOrder: dto.sortOrder ?? 0,
        },
      });
    } catch (error) {
      this.rethrowUniqueSlugConflict(error, dto.slug);
      throw error;
    }
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.findById(id);

    try {
      return await this.prisma.project.update({
        where: { id },
        data: {
          slug: dto.slug,
          title: dto.title,
          summary: dto.summary,
          description: dto.description,
          tags: dto.tags,
          coverImageUrl: dto.coverImageUrl,
          pdfUrl: dto.pdfUrl,
          published: dto.published,
          sortOrder: dto.sortOrder,
        },
      });
    } catch (error) {
      this.rethrowUniqueSlugConflict(error, dto.slug);
      throw error;
    }
  }

  async remove(id: string): Promise<Project> {
    await this.findById(id);

    return this.prisma.project.delete({
      where: { id },
    });
  }

  private rethrowUniqueSlugConflict(error: unknown, slug?: string): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        `Project slug "${slug ?? 'unknown'}" is already in use`,
      );
    }
  }
}
