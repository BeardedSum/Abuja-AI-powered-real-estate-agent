import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { PropertyMedia } from './PropertyMedia';
import { Showing } from './Showing';
import { Offer } from './Offer';

export enum PropertyType {
  HOUSE = 'house',
  FLAT = 'flat',
  DUPLEX = 'duplex',
  LAND = 'land',
  COMMERCIAL = 'commercial'
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  PENDING = 'pending',
  SOLD = 'sold',
  WITHDRAWN = 'withdrawn'
}

@Entity('properties')
@Index(['neighborhood', 'property_type', 'status'])
@Index(['price'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column()
  @Index()
  neighborhood: string;

  @Column()
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @Column({ type: 'int', nullable: true })
  bedrooms: number;

  @Column({ type: 'int', nullable: true })
  bathrooms: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  size_sqm: number;

  @Column({ type: 'enum', enum: PropertyType })
  @Index()
  property_type: PropertyType;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  @Index()
  status: PropertyStatus;

  @Column({ type: 'jsonb', default: [] })
  features: string[];

  @Column({ type: 'jsonb', nullable: true })
  documents: {
    certificate_of_occupancy?: string;
    survey_plan?: string;
    building_approval?: string;
    [key: string]: string | undefined;
  };

  @Column({ nullable: true })
  agent_contact: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PropertyMedia, media => media.property)
  media: PropertyMedia[];

  @OneToMany(() => Showing, showing => showing.property)
  showings: Showing[];

  @OneToMany(() => Offer, offer => offer.property)
  offers: Offer[];
}
