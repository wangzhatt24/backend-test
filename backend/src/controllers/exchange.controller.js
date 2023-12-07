import moment from 'moment';
import { Types } from 'mongoose';
import config from '../configs/common-config.js';
import responseHandler from '../handlers/response.handler.js';
import exchangeModel from '../models/exchange.model.js';
import nhadatModel from '../models/nhadat.model.js';
import notificationModel from '../models/notification.model.js';
import userModel from '../models/user.model.js';
import { uploadContract } from '../services/contract.service.js';
import sendMails from '../services/send-mails.service.js';
import formatPriceTV from '../utils/formatPriceTV.js';

const StatusOptions = [
  'pending',
  'cancel_by_seller',
  'cancel_by_buyer',
  'success',
];
const LIMIT_ITEMS = 12;

const SELECT_USER = 'id displayName email address phone_number isBroker avatar';

class exchangeController {
  async create(req, res) {
    try {
      const user = req.user; 
      const { property_id } = req.body; 

      // thong tin nguoi mua
      const buyerUser = await userModel.findById(user.id);
      if (buyerUser.locked.status) {
        return responseHandler.badrequest(res, {
          err: 'Tài khoản của bạn đã bị tạm khóa',
        });
      }

      const currentProperty = await nhadatModel.findById(property_id);

      if (!currentProperty) {
        return responseHandler.badrequest(res, {
          err: 'Không tìm thấy hoặc lỗi không rõ!',
        });
      }

      let totalPrice = currentProperty.price;

      if (currentProperty.price_unit === 'custom') {
        totalPrice = -1;
      } else if (currentProperty.price_unit === 'per_area') {
        totalPrice = Math.round(currentProperty.price * currentProperty.area);
      }

      const newExchange = new exchangeModel({
        buyer: user.id,
        seller: currentProperty.user_id,
        property: property_id,
        price: totalPrice,
      });

      await newExchange.save();

      const emailSeller = currentProperty.contact.email;
      const buyerEmail = {
        name: buyerUser.displayName,
        phone: buyerUser.phone_number,
        email: buyerUser.email,
      };
      const propertyDetail = {
        title: currentProperty.title,
        slug: currentProperty.slug,
        demand: currentProperty.demand,
        price: formatPriceTV(totalPrice),
      };

      sendMails.mailToSellerWhenCreateExchange(
        emailSeller,
        buyerEmail,
        propertyDetail
      );

      notificationModel
        .create({
          title: `Bạn có 1 giao dịch bất động sản mới`,
          content: `Kiểm tra giao dịch mới của bạn tại đây: ${config.client.PRODUCTION_CLIENT_URL}/quan-ly-giao-dich/chi-tiet/${newExchange.id}`,
          user_id: currentProperty.user_id,
        })
        .then(() => {
          req.io.emit(`notify-${currentProperty.user_id}`, 1);
        });

      return responseHandler.created(res, 'Giao dịch tạo thành công!');
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async getExchanges(req, res) {
    try {
      const { party } = req.params;

      if (party !== 'buy' && party !== 'sell') {
        return responseHandler.badrequest(res, { err: 'Query không hợp lệ' });
      }

      const user = req.user;
      let page = req.query.page || 1;
      let status = req.query.status || 'all';
      let elapsed = req.query.elapsed || 'all';
      let sort = req.query.sort || 'createdAt,desc';

      if (elapsed !== 'week' && elapsed !== 'month' && elapsed !== 'all') {
        return responseHandler.badrequest(res, {
          err: 'Query elapsed không hợp lệ!',
        });
      }

      if (status === 'all') {
        status = [...StatusOptions];
      } else if (status === 'cancel') {
        status = ['cancel_by_seller', 'cancel_by_buyer'];
      }

      let sortBy = {};

      if (sort) {
        sort = sort.split(',');
      } else {
        sort = [sort];
      }

      if (sort[1]) {
        if (sort[1] !== 'asc' && sort[1] !== 'desc') {
          return responseHanlder.badrequest(res, {
            err: "Query Sort contains only 2 values: 'asc' or 'desc'",
          });
        }

        sortBy[sort[0]] = sort[1];
      } else {
        sortBy[sort[0]] = 'asc';
      }

      let queries = {
        status: {
          $in: status,
        },
      };

      if (elapsed === 'week') {
        queries.createdAt = {
          $gte: moment().startOf('week').utc().toDate(),
          $lt: moment().endOf('week').utc().toDate(),
        };
      } else if (elapsed === 'month') {
        queries.createdAt = {
          $gte: moment().startOf('month').utc().toDate(),
          $lt: moment().endOf('month').utc().toDate(),
        };
      }

      if (party === 'sell') {
        queries.seller = user.id;
      } else {
        queries.buyer = user.id;
      }

      const totalItems = await exchangeModel.countDocuments(queries);

      if (totalItems === 0) {
        return responseHandler.notfound(res, {
          err: 'Hiện không có giao dịch.',
        });
      }

      const totalPage = Math.ceil(totalItems / LIMIT_ITEMS);

      if (page > totalPage) {
        page = 1;
      }

      const exchanges = await exchangeModel
        .find(queries)
        .populate('seller', SELECT_USER)
        .populate('buyer', SELECT_USER)
        .populate('property')
        .skip((page - 1) * LIMIT_ITEMS)
        .limit(LIMIT_ITEMS)
        .sort(sortBy)
        .exec();

      responseHandler.ok(res, { totalItems, totalPage, data: exchanges });
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async getExchangeDetail(req, res) {
    try {
      const user = req.user;
      const { exchangeId } = req.params;

      if (!Types.ObjectId.isValid(exchangeId)) {
        return responseHandler.badrequest(res, { err: 'ID không hợp lệ' });
      }

      const currentExchange = await exchangeModel
        .findById(exchangeId)
        .populate('seller', SELECT_USER)
        .populate('buyer', SELECT_USER)
        .populate('property')
        .exec();

      if (!currentExchange) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy giao dịch',
        });
      }

      if (
        user.id !== currentExchange.seller.id &&
        user.id !== currentExchange.buyer.id
      ) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy giao dịch',
        });
      }

