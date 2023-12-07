import moment from 'moment';
import responseHandler from '../handlers/response.handler.js';
import exchangeModel from '../models/exchange.model.js';
import nhadatModel from '../models/nhadat.model.js';
import reportModel from '../models/report.model.js';
import userModel from '../models/user.model.js';

class statisticController {
  async dashboardInfo(req, res) {
    try {
      const totalProperty = await nhadatModel.aggregate([
        {
          $match: {
            status: { $in: ['pending', 'approved', 'refuse'] },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            title: {
              $cond: [
                { $eq: ['$_id', 'pending'] },
                'Tin chờ duyệt',
                {
                  $cond: [
                    { $eq: ['$_id', 'refuse'] },
                    'Tin bị từ chối',
                    'Tin đã được duyệt',
                  ],
                },
              ],
            },
            _id: 0,
          },
        },
      ]);

      const property_in_this_month = await nhadatModel.aggregate([
        {
          $match: {
            status: { $in: ['pending', 'approved', 'refuse'] },
            createdAt: {
              $gte: moment().startOf('month').utc().toDate(),
              $lt: moment().endOf('month').utc().toDate(),
            },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            title: {
              $cond: [
                { $eq: ['$_id', 'pending'] },
                'Tin chờ duyệt',
                {
                  $cond: [
                    { $eq: ['$_id', 'refuse'] },
                    'Tin bị từ chối',
                    'Tin đã được duyệt',
                  ],
                },
              ],
            },
            _id: 0,
          },
        },
      ]);

      const property_in_this_week = await nhadatModel.aggregate([
        {
          $match: {
            status: { $in: ['pending', 'approved', 'refuse'] },
            createdAt: {
              $gte: moment().startOf('week').utc().toDate(),
              $lt: moment().endOf('week').utc().toDate(),
            },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            title: {
              $cond: [
                { $eq: ['$_id', 'pending'] },
                'Tin chờ duyệt',
                {
                  $cond: [
                    { $eq: ['$_id', 'refuse'] },
                    'Tin bị từ chối',
                    'Tin đã được duyệt',
                  ],
                },
              ],
            },
            _id: 0,
          },
        },
      ]);

      const totalExchange = await exchangeModel.aggregate([
        {
          $match: {
            status: {
              $in: [
                'pending',
                'cancel_by_seller',
                'cancel_by_buyer',
                'success',
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$status', 'cancel_by_seller'] },
                'cancel',
                {
                  $cond: [
                    { $eq: ['$status', 'cancel_by_buyer'] },
                    'cancel',
                    '$status',
                  ],
                },
              ],
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0,
            title: {
              $cond: [
                { $eq: ['$_id', 'pending'] },
                'Giao dịch đang diễn ra',
                {
                  $cond: [
                    { $eq: ['$_id', 'success'] },
                    'Giao dịch thành công',
                    'Giao dịch thất bại',
                  ],
                },
              ],
            },
          },
        },
      ]);

      const exchange_in_this_week = await exchangeModel.aggregate([
        {
          $match: {
            status: {
              $in: [
                'pending',
                'cancel_by_seller',
                'cancel_by_buyer',
                'success',
              ],
            },
            createdAt: {
              $gte: moment().startOf('week').utc().toDate(),
              $lt: moment().endOf('week').utc().toDate(),
            },
          },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$status', 'cancel_by_seller'] },
                'cancel',
                {
                  $cond: [
                    { $eq: ['$status', 'cancel_by_buyer'] },
                    'cancel',
                    '$status',
                  ],
                },
              ],
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0,
            title: {
              $cond: [
                { $eq: ['$_id', 'pending'] },
                'Giao dịch đang diễn ra',
                {
                  $cond: [
                    { $eq: ['$_id', 'success'] },
                    'Giao dịch thành công',
                    'Giao dịch thất bại',
                  ],
                },
              ],
            },
          },
        },
      ]);

      const exchange_in_this_month = await exchangeModel.aggregate([
        {
          $match: {
            status: {
              $in: [
                'pending',
                'cancel_by_seller',
                'cancel_by_buyer',
                'success',
              ],
            },
            createdAt: {
              $gte: moment().startOf('month').utc().toDate(),
              $lt: moment().endOf('month').utc().toDate(),
            },
          },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$status', 'cancel_by_seller'] },
                'cancel',
                {
                  $cond: [
                    { $eq: ['$status', 'cancel_by_buyer'] },
                    'cancel',
                    '$status',
                  ],
                },
              ],
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0,
            title: {
              $cond: [
                { $eq: ['$_id', 'pending'] },
                'Giao dịch đang diễn ra',
                {
                  $cond: [
                    { $eq: ['$_id', 'success'] },
                    'Giao dịch thành công',
                    'Giao dịch thất bại',
                  ],
                },
              ],
            },
          },
        },
      ]);

      const users = await userModel.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalBrokers: {
              $sum: {
                $cond: [{ $eq: ['$isBroker', true] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);

      const totalReport = await reportModel.aggregate([
        {
          $match: {
            status: {
              $in: ['pending', 'confirmed', 'refuse'],
            },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            label: {
              $cond: [
                { $eq: ['$_id', 'pending'] },
                'Chờ xử lý',
                {
                  $cond: [
                    { $eq: ['$_id', 'confirmed'] },
                    'Đã xử lý',
                    'Từ chối',
                  ],
                },
              ],
            },
            _id: 0,
          },
        },
      ]);

      const response = {
        property: {
          total: totalProperty,
          this_week: property_in_this_week,
          this_month: property_in_this_month,
        },
        exchange: {
          total: totalExchange,
          this_week: exchange_in_this_week,
          this_month: exchange_in_this_month,
        },
        users: users[0] || {},
        report: totalReport,
      };

      responseHandler.ok(res, response);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }
}

export default new statisticController();
