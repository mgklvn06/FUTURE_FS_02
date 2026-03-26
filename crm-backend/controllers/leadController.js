import mongoose from 'mongoose';
import Lead, { followUpStatuses, leadStatuses } from '../models/lead.js';

const isValidLeadId = (id) => mongoose.isValidObjectId(id);
const isValidFollowUpId = (id) => mongoose.isValidObjectId(id);
const getTeamId = (req) => req.user?.team?._id || req.user?.team;
const getActorName = (req) => req.user?.name || req.user?.email || 'Team member';
const getScopedLeadFilter = (req, id) => ({
  _id: id,
  team: getTeamId(req),
});

function parseDateValue(value, fieldLabel) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldLabel} must be a valid date.`);
  }

  return parsed;
}

function resolveFollowUpStatus(followUp) {
  if (followUp?.status === 'done') {
    return 'done';
  }

  if (!followUp?.dueAt) {
    return 'pending';
  }

  return new Date(followUp.dueAt).getTime() < Date.now() ? 'overdue' : 'pending';
}

function getFollowUpSortValue(followUp) {
  const resolvedStatus = resolveFollowUpStatus(followUp);

  if (resolvedStatus === 'overdue') {
    return 0;
  }

  if (resolvedStatus === 'pending') {
    return 1;
  }

  return 2;
}

function serializeFollowUp(followUp) {
  return {
    ...followUp,
    status: resolveFollowUpStatus(followUp),
  };
}

function serializeLead(lead) {
  const leadObject = typeof lead?.toObject === 'function' ? lead.toObject() : lead;
  const followUps = [...(leadObject.followUps ?? [])]
    .map(serializeFollowUp)
    .sort((first, second) => {
      const statusDelta = getFollowUpSortValue(first) - getFollowUpSortValue(second);

      if (statusDelta !== 0) {
        return statusDelta;
      }

      return new Date(first.dueAt).getTime() - new Date(second.dueAt).getTime();
    });

  return {
    ...leadObject,
    followUps,
  };
}

function normalizeFollowUpPayload(body = {}, { allowPartial = false } = {}) {
  const payload = {};
  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (!allowPartial || hasOwn('title')) {
    const title = body?.title?.trim?.();

    if (!title) {
      throw new Error('Follow-up title is required.');
    }

    payload.title = title;
  }

  if (!allowPartial || hasOwn('details')) {
    payload.details = body?.details?.trim?.() || '';
  }

  if (!allowPartial || hasOwn('dueAt')) {
    if (!body?.dueAt) {
      throw new Error('Follow-up due date is required.');
    }

    payload.dueAt = parseDateValue(body.dueAt, 'Follow-up due date');
  }

  if (hasOwn('reminderAt')) {
    payload.reminderAt = body.reminderAt ? parseDateValue(body.reminderAt, 'Reminder time') : null;
  }

  if (hasOwn('status')) {
    const status = body?.status?.trim?.().toLowerCase();

    if (!followUpStatuses.includes(status)) {
      throw new Error(`Follow-up status must be one of: ${followUpStatuses.join(', ')}.`);
    }

    payload.status = status;
  }

  return payload;
}

function validateReminderWindow(reminderAt, dueAt) {
  if (!reminderAt || !dueAt) {
    return;
  }

  if (reminderAt.getTime() > dueAt.getTime()) {
    throw new Error('Reminder time must be on or before the follow-up due time.');
  }
}

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
      createdByName: getActorName(req),
    });

    res.status(201).json(serializeLead(lead));
  } catch (error) {
    sendValidationError(res, error);
  }
}

export async function getLeads(req, res) {
  try {
    const leads = await Lead.find({ team: getTeamId(req) }).sort({ createdAt: -1 });
    res.json(leads.map(serializeLead));
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
      { returnDocument: 'after', runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(serializeLead(lead));
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
      { returnDocument: 'after', runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(serializeLead(lead));
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
            authorName: getActorName(req),
          },
        },
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(serializeLead(lead));
  } catch (error) {
    sendValidationError(res, error);
  }
}

export async function addFollowUp(req, res) {
  if (!isValidLeadId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid lead id' });
  }

  try {
    const lead = await Lead.findOne(getScopedLeadFilter(req, req.params.id));

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const payload = normalizeFollowUpPayload(req.body);
    validateReminderWindow(payload.reminderAt, payload.dueAt);

    lead.followUps.push({
      ...payload,
      status: 'pending',
      createdBy: req.user._id,
      createdByName: getActorName(req),
    });

    await lead.save();

    res.status(201).json(serializeLead(lead));
  } catch (error) {
    sendValidationError(res, error);
  }
}

export async function updateFollowUp(req, res) {
  if (!isValidLeadId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid lead id' });
  }

  if (!isValidFollowUpId(req.params.followUpId)) {
    return res.status(400).json({ message: 'Invalid follow-up id' });
  }

  try {
    const lead = await Lead.findOne(getScopedLeadFilter(req, req.params.id));

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const followUp = lead.followUps.id(req.params.followUpId);

    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    const payload = normalizeFollowUpPayload(req.body, { allowPartial: true });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        message: 'Provide at least one follow-up field to update.',
      });
    }

    const nextDueAt = payload.dueAt ?? followUp.dueAt;
    const nextReminderAt =
      Object.prototype.hasOwnProperty.call(payload, 'reminderAt') ? payload.reminderAt : followUp.reminderAt;

    validateReminderWindow(nextReminderAt, nextDueAt);

    if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
      followUp.title = payload.title;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'details')) {
      followUp.details = payload.details;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'dueAt')) {
      followUp.dueAt = payload.dueAt;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'reminderAt')) {
      followUp.reminderAt = payload.reminderAt;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
      followUp.status = payload.status;

      if (payload.status === 'done') {
        followUp.completedAt = new Date();
        followUp.completedBy = req.user._id;
        followUp.completedByName = getActorName(req);
      } else {
        followUp.completedAt = null;
        followUp.completedBy = null;
        followUp.completedByName = '';
      }
    }

    await lead.save();

    res.json(serializeLead(lead));
  } catch (error) {
    sendValidationError(res, error);
  }
}
