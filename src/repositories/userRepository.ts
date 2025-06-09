import { RowDataPacket, ResultSetHeader } from 'mysql2';
import Database from '../config/database';
import { User, SignupInput } from '../types';

export class UserRepository {
  private db = Database.getInstance();

  async findByEmail(email: string): Promise<User | null> {
    const connection = this.db.getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async findById(id: number): Promise<User | null> {
    const connection = this.db.getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const connection = this.db.getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE verificationToken = ?',
      [token]
    );

    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async create(userData: SignupInput & { verificationToken: string, password: string }): Promise<User> {
    const connection = this.db.getConnection();
    const { firstName, lastName, email, password, verificationToken } = userData;
    
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO users (firstName, lastName, email, password, verificationToken) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, password, verificationToken]
    );

    const newUser = await this.findById(result.insertId);
    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return newUser;
  }

  async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const connection = this.db.getConnection();
    await connection.execute(
      'UPDATE users SET refreshToken = ? WHERE id = ?',
      [refreshToken, userId]
    );
  }

  async verifyEmail(verificationToken: string): Promise<boolean> {
    const connection = this.db.getConnection();
    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE users SET isVerified = TRUE, verificationToken = NULL WHERE verificationToken = ?',
      [verificationToken]
    );

    return result.affectedRows > 0;
  }

  async removeRefreshToken(userId: number): Promise<void> {
    const connection = this.db.getConnection();
    await connection.execute(
      'UPDATE users SET refreshToken = NULL WHERE id = ?',
      [userId]
    );
  }
}