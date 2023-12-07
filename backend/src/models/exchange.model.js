import { Schema, model } from 'mongoose';
import modelOptions from './model.options.js';

const exchangeSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    property: {
      type: Schema.Types.ObjectId,
      ref: 'nhadat',
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ['pending', 'cancel_by_buyer', 'cancel_by_seller', 'success'],
      default: 'pending',
    },

    reason_cancel: {
      type: String,
      default: '',
    },

    contract: {
      contract_type: {
        type: String,
        enum: ['buy', 'lease'],
      },

      contract_url: {
        type: String,
      }, // file pdf hợp đồng

      signed_date: {
        type: Date,
      },
    },
  },
  modelOptions
);

const exchangeModel = model('exchange', exchangeSchema);

export default exchangeModel;
