import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import {
  createContact,
  findAllContactsPaginated,
} from '../models/contact';

export const handleCreateContact = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { first_name, middle_name, last_name, nickname } = req.body;
    const accountId = req.user?.account_id;

    if (!accountId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!first_name) {
      res.status(400).json({ message: 'First name is required' });
      return;
    }

    const contact = await createContact({
      account_id: accountId,
      first_name,
      middle_name,
      last_name,
      nickname,
    });

    res.status(201).json({ data: contact });
  } catch (error) {
    next(error);
  }
};

export const listContacts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accountId = req.user?.account_id;
    if (!accountId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { favorite, search, page, limit, sort, direction } = req.query;

    const isFavoriteFilter = favorite !== undefined ? favorite === '1' || favorite === 'true' : undefined;
    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 10;
    const sortCol = sort ? (sort as string) : 'first_name';
    const sortDir = direction === 'desc' ? 'desc' : 'asc';

    const result = await findAllContactsPaginated({
      accountId,
      favorite: isFavoriteFilter,
      search: search ? (search as string) : undefined,
      page: pageNum,
      limit: limitNum,
      sort: sortCol,
      direction: sortDir,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
