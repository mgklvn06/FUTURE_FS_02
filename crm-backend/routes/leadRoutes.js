import express from 'express';

import {
  addNote,
  createLead,
  deleteLead,
  getLeads,
  updateLead,
  updateStatus,
} from '../controllers/leadController.js';

const router = express.Router();

router.post('/', createLead);
router.get('/', getLeads);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.patch('/:id/status', updateStatus);
router.put('/:id/status', updateStatus);
router.post('/:id/notes', addNote);

export default router;
