import { Types } from 'mongoose';
import responseHandler from '../handlers/response.handler.js';
import nhaDatModel from '../models/nhadat.model.js';
import reportModel from '../models/report.model.js';
import sendMails from '../services/send-mails.service.js';

const LIMIT_ITEMS = 12;

class reportController {
  async create(req, res) {
    try {
      const { post_slug } = req.body;

      const checkPostValid = await nhaDatModel.findOne({ slug: post_slug });

      if (!checkPostValid) {
        return responseHandler.badrequest(res, {
          err: 'Bài viết báo cáo không hợp lệ!',
        });
      }

      const report = new reportModel(req.body);

      await report.save();

      // Send mail
      sendMails.replyReport({ ...req.body, post_name: checkPostValid.title });

      return responseHandler.created(res, report);
    } catch (error) {
      return responseHandler.error(res, error);
    }
  }

  async getListReports(req, res) {
    try {
      let page = req.query.page || 1;
      let status = req.query.status || 'all';

      if (status === 'all') {
        status = ['pending', 'confirmed', 'refuse'];
      } else if (
        status !== 'pending' &&
        status !== 'confirmed' &&
        status !== 'refuse'
      ) {
        return responseHandler.badrequest(res, { err: 'Query không hợp lệ!' });
      }

      const totalItems = await reportModel
        .countDocuments()
        .where('status')
        .in(status);
      const totalPage = Math.ceil(totalItems / LIMIT_ITEMS);

      if (page > totalPage) {
        page = 1;
      }

      const reports = await reportModel
        .find({})
        .where('status')
        .in(status)
        .skip((page - 1) * LIMIT_ITEMS)
        .limit(LIMIT_ITEMS)
        .sort({ createdAt: 'desc' })
        .exec();

      if (reports.length === 0) {
        return responseHandler.notfound(res, {
          err: 'Danh sách báo cáo rỗng.',
        });
      }

      return responseHandler.ok(res, { totalItems, totalPage, data: reports });
    } catch (error) {
      return responseHandler.error(res, error);
    }
  }

  async handleReport(req, res) {
    try {
      const { reportId } = req.params;
      const { status, reply_message } = req.body;

      if (!Types.ObjectId.isValid(reportId)) {
        return responseHandler.badrequest(res, {
          err: 'Đường dẫn không hợp lệ!',
        });
      }

      const report = await reportModel.findById(reportId);

      if (report.status !== 'pending') {
        return responseHandler.badrequest(res, {
          err: 'Báo cáo đã xử lý rồi!',
        });
      }

      report.status = status;
      await report.save();

      sendMails.replyReportWithMsg(
        report._doc,
        reply_message,
        'Nhân viên hỗ trợ batdongsanvn.fun'
      );

      responseHandler.okwithmsg(res, 'Tác vụ hoàn thành!');
    } catch (error) {
      responseHandler.error(res, error);
    }
  }
}

export default new reportController();
