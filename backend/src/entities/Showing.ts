import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Property } from './Property';
import { User } from './User';

export enum ShowingStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

@Entity('showings')
@Index(['user_id', 'scheduled_at'])
@Index(['property_id', 'scheduled_at'])
export class Showing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  property_id: string;

  @ManyToOne(() => Property, property => property.showings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, user => user.showings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamp' })
  scheduled_at: Date;

  @Column({ type: 'enum', enum: ShowingStatus, default: ShowingStatus.SCHEDULED })
  status: ShowingStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  reminder_sent_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  feedback: {
    rating?: number;
    comments?: string;
    interested?: boolean;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
