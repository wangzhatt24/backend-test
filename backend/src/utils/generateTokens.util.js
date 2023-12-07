import jwt from 'jsonwebtoken';
import config from '../configs/common-config.js';

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, config.jwt.ACCESS_TOKEN_SECRET, {
    expiresIn: '3m',
  });

  const refreshToken = jwt.sign(payload, config.jwt.REFRESH_TOKEN_SECRET, {
    expiresIn: '4d',
  });

  return { accessToken, refreshToken };
};

export default generateTokens;
