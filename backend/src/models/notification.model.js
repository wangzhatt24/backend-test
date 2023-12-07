import moment from 'moment';
import { Schema, model } from 'mongoose';
import modelOptions from './model.options.js';

const notificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    title: { type: String, required: true },

    content: {
      type: String,
      required: true,
    },

    seen: { type: Boolean, default: false },

    createdAt: {
      type: Date,
      default: moment().utcOffset('+0700'),
    },
  },
  { ...modelOptions, timestamps: false }
);

const notificationModel = model('Notification', notificationSchema);

export default notificationModel;
