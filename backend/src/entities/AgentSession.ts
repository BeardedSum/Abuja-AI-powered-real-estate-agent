import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './User';

@Entity('agent_sessions')
@Index(['user_id', 'created_at'])
export class AgentSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, user => user.agent_sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb', default: {} })
  session_data: {
    current_agent?: string;
    context?: Record<string, any>;
    search_criteria?: {
      property_type?: string;
      budget_min?: number;
      budget_max?: number;
      bedrooms?: number;
      neighborhoods?: string[];
    };
    conversation_state?: Record<string, any>;
  };

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_interaction_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
