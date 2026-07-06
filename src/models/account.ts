import pool from '../config/db';
import { Account } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const createAccount = async (name: string): Promise<Account> => {
  const id = uuidv4();
  const query = 'INSERT INTO accounts (id, name) VALUES ($1, $2)';
  await pool.query(query, [id, name]);
  return { id, name };
};

export const findAccountById = async (id: string): Promise<Account | null> => {
  const query = 'SELECT * FROM accounts WHERE id = $1';
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;
  return result.rows[0] as Account;
};
