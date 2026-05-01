import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class RelayLink {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  trelloCardId!: string;

  @Column({ unique: true })
  githubIssueId!: string;
}
