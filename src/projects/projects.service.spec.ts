import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
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
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

  it('lists all projects for admin management', async () => {
    prisma.project.findMany.mockResolvedValue([publishedProject]);

    await expect(service.findAll()).resolves.toEqual([publishedProject]);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
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

  it('creates a project', async () => {
    prisma.project.create.mockResolvedValue(publishedProject);

    await expect(
      service.create({
        slug: 'aws-portfolio-ops',
        title: 'AWS Portfolio Ops',
        summary: 'Cloud-backed portfolio operations API',
        description: 'NestJS, Prisma, and AWS delivery for portfolio assets.',
        tags: ['aws', 'nestjs'],
        published: true,
        sortOrder: 1,
      }),
    ).resolves.toEqual(publishedProject);
  });

  it('rejects duplicate project slugs', async () => {
    prisma.project.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({
        slug: 'aws-portfolio-ops',
        title: 'AWS Portfolio Ops',
        summary: 'Cloud-backed portfolio operations API',
        description: 'NestJS, Prisma, and AWS delivery for portfolio assets.',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates an existing project', async () => {
    prisma.project.findUnique.mockResolvedValue(publishedProject);
    prisma.project.update.mockResolvedValue({
      ...publishedProject,
      title: 'Updated title',
    });

    await expect(
      service.update('proj_1', { title: 'Updated title' }),
    ).resolves.toEqual({
      ...publishedProject,
      title: 'Updated title',
    });
  });

  it('removes an existing project', async () => {
    prisma.project.findUnique.mockResolvedValue(publishedProject);
    prisma.project.delete.mockResolvedValue(publishedProject);

    await expect(service.remove('proj_1')).resolves.toEqual(publishedProject);
    expect(prisma.project.delete).toHaveBeenCalledWith({
      where: { id: 'proj_1' },
    });
  });
});
