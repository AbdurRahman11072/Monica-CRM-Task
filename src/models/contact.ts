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

const ALLOWED_SORT_COLUMNS = ['first_name', 'last_name', 'created_at', 'updated_at'];

const buildWhereClause = (params: ContactListParams): { sql: string; values: any[]; nextIndex: number } => {
  const conditions: string[] = [];
  const values: any[] = [];
  let index = 1;

  conditions.push(`account_id = $${index++}`);
  values.push(params.accountId);

  if (params.favorite !== undefined) {
    conditions.push(`is_favorite = $${index++}`);
    values.push(params.favorite);
  }

  if (params.search && params.search.trim() !== '') {
    const searchTerm = `%${params.search.trim()}%`;
    conditions.push(
      `(first_name ILIKE $${index} OR middle_name ILIKE $${index} OR last_name ILIKE $${index} OR nickname ILIKE $${index})`
    );
    values.push(searchTerm);
    index++;
  }

  return {
    sql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
    nextIndex: index,
  };
};

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

export const findAllContactsPaginated = async (params: ContactListParams): Promise<PaginatedResponse<Contact>> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const { sql: whereSql, values: whereValues, nextIndex } = buildWhereClause(params);

  // Get total count matching criteria
  const countQuery = `SELECT COUNT(*) as total FROM contacts ${whereSql}`;
  const countResult = await pool.query(countQuery, whereValues);
  const total = Number(countResult.rows[0].total || 0);

  // Validate sorting parameters to prevent SQL injection
  let sortColumn = 'first_name';
  if (params.sort && ALLOWED_SORT_COLUMNS.includes(params.sort)) {
    sortColumn = params.sort;
  }
  const direction = params.direction === 'desc' ? 'DESC' : 'ASC';

  // Get records
  const selectQuery = `
    SELECT * FROM contacts 
    ${whereSql}
    ORDER BY ${sortColumn} ${direction}
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
  `;

  const result = await pool.query(
    selectQuery,
    [...whereValues, limit, offset]
  );

  const last_page = Math.ceil(total / limit);

  return {
    data: result.rows as Contact[],
    meta: {
      current_page: page,
      per_page: limit,
      last_page: last_page || 1,
      total,
    },
  };
};
