import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // Login name - unique, case-insensitive lookups handled in the service
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  // Contact email - also unique
  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  // Never returned by the API - only used for login checks
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  // Disabled users cannot log in
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}