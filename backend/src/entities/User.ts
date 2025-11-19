import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Showing } from './Showing';
import { Offer } from './Offer';
import { Conversation } from './Conversation';
import { AgentSession } from './AgentSession';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone_number: string;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true, nullable: true })
  whatsapp_id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'jsonb', default: {} })
  preferences: {
    property_type?: string;
    budget_min?: number;
    budget_max?: number;
    bedrooms?: number;
    neighborhoods?: string[];
  };

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Showing, showing => showing.user)
  showings: Showing[];

  @OneToMany(() => Offer, offer => offer.user)
  offers: Offer[];

  @OneToMany(() => Conversation, conversation => conversation.user)
  conversations: Conversation[];

  @OneToMany(() => AgentSession, session => session.user)
  agent_sessions: AgentSession[];
}
