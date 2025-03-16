import { Injectable, OnModuleInit } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
const userSchema = require('../schemas/userSchema');
// import userSchema from '../schemas/userSchema';



@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  async onModuleInit() {
    this.pool = createPool({ 
      host: 'localhost',
      user: 'root',
      password: 'sujal',
      database: 'nest_auth',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await this.createTables();
  }

  private async createTables() {
    const connection = await this.pool.getConnection();
    try {
      await connection.query(userSchema);
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    } finally {
      connection.release();
    }
  }

  async executeQuery<T extends RowDataPacket[]>(query: string, values?: any[]): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute<T>(query, values); // Ensure TypeScript recognizes rows correctly
      return rows;
    } finally {
      connection.release();
    }
  }

  getPool(): Pool {
    return this.pool;
  }
}


