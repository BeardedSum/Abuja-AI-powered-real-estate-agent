import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Property } from './Property';
import { User } from './User';

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COUNTERED = 'countered',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

@Entity('offers')
@Index(['user_id', 'status'])
@Index(['property_id', 'status'])
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  property_id: string;

  @ManyToOne(() => Property, property => property.offers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, user => user.offers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'enum', enum: OfferStatus, default: OfferStatus.PENDING })
  status: OfferStatus;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  financing: {
    cash?: boolean;
    mortgage_pre_approved?: boolean;
    down_payment_percentage?: number;
  };

  @Column({ type: 'text', nullable: true })
  response_notes: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  counter_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
