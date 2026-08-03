import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  const projects = [
    {
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
    },
  ];

  const projectsService = {
    findPublished: jest.fn(),
    findPublishedBySlug: jest.fn(),
  };

  const controller = new ProjectsController(
    projectsService as unknown as ProjectsService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists published projects', async () => {
    projectsService.findPublished.mockResolvedValue(projects);

    await expect(controller.listPublished()).resolves.toEqual(projects);
    expect(projectsService.findPublished).toHaveBeenCalled();
  });

  it('returns a published project by slug', async () => {
    projectsService.findPublishedBySlug.mockResolvedValue(projects[0]);

    await expect(
      controller.getPublishedBySlug('aws-portfolio-ops'),
    ).resolves.toEqual(projects[0]);
    expect(projectsService.findPublishedBySlug).toHaveBeenCalledWith(
      'aws-portfolio-ops',
    );
  });
});
