import { Router } from 'express';
import {
  handleCreateContact,
  listContacts,
  listFavorites,
  getContactDetails,
  markFavorite,
  removeFavorite,
  toggleFavorite,
  updateNote,
  getStats,
} from '../controllers/contactController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all contact routes
router.use(authMiddleware);

router.get('/', listContacts);
router.post('/', handleCreateContact);
router.get('/favorites', listFavorites);
router.get('/stats', getStats);
router.get('/:id', getContactDetails);
router.post('/:id/favorite', markFavorite);
router.delete('/:id/favorite', removeFavorite);
router.patch('/:id/favorite', toggleFavorite);
router.put('/:id/note', updateNote);

export default router;
