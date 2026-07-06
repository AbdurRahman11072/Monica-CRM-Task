import pool from '../config/db';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const createUser = async (userData: Omit<User, 'id'>): Promise<Omit<User, 'password'>> => {
  const id = uuidv4();
  const query = `
    INSERT INTO users (id, account_id, first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await pool.query(query, [
    id,
    userData.account_id,
    userData.first_name,
    userData.last_name,
    userData.email,
    userData.password,
  ]);

  return {
    id,
    account_id: userData.account_id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
  };
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  if (result.rows.length === 0) return null;
  return result.rows[0] as User;
};

export const findUserById = async (id: string): Promise<Omit<User, 'password'> | null> => {
  const query = 'SELECT id, account_id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;
  return result.rows[0] as Omit<User, 'password'>;
};
