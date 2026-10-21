import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('project_configurations')
@Index(['project_id'])
export class ProjectConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  @Index()
  project_id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'pt-BR' })
  preferred_language: string;

  @Column({ type: 'varchar', default: 'medium' })
  default_priority: string;

  @Column({ type: 'jsonb', nullable: true })
  issue_templates: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  business_keywords: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
