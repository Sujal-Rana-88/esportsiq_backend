import { Injectable, OnModuleInit } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
const userSchema = require('../schemas/userSchema');

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  async onModuleInit() {
    await this.ensureDatabaseExists(); // Ensure DB exists before connecting

    this.pool = createPool({ 
      host: 'localhost',
      user: 'root',
      password: 'sujal',
      database: 'esports_iq_v1', // Now we can connect safely
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await this.createTables();
  }

  private async ensureDatabaseExists() {
    const tempPool = createPool({
      host: 'localhost',
      user: 'root',
      password: 'sujal',
      multipleStatements: true, // Allow multiple queries
    });

    const connection = await tempPool.getConnection();
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS esports_iq_v1`);
      console.log('Database checked/created successfully');
    } catch (error) {
      console.error('Error creating database:', error);
    } finally {
      connection.release();
      await tempPool.end(); // Close temp connection
    }
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
      const [rows] = await connection.execute<T>(query, values);
      return rows;
    } finally {
      connection.release();
    }
  }

  getPool(): Pool {
    return this.pool;
  }
}
