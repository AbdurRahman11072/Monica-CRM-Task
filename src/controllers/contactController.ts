import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import {
  createContact,
  findContactById,
  findAllContactsPaginated,
  updateContactFavorite,
  updateContactNote,
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

export const listFavorites = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accountId = req.user?.account_id;
    if (!accountId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { page, limit, sort, direction } = req.query;
    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 10;
    const sortCol = sort ? (sort as string) : 'first_name';
    const sortDir = direction === 'desc' ? 'desc' : 'asc';

    const result = await findAllContactsPaginated({
      accountId,
      favorite: true,
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

export const getContactDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const accountId = req.user?.account_id;
    if (!accountId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const contact = await findContactById(id, accountId);
    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }

    res.status(200).json({ data: contact });
  } catch (error) {
    next(error);
  }
};

export const markFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const accountId = req.user?.account_id;
    if (!accountId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const updated = await updateContactFavorite(id, accountId, true);
    if (!updated) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }

    const contact = await findContactById(id, accountId);
    res.status(200).json({
      message: 'Contact marked as favorite',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const accountId = req.user?.account_id;
    if (!accountId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const updated = await updateContactFavorite(id, accountId, false);
    if (!updated) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }

    const contact = await findContactById(id, accountId);
    res.status(200).json({
      message: 'Contact removed from favorites',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const accountId = req.user?.account_id;
    if (!accountId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const contact = await findContactById(id, accountId);
    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }

    const newFavoriteStatus = !contact.is_favorite;
    await updateContactFavorite(id, accountId, newFavoriteStatus);

    const updatedContact = await findContactById(id, accountId);
    res.status(200).json({
      message: `Contact favorite status toggled to ${newFavoriteStatus}`,
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { personal_note } = req.body;
    const accountId = req.user?.account_id;
    if (!accountId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (personal_note === undefined) {
      res.status(400).json({ message: 'personal_note is required in request body' });
      return;
    }

    const updated = await updateContactNote(id, accountId, personal_note);
    if (!updated) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }

    const contact = await findContactById(id, accountId);
    res.status(200).json({
      message: 'Contact personal note updated',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};