      return responseHandler.ok(res, currentExchange);
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async acceptExchange(req, res) {
    try {
      const { exchangeId } = req.params;
      const { contract_type } = req.body;
      const user = req.user;

      if (!Types.ObjectId.isValid(exchangeId)) {
        return responseHandler.badrequest(res, { err: 'ID không hợp lệ' });
      }

      const currentExchange = await exchangeModel
        .findById(exchangeId)
        .populate('buyer')
        .populate('seller')
        .populate('property');

      if (!currentExchange) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy giao dịch',
        });
      }

      if (currentExchange.status !== 'pending') {
        return responseHandler.badrequest(res, {
          err: 'Giao dịch đã kết thúc.',
        });
      }

      if (user.id !== currentExchange.seller.id) {
        return responseHandler.badrequest(res, {
          err: 'Bạn không có quyền',
        });
      }

      const file = req.file;

      const key_file = `contracts/${currentExchange.id}`;
      const contractFileUrl = `https://${config.aws.AWS_BUCKET}.s3.${config.aws.AWS_REGION}.amazonaws.com/${key_file}`;

      await uploadContract(file, key_file);

      currentExchange.status = 'success';
      currentExchange.contract = {
        contract_type,
        contract_url: contractFileUrl,
        signed_date: Date.now(),
      };

      await currentExchange.save();

      // send mail
      sendMails.mailWhenExchangeComplete(currentExchange);

      responseHandler.okwithmsg(res, 'Giao dịch đã hoàn thành');
    } catch (error) {
      responseHandler.error(res, error);
    }
  }

  async cancelExchange(req, res) {
    try {
      const { exchangeId } = req.params;
      const { reason_cancel } = req.body;
      const user = req.user;

      if (!Types.ObjectId.isValid(exchangeId)) {
        return responseHandler.badrequest(res, { err: 'ID không hợp lệ' });
      }

      const currentExchange = await exchangeModel.findById(exchangeId);

      if (!currentExchange) {
        return responseHandler.notfound(res, {
          err: 'Không tìm thấy giao dịch',
        });
      }

      if (currentExchange.status !== 'pending') {
        return responseHandler.badrequest(res, {
          err: 'Giao dịch đã kết thúc.',
        });
      }

      if (user.id === currentExchange.seller.toHexString()) {
        currentExchange.status = 'cancel_by_seller';
      }

      if (user.id === currentExchange.buyer.toHexString()) {
        currentExchange.status = 'cancel_by_buyer';
      }

      currentExchange.reason_cancel = reason_cancel;

      await currentExchange.save();

      responseHandler.okwithmsg(res, 'Hủy giao dịch thành công');
    } catch (error) {
      responseHandler.error(res, error);
    }
  }
}

export default new exchangeController();
