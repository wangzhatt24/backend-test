import brokerFields from '../constants/broker-fields.constant.js';
import responseHandler from '../handlers/response.handler.js';
import brokerModel from '../models/broker.model.js';
import {
  default as nhaDatModel,
  default as nhadatModel,
} from '../models/nhadat.model.js';
import userModel from '../models/user.model.js';
import generateLocation from '../utils/generateLocation.utl.js';

const LIMIT_ITEMS = 12;

class brokerController {
  async create(req, res) {
    try {
      const user = req.user;
      let { introduce, fields } = req.body;

      const currentUser = await userModel.findById(user.id);

      if (!currentUser) {
        return responseHandler.notfound(res, {
          err: 'Người dùng không tìm thấy',
        });
      }

      if (currentUser.locked.status) {
        return responseHandler.badrequest(res, {
          err: 'Tài khoản của bạn đã bị tạm khóa',
        });
      }

      if (currentUser.isBroker) {
        return responseHandler.badrequest(res, {
          err: 'Người dùng đã đăng ký làm môi giới',
        });
      }

      if (currentUser.avatar === '') {
        return responseHandler.badrequest(res, {
          err: 'Người dùng phải cập nhật đủ thông tin tài khoản. VD: avatar, tên, . . .',
        });
      }

      fields.map((field) => {
        const location = generateLocation(
          field.province,
          field.district,
          null,
          null
        );

        const currentField = brokerFields.find(
          (item) => item.value === field.field_code
        );

        delete field.province;
        delete field.district;
        field.location = location;
        field.field_name = currentField.label;
        return field;
      });

      const broker = await brokerModel.create({
        user: user.id,
        introduce,
        fields,
        broker_name: currentUser.displayName,
      });

      currentUser.isBroker = true;
      currentUser
        .save()
        .then(() =>
          console.log(`User ${currentUser.id} has been converted to A Broker!`)
        );

      return responseHandler.created(res, broker);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async update(req, res) {
    try {
      const user = req.user;
      let { introduce, fields } = req.body;

      const currentBroker = await brokerModel.findOne({ user: user.id });

      const currentUser = await userModel.findById(user.id);
      if (currentUser.locked.status) {
        return responseHandler.badrequest(res, {
          err: 'Tài khoản của bạn đã bị khóa, tạm thời không thể thực hiện chức năng này',
        });
      }

      if (!currentBroker) {
        return responseHandler.notfound(res, {
          err: 'Môi giới không tìm thấy.',
        });
      }

      fields.map((field) => {
        const location = generateLocation(
          field.province,
          field.district,
          null,
          null
        );

        const currentField = brokerFields.find(
          (item) => item.value === field.field_code
        );

        delete field.province;
        delete field.district;
        field.location = location;
        field.field_name = currentField.label;
        return field;
      });

      currentBroker.introduce = introduce;
      currentBroker.fields = fields;

      await currentBroker.save();

      return responseHandler.ok(res, currentBroker);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async deleteBroker(req, res) {
    try {
      const user = req.user;

      const currentUser = await userModel.findById(user.id);
      if (currentUser.locked.status) {
        return responseHandler.badrequest(res, {
          err: 'Tài khoản của bạn đã bị khóa, tạm thời không thể thực hiện chức năng này',
        });
      }

      const deletedBroker = await brokerModel.findOneAndDelete({
        user: user.id,
      });

      if (!deletedBroker) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy thông tin môi giới',
        });
      }

      // sữa lại isBroker = false
      userModel.findByIdAndUpdate(user.id, { isBroker: false }).catch(() => {
        return responseHandler.badrequest(res, {
          err: 'Đã xảy ra lỗi trong quá trình thay đổi thông tin môi giới.',
        });
      });

      responseHandler.okwithmsg(res, 'Thành công!');
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async getList(req, res) {
    try {
      const query = req.query;

      let page = query.page || 1;
      let fields = query.fields || 'all';
      let provCode = query.provCode;
      let distCode = query.distCode;
      let search = query.search || '';

      if (
        (provCode && isNaN(Number(provCode))) ||
        (distCode && isNaN(Number(distCode)))
      ) {
        return responseHandler.badrequest(res, { err: 'Không hợp lệ!' });
      }

      if (fields === 'all') {
        fields = brokerFields.map((item) => item.value);
      } else {
        fields = fields.split(',');
      }

      let queries = {
        broker_name: {
          $regex: search,
          $options: 'i',
        },
        'fields.field_code': {
          $in: fields,
        },
      };

      if (provCode) {
        if (distCode) {
          queries['fields.location.province.code'] = {
            $eq: parseInt(provCode),
          };
          queries['fields.location.district.code'] = {
            $eq: parseInt(distCode),
          };
        } else {
          queries['fields.location.province.code'] = {
            $eq: parseInt(provCode),
          };
        }
      }

      const totalItems = await brokerModel.countDocuments(queries);

      const totalPage = Math.ceil(totalItems / LIMIT_ITEMS);

      if (page > totalPage) {
        page = 1;
      }

      const brokers = await brokerModel
        .find(queries)
        .populate('user', 'id displayName email phone_number avatar address')
        .skip((page - 1) * LIMIT_ITEMS)
        .limit(LIMIT_ITEMS)
        .exec();

      if (brokers.length === 0) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy môi giới',
        });
      }

      responseHandler.ok(res, { totalItems, totalPage, data: brokers });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async getDetailBroker(req, res) {
    try {
      const { brokerId } = req.params;

      let broker = await brokerModel
        .findById(brokerId)
        .populate('user', 'id displayName address phone_number email avatar');

      if (!broker) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy thông tin môi giới',
        });
      }

      const userId = broker.user.id;

      let posts = await nhaDatModel
        .find({ user_id: userId, status: 'approved' })
        .select(
          'id demand slug price price_unit location createdAt title area collections num_toilets num_bedrooms num_floors'
        )
        .sort({ createdAt: 'desc' })
        .limit(12);

      broker._doc.properties = posts;

      responseHandler.ok(res, broker);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async getDetailByUser(req, res) {
    try {
      const user = req.user;

      const currentBroker = await brokerModel.findOne({ user: user.id });

      if (!currentBroker) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy thông tin môi giới',
        });
      }

      responseHandler.ok(res, currentBroker);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async getTopBrokers(req, res) {
    try {
      const topBrokers = await nhadatModel.aggregate([
        {
          $match: {
            status: 'approved',
          },
        },
        {
          $group: {
            _id: '$user_id',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'brokers',
            localField: '_id',
            foreignField: 'user',
            as: 'broker',
          },
        },
        { $unwind: '$broker' },
        {
          $project: {
            _id: 0,
            id: '$broker._id',
            displayName: '$broker.broker_name',
            user: '$broker.user',
            count: 1,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $project: {
            id: 1,
            username: 1,
            count: 1,
            displayName: 1,
            avatar: '$user.avatar',
            address: '$user.address',
            phone_number: '$user.phone_number',
          },
        },
      ]);

      if (topBrokers.length === 0) {
        return responseHandler.notfound(res, { err: 'Dữ liệu rỗng!' });
      }

      responseHandler.ok(res, topBrokers);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }
}

export default new brokerController();
