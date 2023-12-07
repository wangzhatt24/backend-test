import moment from 'moment';
import { Types } from 'mongoose';
import {
  loai_nha_dat_ban,
  loai_nha_dat_thue,
} from '../constants/loai-nha-dat.constant.js';
import homeDirection from '../constants/home-direction.constant.js';
import responseHanlder from '../handlers/response.handler.js';
import nhaDatModel from '../models/nhadat.model.js';
import notificationModel from '../models/notification.model.js';
import userModel from '../models/user.model.js';
import {
  deleteFolderCollections,
  uploadToS3,
} from '../services/handleCollections.service.js';
import formatTimeElapsed from '../utils/formatTimeElapsed.util.js';
import generateLocation from '../utils/generateLocation.utl.js';
import generateSlug from '../utils/generateSlug.util.js';

const LIMIT_ITEM = 10;

class nhaDatController {
  async create(req, res) {
    try {
      const user = req.user;
      const {
        province,
        district,
        ward,
        street,
        contact_name,
        contact_phone,
        contact_address,
        contact_email,
        ...bodyData
      } = req.body;
      const files = req.files;

      if (!files || files.length < 4) {
        return responseHanlder.badrequest(res, {
          err: 'Phải có ít nhất 4 hình ảnh mô tả',
        });
      }

      const currentUser = await userModel.findById(user.id);

      if (currentUser.locked.status) {
        return responseHanlder.badrequest(res, {
          err: 'Tài khoản của bạn đã bị tạm khóa',
        });
      }

      const slug = generateSlug(bodyData.title);

      const checkDocExist = await nhaDatModel.findOne({ slug });

      if (checkDocExist) {
        return responseHanlder.badrequest(res, { err: 'Tiêu đề đã tồn tại' });
      }

      const location = generateLocation(province, district, ward, street);

      const contact = {
        name: contact_name,
        email: contact_email,
        address: contact_address,
        phone: contact_phone,
      };

      const nhaDatDoc = new nhaDatModel({
        user_id: user.id,
        slug,
        ...bodyData,
        location,
        contact,
      });

      const collections = await uploadToS3(files, nhaDatDoc.id);

      nhaDatDoc.collections = collections;

      await nhaDatDoc.save();

      return responseHanlder.created(res, nhaDatDoc);
    } catch (error) {
      responseHanlder.error(res, error);
    }
  }

  async update(req, res) {
    try {
      const postId = req.params.postId;
      const user = req.user;
      const files = req.files;
      const {
        province,
        district,
        ward,
        street,
        contact_name,
        contact_phone,
        contact_address,
        contact_email,
        ...bodyData
      } = req.body;

      const currentUser = await userModel.findById(user.id);
      if (currentUser.locked.status) {
        return responseHanlder.badrequest(res, {
          err: 'Tài khoản của bạn đã bị khóa! Không thể thực hiện chức năng này',
        });
      }

      if (!Types.ObjectId.isValid(postId)) {
        return responseHanlder.badrequest(res, {
          err: 'Post ID không hợp lệ!',
        });
      }

      const currentDoc = await nhaDatModel.findOne({
        _id: postId,
        user_id: user.id,
      });

      if (!currentDoc) {
        return responseHanlder.notfound(res, {
          err: 'Không tìm thấy bài đăng',
        });
      }

      let newSlug = currentDoc.slug; 

      if (bodyData.title !== currentDoc.title) {
        newSlug = generateSlug(bodyData.title);

        const checkDocExist = await nhaDatModel.findOne({ slug: newSlug });
        if (checkDocExist) {
          return responseHanlder.badrequest(res, {
            err: 'Tiêu đề đã tồn tại!',
          });
        }
      }

      const location = generateLocation(province, district, ward, street);

      const contact = {
        name: contact_name,
        email: contact_email,
        address: contact_address,
        phone: contact_phone,
      };

      if (files.length > 0 && files.length < 4) {
        return responseHanlder.badrequest(res, {
          err: 'Nếu bạn muốn sữa ảnh của bài đăng thì phải upload lại toàn bộ ảnh. Ít nhất là 4 và nhiều nhất là 10 tấm.',
        });
      }

      let collections = currentDoc.collections;
      if (files.length >= 4) {
        await deleteFolderCollections(currentDoc.id); 
        collections = await uploadToS3(files, currentDoc.id); 
      }

      const updatedDoc = await nhaDatModel.findOneAndUpdate(
        {
          _id: postId,
          user_id: user.id,
        },
        {
          slug: newSlug,
          ...bodyData,
          location,
          contact,
          collections,
        },
        {
          returnDocument: 'after',
        }
      );

      responseHanlder.ok(res, updatedDoc);
    } catch (error) {
      responseHanlder.error(res, error);
    }
  }

