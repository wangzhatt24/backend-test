import jwt from 'jsonwebtoken';
import config from '../configs/common-config.js';
import responseHandler from '../handlers/response.handler.js';

const verifyToken = async (req, res, next) => {
  try {
    const authHeaders = req.headers['authorization'];

    const token = authHeaders && authHeaders.split(' ')[1];

    if (!token) {
      return responseHandler.unauthorize(res, { err: 'Token không hợp lệ' });
    }

    jwt.verify(token, config.jwt.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return responseHandler.unauthorize(res, { err: err.name });
      }

      const { iat, exp, id, role } = decoded;

      req.user = { id, role };

      next();
    });
  } catch (error) {
    responseHandler.unauthorize(res, { err: 'Token không hợp lệ' });
  }
};

const verifyTokenAdmin = async (req, res, next) => {
  try {
    const authHeaders = req.headers['authorization'];

    const token = authHeaders && authHeaders.split(' ')[1];

    if (!token) {
      return responseHandler.unauthorize(res, { err: 'Token không hợp lệ' });
    }

    jwt.verify(token, config.jwt.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return responseHandler.unauthorize(res, { err: err.name });
      }

      const { iat, exp, id, role } = decoded;

      if (role !== 'admin') {
        return responseHandler.unauthorize(res, {
          err: 'Người dùng không đủ quyền để truy cập tài nguyên này',
        });
      }

      req.user = { id, role };

      next();
    });
  } catch (error) {
    console.log(error);
    responseHandler.unauthorize(res, { err: 'Token không hợp lệ' });
  }
};

export { verifyToken, verifyTokenAdmin };
