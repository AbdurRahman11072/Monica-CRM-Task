import pool from '../config/db';
import { Contact, PaginatedResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ContactListParams {
  accountId: string;
  favorite?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export const createContact = async (contactData: Omit<Contact, 'id' | 'is_favorite' | 'personal_note'>): Promise<Contact> => {
  const id = uuidv4();
  const query = `
    INSERT INTO contacts (id, account_id, first_name, middle_name, last_name, nickname, is_favorite, personal_note)
    VALUES ($1, $2, $3, $4, $5, $6, FALSE, NULL)
  `;
  await pool.query(query, [
    id,
    contactData.account_id,
    contactData.first_name,
    contactData.middle_name || null,
    contactData.last_name || null,
    contactData.nickname || null,
  ]);

  return {
    id,
    account_id: contactData.account_id,
    first_name: contactData.first_name,
    middle_name: contactData.middle_name || null,
    last_name: contactData.last_name || null,
    nickname: contactData.nickname || null,
    is_favorite: false,
    personal_note: null,
  };
};

export const findContactById = async (id: string, accountId: string): Promise<Contact | null> => {
  const query = 'SELECT * FROM contacts WHERE id = $1 AND account_id = $2';
  const result = await pool.query(query, [id, accountId]);
  if (result.rows.length === 0) return null;
  return result.rows[0] as Contact;
};