  async delete(req, res) {
    try {
      const user = req.user;
      const { postId } = req.params;

      const currentUser = await userModel.findById(user.id);
      if (currentUser.locked.status) {
        return responseHanlder.badrequest(res, {
          err: 'Tài khoản của bạn đã bị khóa',
        });
      }

      if (!Types.ObjectId.isValid(postId)) {
        return responseHanlder.badrequest(res, { err: 'ID không hợp lệ!' });
      }

      const checkDocAndDelete = await nhaDatModel.findOneAndRemove({
        _id: postId,
        user_id: user.id,
      });

      if (!checkDocAndDelete) {
        return responseHanlder.notfound(res, {
          err: 'Không tìm thấy thông tin bất động sản!',
        });
      }

      deleteFolderCollections(checkDocAndDelete.id);

      return responseHanlder.okwithmsg(res, 'Xóa tin thành công');
    } catch (error) {
      responseHanlder.error(res, error);
    }
  }

  async queryNhaDat(req, res) {
    const demand_type = req.params.demand;
    const query = req.query;

    let page = query.page || 1;
    let search = query.search || '';
    let type_nhadat = query.type_nhadat || 'all';
    let num_toilets = query.num_toilets || 'all';
    let home_direction = query.home_direction || 'all';

    let range_price = query.range_price || '0,50000000000';
    let range_area = query.range_area || '0,999999';
    let sort = query.sort || 'createdAt,desc';

    let province_code = query.provCode;
    let district_code = query.distCode;
    let ward_code = query.wardCode;

    if (
      (province_code && isNaN(Number(province_code))) ||
      (district_code && isNaN(Number(district_code))) ||
      (ward_code && isNaN(Number(ward_code)))
    ) {
      return responseHanlder.badrequest(res, {
        err: 'Code vùng không hợp lệ!',
      });
    }

    if (demand_type !== 'buy' && demand_type !== 'lease') {
      return responseHanlder.notfound(res, {
        err: 'Không tìm thấy loại bất động sản này!',
      });
    }

    switch (demand_type) {
      case 'buy': {
        if (type_nhadat === 'all') {
          type_nhadat = loai_nha_dat_ban.map((item) => item.id);
        } else {
          type_nhadat = type_nhadat.split(',');
        }
        break;
      }

      case 'lease': {
        if (type_nhadat === 'all') {
          type_nhadat = loai_nha_dat_thue.map((item) => item.id);
        } else {
          type_nhadat = type_nhadat.split(',');
        }
        break;
      }

      default: {
        break;
      }
    }

    if (num_toilets === 'all') {
      num_toilets = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      ];
    } else {
      num_toilets = num_toilets.split(',');
      num_toilets.forEach((item) => {
        if (isNaN(Number(item))) {
          return responseHanlder.badrequest(res, {
            err: 'Không hợp lệ!',
          });
        }
      });
    }

    if (home_direction === 'all') {
      home_direction = [...homeDirection];
    } else {
      home_direction = home_direction.split(',');
    }

    //  xử lý khoảng giá
    range_price = range_price.split(',');

    let min_price = Number(range_price[0]);
    let max_price = Number(range_price[1]);

    if (isNaN(min_price) || isNaN(max_price)) {
      return responseHanlder.badrequest(res, {
        err: "Query 'range_price' không hợp lệ!",
      });
    }

    //  xử lý khoảng diện tích
    range_area = range_area.split(',');

    let min_area = Number(range_area[0]);
    let max_area = Number(range_area[1]);

    if (isNaN(min_area) || isNaN(max_area)) {
      return responseHanlder.badrequest(res, {
        err: 'Query không hợp lệ!',
      });
    }

