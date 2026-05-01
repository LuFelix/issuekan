import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class RelayLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
   event!: string;

   @Column({ type: "jsonb" })
   payload!: object;

   @Column({ nullable: true })
   trelloCardId?: string;

   @Column({ nullable: true })
   githubIssueId?: string;

   @Column({ nullable: true })
   status!: string;

   @CreateDateColumn()
   createdAt!: Date;
}
