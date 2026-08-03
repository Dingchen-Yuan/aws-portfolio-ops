import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  const publishedProject = {
    id: 'proj_1',
    slug: 'aws-portfolio-ops',
    title: 'AWS Portfolio Ops',
    summary: 'Cloud-backed portfolio operations API',
    description: 'NestJS, Prisma, and AWS delivery for portfolio assets.',
    tags: ['aws', 'nestjs'],
    coverImageUrl: null,
    pdfUrl: null,
    published: true,
    sortOrder: 1,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
  };

  const prisma = {
    project: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const service = new ProjectsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists published projects ordered for public display', async () => {
    prisma.project.findMany.mockResolvedValue([publishedProject]);

    await expect(service.findPublished()).resolves.toEqual([publishedProject]);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  });

  it('returns a published project by slug', async () => {
    prisma.project.findFirst.mockResolvedValue(publishedProject);

    await expect(
      service.findPublishedBySlug('aws-portfolio-ops'),
    ).resolves.toEqual(publishedProject);
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { slug: 'aws-portfolio-ops', published: true },
    });
  });

  it('throws when a published project slug is missing', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(service.findPublishedBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
