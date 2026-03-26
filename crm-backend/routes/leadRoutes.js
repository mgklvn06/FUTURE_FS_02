import express from 'express';

import {
  addNote,
  createLead,
  deleteLead,
  getLeads,
  updateLead,
  updateStatus,
} from '../controllers/leadController.js';
import protect from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLeads);
router.post('/', requireRole('admin'), createLead);
router.put('/:id', requireRole('admin'), updateLead);
router.delete('/:id', requireRole('admin'), deleteLead);
router.patch('/:id/status', updateStatus);
router.put('/:id/status', updateStatus);
router.post('/:id/notes', addNote);

export default router;
