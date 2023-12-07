import { model, Schema } from 'mongoose';
import modelOptions from './model.options.js';

const brokerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    broker_name: {
      type: String,
      required: true,
    },

    introduce: {
      type: String,
      required: true,
    },

    fields: [
      {
        field_code: {
          type: String,
          required: true,
        },
        field_name: {
          type: String,
          required: true,
        },
        location: {
          province: {
            code: {
              type: Number,
              required: true,
            },
            name: {
              type: String,
              required: true,
            },
          },
          district: {
            code: {
              type: Number,
              required: true,
            },
            name: {
              type: String,
              required: true,
            },
          },
        },
      },
    ],
  },
  modelOptions
);

const brokerModel = model('broker', brokerSchema);

export default brokerModel;
