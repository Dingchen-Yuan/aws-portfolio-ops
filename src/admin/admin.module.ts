import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { AdminController } from './admin.controller';
import { AdminProjectsController } from './admin-projects.controller';

@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [AdminController, AdminProjectsController],
})
export class AdminModule {}
