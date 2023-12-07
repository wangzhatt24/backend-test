import { Types } from 'mongoose';
import responseHandler from '../handlers/response.handler.js';
import notificationModel from '../models/notification.model.js';

class notificationController {
  async getNotifications(req, res) {
    try {
      const user = req.user;
      let returnTotalUnSeen = req.query.returnTotalUnSeen;
      let type = req.query.type || 'all';

      if (returnTotalUnSeen === 'true') {
        const notificationUnSeen = await notificationModel.countDocuments({
          user_id: user.id,
          seen: false,
        });

        return responseHandler.ok(res, { unseen: notificationUnSeen });
      }

      let seenOpts = [];

      if (type === 'all') {
        seenOpts = [true, false];
      } else if (type === 'seen') {
        seenOpts = [true];
      } else if (type === 'unseen') {
        seenOpts = [false];
      }

      const notifications = await notificationModel
        .find({ user_id: user.id })
        .where('seen')
        .in(seenOpts)
        .sort({ createdAt: 'desc' })
        .exec();

      if (notifications.length === 0) {
        return responseHandler.notfound(res, {
          err: 'Hiện tại bạn không có thông báo nào',
        });
      }

      return responseHandler.ok(res, notifications);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return responseHandler.badrequest(res, { err: 'ID không hợp lệ' });
      }

      await notificationModel
        .findByIdAndUpdate(id, { $set: { seen: true } })
        .then((result) => {
          // realtime giảm thông báo đi thành trừ 1
          req.io.emit(`notify-${result.user_id}`, -1);
        });

      return responseHandler.okwithmsg(res, 'Success!');
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async deleteNotification(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;

      const deletedNotification = await notificationModel.findOneAndRemove({
        user_id: user.id,
        _id: id,
      });

      if (!deletedNotification) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy thông báo muốn xóa',
        });
      }

      responseHandler.okwithmsg(res, 'Xóa thông báo thành công');
    } catch (error) {
      responseHandler.error(res, error);
    }
  }
}

export default new notificationController();