    // xử lý sort
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
      status: 'approved',
      demand: demand_type,
      title: {
        $regex: search,
        $options: 'i',
      },
      type_nhadat: {
        $in: type_nhadat,
      },
      num_toilets: {
        $in: num_toilets,
      },
      home_direction: {
        $in: home_direction,
      },
      price: {
        $gte: min_price,
        $lte: max_price,
      },
      area: {
        $gte: min_area,
        $lte: max_area,
      },
    };

    if (province_code) {
      if (district_code) {
        if (ward_code) {
          queries['location.province.code'] = {
            $eq: parseInt(province_code),
          };
          queries['location.district.code'] = {
            $eq: parseInt(district_code),
          };
          queries['location.ward.code'] = {
            $eq: parseInt(ward_code),
          };
        } else {
          queries['location.province.code'] = {
            $eq: parseInt(province_code),
          };
          queries['location.district.code'] = {
            $eq: parseInt(district_code),
          };
        }
      } else {
        queries['location.province.code'] = {
          $eq: parseInt(province_code),
        };
      }
    }

    const totalItems = await nhaDatModel.countDocuments(queries);

    if (totalItems === 0) {
      return responseHanlder.notfound(res, {
        err: 'Không tìm thấy thông tin bất động sản!',
      });
    }

    const totalPage = Math.ceil(totalItems / LIMIT_ITEM);

    if (page > totalPage) {
      page = 1;
    }

    const nhaDatList = await nhaDatModel
      .find(queries)
      .sort(sortBy)
      .skip((page - 1) * LIMIT_ITEM)
      .limit(LIMIT_ITEM)
      .exec();

    return responseHanlder.ok(res, { totalItems, totalPage, data: nhaDatList });
  }

  async queryNhaDatOfUser(req, res) {
    try {
      let demand = req.query.demand || 'all';
      let status = req.query.status || 'all';
      let page = req.query.page || 1;
      let sort = req.query.sort || 'createdAt,desc';
      let search = req.query.search || '';

      const user = req.user;

      // xử lý quểy status
      if (status === 'all') {
        status = ['pending', 'approved', 'refuse'];
      } else {
        if (
          status !== 'pending' &&
          status !== 'approved' &&
          status !== 'refuse'
        ) {
          return responseHanlder.badrequest(res, {
            err: 'Query "status" không hợp lệ.',
          });
        }
      }

      // xử lý sort
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

      if (demand === 'all') {
        demand = ['buy', 'lease'];
      } else if (demand !== 'buy' && demand !== 'lease') {
        return responseHanlder.badrequest(res, { err: 'Query không hợp lệ!' });
      }

      const totalItems = await nhaDatModel
        .countDocuments({
          user_id: user.id,
          demand,
          title: { $regex: search, $options: 'i' },
        })
        .where('status')
        .in(status);

      if (totalItems === 0) {
        return responseHanlder.notfound(res, { err: 'Danh sách tin rỗng' });
      }

      const totalPage = Math.ceil(totalItems / LIMIT_ITEM);

      if (page > totalPage) {
        page = 1;
      }

      let nhaDatList = await nhaDatModel
        .find({
          user_id: user.id,
          demand,
          title: { $regex: search, $options: 'i' },
        })
        .where('status')
        .in(status)
        .sort(sortBy)
        .skip((page - 1) * LIMIT_ITEM)
        .limit(LIMIT_ITEM)
        .exec();

      return responseHanlder.ok(res, {
        totalItems,
        totalPage,
        data: nhaDatList,
      });
    } catch (error) {
      responseHanlder.error(res, error);
    }
  }

  async getNhaDatDetail(req, res) {
    try {
      const { slug } = req.params;

      let nhaDatDetail = await nhaDatModel.findOne({
        slug,
        status: 'approved',
      });

      if (!nhaDatDetail) {
        return responseHanlder.notfound(res, {
          err: 'Không tìm thấy thông tin bất động sản!',
        });
      }

      const elapsed = formatTimeElapsed(nhaDatDetail.createdAt);
      nhaDatDetail._doc.elapsed = elapsed;

      return responseHanlder.ok(res, nhaDatDetail);
    } catch (error) {
      responseHanlder.error(res, error);
    }
  }

  // @route GET /api/nha-dat/user/detail/:slug
  // @desc lấy chi tiết tin bds của chính user đó (kể cả tin chưa duyệt)
  // @access Private
  async getNhaDatDetailOfUser(req, res) {
    try {
      const user = req.user;
      const { slug } = req.params;

      let nhaDatDetail = await nhaDatModel.findOne({
        user_id: user.id,
        slug,
      });

      if (!nhaDatDetail) {
        return responseHanlder.notfound(res, {
          err: 'Không tìm thấy thông tin bất động sản!',
        });
      }

      const elapsed = formatTimeElapsed(nhaDatDetail.createdAt);
      nhaDatDetail._doc.elapsed = elapsed;

      return responseHanlder.ok(res, nhaDatDetail);
    } catch (error) {
      responseHanlder.error(res, error);
    }
  }


  async getAllNhaDat(req, res) {
    try {
      let { demand } = req.params;
      let status = req.query.status || 'all';
      let page = req.query.page || 1;
      let search = req.query.search || '';
      let sort = req.query.sort || 'createdAt,desc';
      let elapsed = req.query.elapsed || 'all';

      if (demand !== 'buy' && demand !== 'lease') {
        return responseHanlder.badrequest(res, {
          err: 'Thông tin nhà đất không hợp lệ!',
        });
      }

      if (status === 'all') {
        status = ['pending', 'approved', 'refuse'];
      } else {
        if (
          status !== 'pending' &&
          status !== 'approved' &&
          status !== 'refuse'
        ) {
          return responseHanlder.badrequest(res, {
            err: 'Query "status" không hợp lệ.',
          });
        }
      }

      // xử lý sort
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

      // tạo query tổng quan cho hệ thống
      let queries = {
        demand,
        title: { $regex: search, $options: 'i' },
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

      const totalItems = await nhaDatModel
        .countDocuments(queries)
        .where('status')
        .in(status);

      if (totalItems === 0) {
        return responseHanlder.notfound(res, { err: 'Danh sách tin rỗng' });
      }

      const totalPage = Math.ceil(totalItems / LIMIT_ITEM);

      if (page > totalPage) {
        page = 1;
      }

      const nhaDatList = await nhaDatModel
        .find(queries)
        .where('status')
        .in(status)
        .skip((page - 1) * LIMIT_ITEM)
        .sort(sortBy)
        .limit(LIMIT_ITEM)
        .exec();

      responseHanlder.ok(res, { totalItems, totalPage, data: nhaDatList });
    } catch (error) {
      responseHanlder.error(res, error);
    }
  }

  async getDetailNhadatByAdmin(req, res) {
    try {
      const { slug } = req.params;

      let nhaDatDetail = await nhaDatModel.findOne({
        slug,
      });

      if (!nhaDatDetail) {
        return responseHanlder.notfound(res, {
          err: 'Không tìm thấy thông tin bất động sản!',
        });
      }

      return responseHanlder.ok(res, nhaDatDetail);
    } catch (error) {
      responseHanlder.error(res, error);
    }
  }

  async updateStatus(req, res) {
    try {
      const { postId } = req.params;
      const { status, reason_refuse } = req.body;

      if (!Types.ObjectId.isValid(postId)) {
        return responseHanlder.badrequest(res, { err: 'ID không hợp lệ' });
      }

      const currentDoc = await nhaDatModel.findById(postId);

      if (!currentDoc) {
        return responseHanlder.notfound(res, {
          err: 'Không tìm thấy bài đăng',
        });
      }

      if (currentDoc.status === 'approved' && status === 'approved') {
        return responseHanlder.badrequest(res, {
          err: 'Tin này đã được duyệt trước đó!',
        });
      }

      if (currentDoc.status === 'refuse' && status === 'refuse') {
        return responseHanlder.badrequest(res, {
          err: 'Tin này đã bị từ chối duyệt trước đó',
        });
      }

      currentDoc.status = status;
      currentDoc.reason_refuse = status === 'refuse' ? reason_refuse : '';
      await currentDoc.save();

      let msg = '';
      let notifiTitle = '';
      let notifiContent = '';

      if (status === 'approved') {
        msg = 'Duyệt bài đăng thành công';
        notifiTitle = `Bài đăng '${currentDoc.title}' của bạn đã được duyệt`;
        notifiContent = `Bài đăng có tiêu đề "${currentDoc.title} đã được chấp thuận. Giờ đây bạn có thể xem tin trên website của chúng tôi"`;
      } else {
        msg = 'Từ chối đăng bài thành công';
        notifiTitle = `Từ chối đăng bài với tiêu đề: ${currentDoc.title}`;
        notifiContent = `Bài đăng có tiêu đề '${currentDoc.title}' của bạn đã bị từ chối.
          Lý do: ${reason_refuse}
        `;
      }

      const newNotifi = new notificationModel({
        title: notifiTitle,
        content: notifiContent,
        user_id: currentDoc.user_id,
      });

      // realtime
      newNotifi.save().then(() => {
        req.io.emit(`notify-${currentDoc.user_id}`, 1);
      });

      return responseHanlder.okwithmsg(res, msg);
    } catch (error) {
      responseHanlder.error(res, error);
    }
  }
}

export default new nhaDatController();
