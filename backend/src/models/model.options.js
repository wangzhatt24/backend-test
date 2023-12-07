const modelOptions = {
  toJSON: {
    virtuals: true,
    transform: (_, obj) => {
      obj.id = obj._id;
      delete obj._id;
      return obj;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_, obj) => {
      obj.id = obj._id;
      delete obj._id;
      return obj;
    },
  },
  versionKey: false,
  timestamps: true,
};

export default modelOptions;
