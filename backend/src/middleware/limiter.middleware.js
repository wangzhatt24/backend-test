import rateLimit from 'express-rate-limit';

const limiterLogin = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Sai quá số lần quy định, vui lòng thử lại sau!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { limiterLogin };
