import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './User';

export enum MessageRole {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    whatsapp_message_id?: string;
    media_url?: string;
    location?: { latitude: number; longitude: number };
  };
}

@Entity('conversations')
@Index(['user_id', 'created_at'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, user => user.conversations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb', default: [] })
  messages: Message[];

  @Column({ nullable: true })
  agent_session_id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
