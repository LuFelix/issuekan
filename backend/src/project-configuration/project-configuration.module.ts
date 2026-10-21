import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectConfigurationEntity } from './project-configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectConfigurationEntity])],
  providers: [],
  controllers: [],
  exports: [],
})
export class ProjectConfigurationModule {}
