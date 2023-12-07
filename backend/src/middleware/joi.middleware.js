import Joi from 'joi';
import responseHandler from '../handlers/response.handler.js';

const ValidateJoi = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body);

      next();
    } catch (error) {
      responseHandler.unprocessableEntity(res, {
        err: error.details[0].message,
      });
    }
  };
};

const validateSchema = {
  auth: {
    signUp: Joi.object({
      username: Joi.string()
        .min(8)
        .max(24)
        .regex(/^[a-z0-9]+$/)
        .required(),
      password: Joi.string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .required(),
      email: Joi.string().email().required(),
      displayName: Joi.string().required(),
      phone_number: Joi.string()
        .regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/)
        .required(),
      address: Joi.string().required(),
      gender: Joi.string().valid('male', 'female').required(),
      avatar: Joi.any(),
    }),
  },

  user: {
    updateInfo: Joi.object({
      displayName: Joi.string().required(),
      phone_number: Joi.string()
        .regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/)
        .required(),
      address: Joi.string().required(),
      gender: Joi.string().valid('male', 'female').required(),
    }),

    updatePassword: Joi.object({
      password: Joi.string().required(),
      new_password: Joi.string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .required(),
      confirm_password: Joi.string().required().valid(Joi.ref('new_password')),
    }),

    forgetPassword: Joi.object({
      username: Joi.string().required(),
    }),

    resetPassword: Joi.object({
      userId: Joi.string().required(),
      token: Joi.string().required(),
      password: Joi.string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .required(),
    }),

    locked: Joi.object({
      reason: Joi.string().required(),
    }),
  },

  nhadat: {
    create: Joi.object({
      contact_name: Joi.string().required(),
      contact_phone: Joi.string()
        .regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/)
        .required(),
      contact_address: Joi.string().required(),
      contact_email: Joi.string().email().required(),
      title: Joi.string().required(),
      demand: Joi.string().valid('buy', 'lease').required(),
      type_nhadat: Joi.when('demand', {
        is: 'buy',
        then: Joi.string()
          .valid(
            'can_ho_chung_cu',
            'nha_rieng',
            'nha_biet_thu',
            'nha_mat_pho',
            'shophouse',
            'dat_nen_du_an',
            'dat',
            'trang_trai',
            'khu_nghi_duong',
            'condohel',
            'kho_nha_xuong',
            'bat_dong_san_khac'
          )
          .required(),
        otherwise: Joi.string().valid(
          'can_ho_chung_cu',
          'nha_rieng',
          'nha_biet_thu',
          'nha_mat_pho',
          'shophouse',
          'nha_tro_phong_tro',
          'van_phong',
          'cua_hang',
          'bat_dong_san_khac'
        ),
      }),
      price: Joi.number().integer().required(),
      price_unit: Joi.string().valid('vnd', 'per_area', 'custom').required(),
      area: Joi.number().required(),
      description: Joi.string().required(),
      province: Joi.number().integer().required(),
      district: Joi.number().integer().required(),
      ward: Joi.number().integer().required(),
      street: Joi.string().required(),
      num_floors: Joi.number().integer(),
      num_toilets: Joi.number().integer(),
      num_bedrooms: Joi.number().integer(),
      home_direction: Joi.string().valid(
        'none',
        'dong',
        'tay',
        'nam',
        'bac',
        'dong-bac',
        'tay-nam',
        'tay-bac',
        'dong-nam'
      ),
      utillities: Joi.string().valid('basic', 'full', 'none'),
      legal: Joi.string().required(),
      collections: Joi.any(),
    }),

    update: Joi.object({
      title: Joi.string().required(),
      contact_name: Joi.string().required(),
      contact_phone: Joi.string()
        .regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/)
        .required(),
      contact_address: Joi.string().required(),
      contact_email: Joi.string().email().required(),
      demand: Joi.string().valid('buy', 'lease').required(),
      type_nhadat: Joi.when('demand', {
        is: 'buy',
        then: Joi.string()
          .valid(
            'can_ho_chung_cu',
            'nha_rieng',
            'nha_biet_thu',
            'nha_mat_pho',
            'shophouse',
            'dat_nen_du_an',
            'dat',
            'trang_trai',
            'khu_nghi_duong',
            'condohel',
            'kho_nha_xuong',
            'bat_dong_san_khac'
          )
          .required(),
        otherwise: Joi.string().valid(
          'can_ho_chung_cu',
          'nha_rieng',
          'nha_biet_thu',
          'nha_mat_pho',
          'shophouse',
          'nha_tro_phong_tro',
          'van_phong',
          'cua_hang',
          'bat_dong_san_khac'
        ),
      }),
      price: Joi.number().integer().required(),
      price_unit: Joi.string().valid('vnd', 'per_area', 'custom').required(),
      area: Joi.number().required(),
      description: Joi.string().required(),
      province: Joi.number().integer().required(),
      district: Joi.number().integer().required(),
      ward: Joi.number().integer().required(),
      street: Joi.string().required(),
      num_floors: Joi.number().integer(),
      num_toilets: Joi.number().integer(),
      num_bedrooms: Joi.number().integer(),
      home_direction: Joi.string().valid(
        'none',
        'dong',
        'tay',
        'nam',
        'bac',
        'dong-bac',
        'tay-nam',
        'tay-bac',
        'dong-nam'
      ),
      utillities: Joi.string().valid('basic', 'full', 'none'),
      legal: Joi.string().required(),
      collections: Joi.any(),
    }),

    updateStatus: Joi.object({
      status: Joi.string().valid('approved', 'refuse').required(),
      reason_refuse: Joi.when('status', {
        is: 'refuse',
        then: Joi.string().required(),
        otherwise: Joi.string().allow(''),
      }),
    }),
  },

  report: {
    create: Joi.object({
      fullName: Joi.string().required(),
      title: Joi.string().min(10).max(99).required(),
      content: Joi.string().min(30).max(5000).required(),
      phone_number: Joi.string()
        .regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/)
        .required(),
      email: Joi.string().email().required(),
      post_slug: Joi.string().required(),
    }),

    handleReplyReport: Joi.object({
      status: Joi.string().valid('pending', 'confirmed', 'refuse').required(),
      reply_message: Joi.string().min(30).max(500).required(),
    }),
  },

  broker: {
    create: Joi.object({
      introduce: Joi.string().min(30).max(5000).required(),
      fields: Joi.array()
        .items(
          Joi.object({
            field_code: Joi.string()
              .valid(
                'ban_can_ho_chung_cu',
                'ban_nha_rieng',
                'ban_nha_biet_thu',
                'ban_nha_mat_pho',
                'ban_shophouse',
                'ban_dat_nen_du_an',
                'ban_dat',
                'ban_trang_trai',
                'ban_khu_nghi_duong',
                'ban_condohel',
                'ban_kho_nha_xuong',
                'ban_bat_dong_san_khac',
                'cho_thue_can_ho_chung_cu',
                'cho_thue_nha_rieng',
                'cho_thue_nha_biet_thu',
                'cho_thue_nha_mat_pho',
                'cho_thue_shophouse',
                'cho_thue_nha_tro_phong_tro',
                'cho_thue_van_phong',
                'cho_thue_cua_hang',
                'cho_thue_bat_dong_san_khac'
              )
              .required(),
            province: Joi.number().required(),
            district: Joi.number().required(),
          }).required()
        )
        .min(1)
        .max(3)
        .unique((a, b) => a.field_code === b.field_code)
        .required(),
    }),
  },

  exchange: {
    create: Joi.object({
      // seller_id: Joi.string().hex().length(24).required(), // objectID
      property_id: Joi.string().hex().length(24).required(), // objectID
    }),

    accept: Joi.object({
      contract_type: Joi.string().valid('buy', 'lease').required(),
      contract_pdf: Joi.any(),
    }),

    cancel: Joi.object({
      reason_cancel: Joi.string().min(0).max(1000).required(),
    }),
  },
};

export { ValidateJoi, validateSchema };
