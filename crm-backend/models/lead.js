import mongoose from 'mongoose';

export const leadStatuses = ['new', 'contacted', 'converted'];

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
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
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
