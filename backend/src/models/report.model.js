import mongoose from 'mongoose';
import modelOptions from './model.options.js';

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    // slug của bài báo
    post_slug: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'confirmed', 'refuse'],
    },
  },
  modelOptions
);

const reportModel = mongoose.model('report', reportSchema);

export default reportModel;
