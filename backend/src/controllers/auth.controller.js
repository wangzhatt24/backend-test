import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../configs/common-config.js';
import responseHandler from '../handlers/response.handler.js';
import userModel from '../models/user.model.js';
import generateTokens from '../utils/generateTokens.util.js';

const SALT_AROUNDS = 12;

class authController {
  async signUp(req, res) {
    try {
      const { username, email, password } = req.body;

      const checkUsername = await userModel.findOne({ username });
      const checkEmail = await userModel.findOne({ email });

      if (checkUsername) {
        return responseHandler.badrequest(res, { err: 'Username đã tồn tại!' });
      }

      if (checkEmail) {
        return responseHandler.badrequest(res, { err: 'Email đã tồn tại!' });
      }

      const hashPwd = bcrypt.hashSync(password, SALT_AROUNDS);

      const newUser = new userModel({
        ...req.body,
        password: hashPwd,
      });

      await newUser.save();

      const tokens = generateTokens({
        id: newUser.id,
        role: newUser.role,
      });

      res.cookie('rftkn', tokens.refreshToken, config.COOKIES_OPTIONS);

      let { createdAt, updatedAt, role, ...userInfo } = newUser._doc;

      delete userInfo.password;

      responseHandler.created(res, {
        ...userInfo,
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async signIn(req, res) {
    try {
      const { username, password } = req.body;

      const currentUser = await userModel
        .findOne({ username })
        .select('-createdAt -updatedAt');

      if (!currentUser || currentUser.role !== 'user') {
        return responseHandler.badrequest(res, {
          err: 'Tài khoản không tồn tài!',
        });
      }

      const checkPwdValid = bcrypt.compareSync(password, currentUser.password);

      if (currentUser.role === 'admin') {
        return responseHandler.badrequest(res, {
          err: 'Người dùng không tồn tại!',
        });
      }

      if (!checkPwdValid) {
        return responseHandler.badrequest(res, {
          err: 'Username hoặc password không hợp lệ!',
        });
      }

      const tokens = generateTokens({
        id: currentUser.id,
        role: currentUser.role,
      });

      res.cookie('rftkn', tokens.refreshToken, config.COOKIES_OPTIONS);

      let userInfo = { ...currentUser._doc };

      delete userInfo.password;
      delete userInfo.role;
      delete userInfo.locked.lock_by;

      if (userInfo._id) {
        userInfo.id = userInfo._id;
        delete userInfo._id;
      }

      return responseHandler.ok(res, {
        ...userInfo,
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.rftkn;

      if (!refreshToken) {
        return responseHandler.unauthorize(res, { err: 'Not Login!!' });
      }

      jwt.verify(
        refreshToken,
        config.jwt.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            res.clearCookie('rftk', config.COOKIES_OPTIONS); // xóa refreshToken hết hạn
            return responseHandler.unauthorize(res, { err });
          }

          const foundUser = await userModel.findById(decoded.id);

          if (!foundUser) {
            return responseHandler.unauthorize(res, { err: 'Unauthorized' });
          }

          const tokens = generateTokens({
            id: foundUser.id,
            role: foundUser.role,
          });

          res.cookie('rftkn', tokens.refreshToken, config.COOKIES_OPTIONS);

          responseHandler.ok(res, { accessToken: tokens.accessToken });
        }
      );
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async signOut(req, res) {
    try {
      const refreshToken = req.cookies.rftkn;

      if (!refreshToken) {
        return res.sendStatus(204);
      }

      res.clearCookie('rftkn', config.COOKIES_OPTIONS);

      responseHandler.ok(res, { message: 'Đăng xuất thành công!!!' });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async adminSignIn(req, res) {
    try {
      const { username, password } = req.body;

      const currentUser = await userModel
        .findOne({ username })
        .select('-createdAt -updatedAt');

      if (!currentUser || currentUser.role === 'user') {
        return responseHandler.badrequest(res, {
          err: 'Người dùng không tồn tại',
        });
      }

      const checkPwdValid = bcrypt.compareSync(password, currentUser.password);

      if (!checkPwdValid) {
        return responseHandler.badrequest(res, {
          err: 'Username hoặc password không đúng.',
        });
      }

      const tokens = generateTokens({
        id: currentUser.id,
        role: currentUser.role,
      });

      res.cookie('adrftkn', tokens.refreshToken, config.COOKIES_OPTIONS);

      let userInfo = { ...currentUser._doc };

      delete userInfo.password;
      delete userInfo.role;

      if (userInfo._id) {
        userInfo.id = userInfo._id;
        delete userInfo._id;
      }

      return responseHandler.ok(res, {
        ...userInfo,
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async refreshTokenAdmin(req, res) {
    try {
      const refreshToken = req.cookies.adrftkn; // rftkn

      if (!refreshToken) {
        return responseHandler.unauthorize(res, { err: 'Not Login!!' });
      }

      jwt.verify(
        refreshToken,
        config.jwt.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            res.clearCookie('adrftkn', config.COOKIES_OPTIONS); // xóa refreshToken hết hạn
            return responseHandler.unauthorize(res, { err });
          }

          const foundUser = await userModel.findById(decoded.id);

          if (!foundUser) {
            return responseHandler.unauthorize(res, { err: 'Unauthorized' });
          }

          const tokens = generateTokens({
            id: foundUser.id,
            role: foundUser.role,
          });

          res.cookie('adrftkn', tokens.refreshToken, config.COOKIES_OPTIONS);

          responseHandler.ok(res, { accessToken: tokens.accessToken });
        }
      );
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async signOutAdmin(req, res) {
    try {
      const refreshToken = req.cookies.adrftkn;

      if (!refreshToken) {
        return res.sendStatus(204);
      }

      res.clearCookie('adrftkn', config.COOKIES_OPTIONS);

      responseHandler.ok(res, { message: 'Đăng xuất thành công!!!' });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }
}

export default new authController();
