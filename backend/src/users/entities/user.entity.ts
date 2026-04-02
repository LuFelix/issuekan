// users/entities/user.entity.ts
import { Role } from 'src/roles/entities/role.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, nullable: false })
    name: string;

    @Index({ unique: true }) 
    @Column({ length: 100, nullable: false, unique: true })
    email: string;

    @Index({ unique: true })
    @Column({ length: 11, unique: true, nullable: true }) 
    cpf: string;

    @Column({ length: 11, nullable: true })
    phonenumber: string;

    @Column({ length: 8, nullable: true })
    cep: string;

    @Column({ length: 2, nullable: true })
    uf: string;

    @Column({ length: 30, nullable: true })
    city: string;

    @Column({ length: 40, nullable: true })
    neighborhood: string;

    @Column({ length: 100, nullable: true })
    street: string;

    @Column({ length: 100, nullable: false })
    password: string;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'varchar', nullable: true })
    verificationCode: string | null;

    @Column({ type: 'timestamp', nullable: true })
    verificationExpires: Date| null;
}
