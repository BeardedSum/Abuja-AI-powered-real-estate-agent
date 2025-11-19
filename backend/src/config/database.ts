import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Property } from '../entities/Property';
import { PropertyMedia } from '../entities/PropertyMedia';
import { Showing } from '../entities/Showing';
import { Offer } from '../entities/Offer';
import { Conversation } from '../entities/Conversation';
import { AgentSession } from '../entities/AgentSession';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'abuja_realty',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Property, PropertyMedia, Showing, Offer, Conversation, AgentSession],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};
