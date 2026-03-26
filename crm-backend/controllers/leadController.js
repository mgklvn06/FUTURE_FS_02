import mongoose from 'mongoose';
import Lead, { leadStatuses } from '../models/lead.js';

const isValidLeadId = (id) => mongoose.isValidObjectId(id);
const getTeamId = (req) => req.user?.team?._id || req.user?.team;
const getScopedLeadFilter = (req, id) => ({
  _id: id,
  team: getTeamId(req),
});

const sendValidationError = (res, error) => {
  const statusCode = error.name === 'ValidationError' ? 400 : 500;
  res.status(statusCode).json({ message: error.message });
};

export async function createLead(req, res) {
  try {
    const lead = await Lead.create({
      ...req.body,
      team: getTeamId(req),
      createdBy: req.user._id,
      createdByName: req.user.name || req.user.email,
    });

    res.status(201).json(lead);
  } catch (error) {
    sendValidationError(res, error);
  }
}

export async function getLeads(req, res) {
  try {
    const leads = await Lead.find({ team: getTeamId(req) }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateLead(req, res) {
  if (!isValidLeadId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid lead id' });
  }

  try {
    const lead = await Lead.findOneAndUpdate(
      getScopedLeadFilter(req, req.params.id),
      req.body,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    sendValidationError(res, error);
  }
}

export async function deleteLead(req, res) {
  if (!isValidLeadId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid lead id' });
  }

  try {
    const lead = await Lead.findOneAndDelete(getScopedLeadFilter(req, req.params.id));

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateStatus(req, res) {
  if (!isValidLeadId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid lead id' });
  }

  try {
    const status = req.body?.status?.trim?.();

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!leadStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${leadStatuses.join(', ')}`,
      });
    }

    const lead = await Lead.findOneAndUpdate(
      getScopedLeadFilter(req, req.params.id),
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    sendValidationError(res, error);
  }
}

export async function addNote(req, res) {
  if (!isValidLeadId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid lead id' });
  }

  try {
    const text = req.body?.text?.trim?.();

    if (!text) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const lead = await Lead.findOneAndUpdate(
      getScopedLeadFilter(req, req.params.id),
      {
        $push: {
          notes: {
            text,
            author: req.user._id,
            authorName: req.user.name || req.user.email,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    sendValidationError(res, error);
  }
}
