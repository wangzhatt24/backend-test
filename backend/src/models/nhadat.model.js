import mongoose from 'mongoose';
import modelOptions from './model.options.js';

const nhadatSchema = new mongoose.Schema(
  {
    user_id: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    contact: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    demand: {
      type: String,
      required: true,
      enum: ['buy', 'lease'],
    },
    type_nhadat: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    price_unit: {
      type: String,
      required: true,
      enum: ['vnd', 'per_area', 'custom'],
    },
    area: {
      type: Number,
      required: true,
    },
    description: {
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
      ward: {
        code: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
      street: {
        type: String,
      },
    },
    num_floors: {
      type: Number,
      default: 0,
    },
    num_toilets: {
      type: Number,
      default: 0,
    },
    num_bedrooms: {
      type: Number,
      default: 0,
    },
    home_direction: {
      type: String,
      enum: [
        'none',
        'dong',
        'tay',
        'nam',
        'bac',
        'dong-bac',
        'tay-bac',
        'tay-nam',
        'dong-nam',
      ],
      default: 'none',
    },
    utillities: {
      type: String,
      default: 'none',
    },
    legal: {
      type: String,
      required: true,
      enum: ['so_do', 'hop_dong', 'dang_cho_so', 'other'],
    },
    furniture: {
      type: String,
      enum: ['basic', 'full', 'none'],
    },
    collections: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'refuse'], // chờ duyệt, đã duyệt, không duyệt
      default: 'pending',
    },
    reason_refuse: {
      type: String,
    },
  },
  modelOptions
);

const nhadatModel = mongoose.model('nhadat', nhadatSchema);

export default nhadatModel;
