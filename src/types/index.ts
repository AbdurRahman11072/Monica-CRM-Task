import { Request } from 'express';

export interface Account {
  id: string;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface User {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Contact {
  id: string;
  account_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
  nickname?: string | null;
  is_favorite: boolean;
  personal_note?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthRequest extends Request {
  user?: Omit<User, 'password'>;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
