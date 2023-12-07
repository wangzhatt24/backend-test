import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import config from '../configs/common-config.js';
import responseHandler from '../handlers/response.handler.js';
import Logging from '../library/Logging.js';
import brokerModel from '../models/broker.model.js';
import {
  default as nhaDatModel,
  default as nhadatModel,
} from '../models/nhadat.model.js';
import notificationModel from '../models/notification.model.js';
import userModel from '../models/user.model.js';
import { deleteAvatar, uploadAvatarToS3 } from '../services/avatar.service.js';
import sendMails from '../services/send-mails.service.js';

const SALT_AROUNDS = 12;

class userController {
  async getInfoUserPublic(req, res) {
    try {
      let property = req.query.property || 'false';
      const { user_id } = req.params;

      if (!Types.ObjectId.isValid(user_id)) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy thông tin người dùng!',
        });
      }

      const currPerson = await userModel
        .findById(user_id)
        .select('displayName phone_number address avatar email isBroker');

      if (!currPerson) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy thông tin người dùng!',
        });
      }

      if (property === 'true') {
        const properties = await nhaDatModel.aggregate([
          {
            $match: {
              user_id: new Types.ObjectId(currPerson.id),
              status: 'approved',
            },
          },
          {
            $limit: 20,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $group: {
              _id: '$demand',
              items: {
                $push: '$$ROOT',
              },
            },
          },
          {
            $project: {
              id: {
                $cond: [
                  { $eq: ['$_id', 'buy'] },
                  'nha_dat_ban',
                  'nha_dat_thue',
                ],
              },

              title: {
                $cond: [
                  { $eq: ['$_id', 'buy'] },
                  'Danh sách nhà đất bán',
                  'Danh sách nhà đất cho thuê',
                ],
              },

              items: {
                title: 1,
                slug: 1,
                price: 1,
                area: 1,
                price_unit: 1,
                createdAt: 1,
                collections: 1,
                location: 1,
              },
              _id: 0,
            },
          },
          {
            $sort: {
              id: 1,
            },
          },
        ]);

        currPerson._doc.nha_dat = properties;
      }

      responseHandler.ok(res, currPerson);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async getInfoUserPrivate(req, res) {
    try {
      const { id } = req.user;

      const userInfo = await userModel
        .findById(id)
        .select('-password -role -createdAt -updatedAt');

      responseHandler.ok(res, userInfo);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async updateInfo(req, res) {
    try {
      const { id } = req.user;

      const updateUser = await userModel
        .findByIdAndUpdate(id, { ...req.body }, { returnDocument: 'after' })
        .select('-password -role -createdAt -updatedAt');

      if (updateUser.isBroker) {
        brokerModel
          .findOneAndUpdate(
            { user: updateUser.id },
            { broker_name: updateUser.displayName }
          )
          .then(() => Logging.info('Update Broker when update User --> OK!'));
      }

      return responseHandler.ok(res, updateUser);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async setAvatar(req, res) {
    try {
      const { id } = req.user;

      const file = req.file;

      if (!file) {
        return responseHandler.badrequest(res, {
          err: 'Vui lòng cung cấp ảnh!',
        });
      }

      const user = await userModel.findById(id).select('avatar');
      const current_avt = user._doc.avatar;

      if (current_avt) {
        const key_old_avt = current_avt.split('avatars')[1];

        deleteAvatar(key_old_avt);
      }

      const randomName = `${Date.now()}-${Math.ceil(Math.random() * 999)}`;
      const key_file = `avatars/${id}/${randomName}`;

      uploadAvatarToS3(file, key_file);

      const newUrlAvatar = `https://${config.aws.AWS_BUCKET}.s3.${config.aws.AWS_REGION}.amazonaws.com/${key_file}`;

      user.avatar = newUrlAvatar;

      await user.save();

      responseHandler.ok(res, newUrlAvatar);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async updatePassword(req, res) {
    try {
      const { id } = req.user;
      const { password, new_password } = req.body;

      console.log(password, new_password);

      const user = await userModel.findById(id).select('password');

      const checkPwdValid = await bcrypt.compare(password, user.password);

      if (!checkPwdValid) {
        return responseHandler.badrequest(res, {
          err: 'Mật khẩu tài khoản không đúng!',
        });
      }

      const hashPwd = bcrypt.hashSync(new_password, SALT_AROUNDS);

      user.password = hashPwd;

      await user.save();

      return responseHandler.okwithmsg(res, 'Cập nhật mật khẩu thành công.');
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async forgetPassword(req, res) {
    try {
      const { username } = req.body;

      const foundedUser = await userModel.findOne({ username });

      if (!foundedUser) {
        return responseHandler.notfound(res, {
          err: 'Tài khoản không tồn tại.',
        });
      }

      const token = jwt.sign(
        {
          id: foundedUser.id,
          username: foundedUser.username,
          email: foundedUser.email,
        },
        config.jwt.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '5m',
        }
      );

      const link = `${
        config.server.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : config.client.PRODUCTION_CLIENT_URL
      }/tao-mat-khau?token=${token}&userId=${foundedUser.id}`;

      sendMails.forgetPassword(
        foundedUser.email,
        foundedUser.displayName,
        foundedUser.username,
        link
      );

      responseHandler.okwithmsg(
        res,
        'Đường dẫn khôi phục mật khẩu đã được gửi đến email bạn đăng ký. Vui lòng kiểm tra và làm theo hướng dẫn.'
      );
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async resetPassword(req, res) {
    try {
      const { password, token, userId } = req.body;

      try {
        jwt.verify(
          token,
          config.jwt.ACCESS_TOKEN_SECRET,
          async (err, decode) => {
            if (err) {
              return responseHandler.badrequest(res, {
                err: 'Yêu cầu đã hết hạn. Vui lòng thực hiện lại!',
              });
            }

            if (userId !== decode.id) {
              return responseHandler.badrequest(res, {
                err: 'Yêu cầu đã hết hạn. Vui lòng thực hiện lại!',
              });
            }

            const hashPwd = bcrypt.hashSync(password, SALT_AROUNDS);

            await userModel.findByIdAndUpdate(userId, { password: hashPwd });

            return responseHandler.okwithmsg(
              res,
              'Thay đổi mật khẩu thành công.'
            );
          }
        );
      } catch (error) {
        return responseHandler.badrequest(res, {
          err: 'Code 0: Hành động không hợp lệ.',
        });
      }
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async getUsers(req, res) {
    try {
      const LIMIT = 12;
      let page = req.query.page || 1;
      let search = req.query.search || '';

      const totalItem = await userModel.countDocuments({
        role: 'user',
        $or: [
          {
            username: { $regex: search, $options: 'i' },
          },
          {
            displayName: { $regex: search, $options: 'i' },
          },
        ],
      });

      if (totalItem === 0) {
        return responseHandler.notfound(res, { err: 'Không tìm thấy user!' });
      }

      const totalPage = Math.ceil(totalItem / LIMIT);

      if (page > totalPage) {
        page = 1;
      }

      const users = await userModel
        .find({
          role: 'user',
          $or: [
            {
              username: { $regex: search, $options: 'i' },
            },
            {
              displayName: { $regex: search, $options: 'i' },
            },
          ],
        })
        .select('-password')
        .skip((page - 1) * LIMIT)
        .limit(LIMIT)
        .sort({ createdAt: 'desc' });

      responseHandler.ok(res, { totalItem, totalPage, data: users });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async getDetailUserAdmin(req, res) {
    try {
      const { userId } = req.params;

      if (!Types.ObjectId.isValid(userId)) {
        return responseHandler.badrequest(res, {
          err: 'User ID không hợp lệ!',
        });
      }

      const currentUser = await userModel
        .findById(userId)
        .populate('locked.lock_by', 'username displayName id');

      if (!userId) {
        return responseHandler.notfound(res, { err: 'KHông tìm thấy user' });
      }

      const propertyOfUser = await nhadatModel.aggregate([
        {
          $match: {
            user_id: new Types.ObjectId(currentUser.id),
          },
        },
        {
          $group: {
            _id: '$demand',
            items: {
              $push: '$$ROOT',
            },
          },
        },
        {
          $project: {
            id: '$_id',
            items: 1,
            label: {
              $cond: [
                { $eq: ['$_id', 'buy'] },
                'Bất động sản bán',
                'Bất động sản cho thuê',
              ],
            },
            _id: 0,
          },
        },
      ]);

      responseHandler.ok(res, {
        user: currentUser,
        properties: propertyOfUser,
      });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async lockUser(req, res) {
    try {
      const admin = req.user;
      const { userId } = req.params;
      const { reason } = req.body;

      if (!Types.ObjectId.isValid(userId)) {
        return responseHandler.badrequest(res, {
          err: 'ID User không hợp lệ!',
        });
      }

      userModel
        .findByIdAndUpdate(
          userId,
          {
            locked: {
              status: true,
              reason,
              lock_by: admin.id,
            },
          },
          { returnDocument: 'after' }
        )
        .then((result) => {
          sendMails.mailWhenLockUser(
            {
              username: result.username,
              email: result.email,
              displayName: result.displayName,
            },
            reason
          );

          notificationModel
            .create({
              user_id: result.id,
              title: 'Tài khoản của bạn đã bị khóa',
              content: `Tại khoản của bạn đã bị khóa bởi quản tri viên hệ thống. Lý do: ${reason}`,
            })
            .then(() => {
              req.io.emit(`notify-${result.id}`, 1);
            })
            .catch((err) => {
              Logging.error(err);
            });

          responseHandler.okwithmsg(
            res,
            `Tài khoản ${result.displayName} đã bị khóa!`
          );
        })
        .catch((err) => {
          responseHandler.badrequest(res, { err: 'Lỗi' });
        });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async unlockUser(req, res) {
    try {
      const { userId } = req.params;

      if (!Types.ObjectId.isValid(userId)) {
        return responseHandler.badrequest(res, { err: 'ID khộng hợp lệ!' });
      }

      await userModel
        .findByIdAndUpdate(userId, {
          locked: {
            status: false,
            reason: '',
          },
        })
        .then((result) => {
          notificationModel
            .create({
              title: 'Tài khoản của bạn đã được mở lại!',
              content: 'Bây giờ bạn có thể thực hiện các tác vụ bình thường!',
              user_id: result.id,
            })
            .then(() => {
              req.io.emit(`notify-${result.id}`, 1);
            })
            .catch((err) => {
              Logging.error(err);
            });

          return responseHandler.okwithmsg(
            res,
            `Mở khóa tài khoản thành công!`
          );
        })
        .catch((err) => {
          Logging.error(err);
          responseHandler.badrequest(res, { err: 'Lỗi' });
        });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }
}

export default new userController();
