import mongoose from 'mongoose';

export const leadStatuses = ['new', 'contacted', 'converted'];
export const followUpStatuses = ['pending', 'done'];

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    authorName: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const followUpSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Follow-up title is required'],
      trim: true,
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    dueAt: {
      type: Date,
      required: [true, 'Follow-up due date is required'],
    },
    reminderAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: followUpStatuses,
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdByName: {
      type: String,
      trim: true,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    completedByName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    source: {
      type: String,
      default: 'website',
      trim: true,
    },
    status: {
      type: String,
      enum: leadStatuses,
      default: 'new',
    },
    notes: {
      type: [noteSchema],
      default: [],
    },
    followUps: {
      type: [followUpSchema],
      default: [],
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdByName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
