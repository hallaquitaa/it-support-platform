import express from 'express';

import {
  getRemoteAccess,
  getRemoteAccessById,
  createRemoteAccess,
  updateRemoteAccess,
  deleteRemoteAccess,
  toggleRemoteFavorite,
  getRemoteAccessHistory,
  registerRemoteLaunchRequest,
} from '../controllers/remoteAccessController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRemoteAccess);
router.get('/favorites', (req, res, next) => {
  req.query.favorite = 'true';
  next();
}, getRemoteAccess);

router.post('/:id/favorite', toggleRemoteFavorite);
router.get('/:id/history', getRemoteAccessHistory);
router.post('/:id/launch', registerRemoteLaunchRequest);

router.get('/:id', getRemoteAccessById);
router.post('/', createRemoteAccess);
router.put('/:id', updateRemoteAccess);
router.delete('/:id', deleteRemoteAccess);

export default router;
