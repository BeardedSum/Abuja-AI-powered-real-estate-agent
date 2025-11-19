import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Property } from './Property';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  FLOOR_PLAN = 'floor_plan',
  VIRTUAL_TOUR = 'virtual_tour'
}

@Entity('property_media')
export class PropertyMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  property_id: string;

  @ManyToOne(() => Property, property => property.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ type: 'enum', enum: MediaType })
  media_type: MediaType;

  @Column()
  url: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ nullable: true })
  caption: string;

  @CreateDateColumn()
  created_at: Date;
}
