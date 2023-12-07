import mongoose, { Schema } from 'mongoose';
import modelOptions from './model.options.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female'],
    },
    phone_number: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    isBroker: {
      type: Boolean,
      required: true,
      default: false,
    },
    locked: {
      status: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        default: '',
      },
      lock_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  modelOptions
);

const userModel = mongoose.model('User', userSchema);

export default userModel;
