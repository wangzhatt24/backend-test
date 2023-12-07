const fromEmail = 'noreply@batdongsan24.id.vn';
import config from '../configs/common-config.js';
import mailGenerator from '../configs/mailgen.config.js';
import nodeMailer from '../configs/nodemailer.config.js';
import Logging from '../library/Logging.js';

const mailOptions = {
  replyReport: (report) => {
    const emailTemplate = {
      body: {
        name: report.fullName,
        intro: [
          'Chúng tôi đã nhận được báo cáo của bạn về bài đăng:',
          report.post_name,
          `<b>Tiêu đề báo cáo:</b> ${report.title}`,
          `<b>Nội dung báo cáo:</b> ${report.content}`,
        ],
        action: {
          instructions: `Bài đăng bạn đã báo cáo:`,
          button: {
            color: '#DC4D2F',
            text: 'Xem bài đăng',
            link: `${
              config.server.NODE_ENV === 'development'
                ? 'http://localhost:3000'
                : config.client.PRODUCTION_CLIENT_URL
            }/chi-tiet/${report.post_slug}`,
          },
        },
        outro: [
          'Chúng tôi sẽ kiểm tra và phản hồi sớm nhất có thể.',
          'Cảm ơn sự đóng góp của bạn!',
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailTemplate);

    return {
      from: fromEmail,
      to: report.email,
      subject: `Xác nhận báo cáo của ${report.fullName}`,
      html: emailBody,
    };
  },

  replyReportWithMsg: (report, msg, staff_name) => {
    return {
      from: fromEmail,
      to: report.email,
      replyTo: report.email,
      subject: `Thông báo về báo cáo "#${report.title}"`,
      html: `
        <div style="padding: 12px 24px;">
            <h1>Tiêu đề: ${report.title}</h1>

            <p style="margin-top:24px">Nội dung: ${report.content}</p>

            <p style="padding: 8px 0">Người báo cáo: ${report.fullName}</p>
            <p style="padding: 8px 0">Số điện thoại liên hệ: ${
              report.phone_number
            }</p>
        </div>

        <hr />

        <p style="font-size: 18; padding: 12px 0">${msg}</p>
        <p style="font-weight: 600">
          Trạng thái: 
          <span style="color: red">${
            report.status === 'pending'
              ? 'Đang xử lý'
              : report.status === 'confirmed'
              ? 'Đã xử lý'
              : 'Bị từ chối. Lý do: ...'
          }</span>
        </p>

        <hr />
        <span style="font-size: 14; font-style: italic">Nếu có thắc mắc, vui lòng liên hệ qua contact.batdongsanvn@gmail.com</span>
      
        <hr />
        <p>Nhân viên hỗ trợ: ${staff_name}</p>
        <p>BĐS Việt Nam.</p>
      `,
    };
  },

  forgetPassword: (email, displayName, username, link) => {
    const emailTemplate = {
      body: {
        name: displayName,
        intro: `Bạn nhận được email này vì bạn đã yêu cầu reset mật khẩu cho tài khoản ${username}`,
        action: {
          instructions: `Để thực hiện reset mật khẩu, vui lòng click vào nút bên dưới`,
          button: {
            color: '#DC4D2F',
            text: 'Reset mật khẩu',
            link: link,
          },
        },
        outro:
          'Yêu cầu chỉ hợp lệ trong 5 phút kể từ lúc bạn yêu cầu reset mật khẩu, vui lòng thực hiện lại nếu yêu cầu hết hạn!',
      },
    };

    const emailBody = mailGenerator.generate(emailTemplate);

    return {
      from: fromEmail,
      to: email,
      subject: 'Yêu cầu reset mật khẩu',
      html: emailBody,
    };
  },

  mailToSellerWhenCreateExchange: (email, buyer, property) => {
    const emailTemplate = {
      body: {
        name: '',
        intro: [
          'Bạn đang có 1 yêu cầu giao dịch trên Batdongsanvn.fun',
          `<b>Nguời mua / thuê:</b> ${buyer.name}`,
          `<b>Số điện thoại:</b> ${buyer.phone}`,
          `<b>Email:</b> ${buyer.email}`,
          `<b>Bài đăng:</b> <a href="${
            config.server.NODE_ENV === 'development'
              ? 'http://localhost:3000'
              : config.client.PRODUCTION_CLIENT_URL
          }/chi-tiet/${property.slug}" target="_blank">${property.title}</a>`,
        ],
        action: {
          instructions: `Xem chi tiết giao dịch ngay:`,
          button: {
            color: '#DC4D2F',
            text: 'Chi tiết giao dịch',
            link: `${
              config.server.NODE_ENV === 'development'
                ? 'http://localhost:3000'
                : config.client.PRODUCTION_CLIENT_URL
            }/quan-ly-giao-dich/yeu-cau`,
          },
        },
        outro:
          ' Vui lòng kiểm tra để thực hiện quá trình thương lượng với người mua / thuê sớm nhất có thể.',
      },
    };

    const emailBody = mailGenerator.generate(emailTemplate);

    return {
      from: fromEmail,
      to: email,
      subject: 'Thông báo giao dịch bất động sản',
      html: emailBody,
    };
  },

  mailWhenExchangeSuccess: (user, property) => {
    const emailTemplate = {
      body: {
        name: user.displayName,
        intro: [
          `Batdongsanvn.fun thông báo`,
          'Giao dịch của bạn đã hoàn thành',
          `<b>Tên bất động sản giao dịch:</b> ${property.title}`,
        ],

        action: {
          instructions: `Xem chi tiết giao dịch ngay:`,
          button: {
            color: '#DC4D2F',
            text: 'Chi tiết giao dịch',
            link: `${
              config.server.NODE_ENV === 'development'
                ? 'http://localhost:3000'
                : config.client.PRODUCTION_CLIENT_URL
            }/quan-ly-giao-dich/yeu-cau`,
          },
        },

        outro:
          'Cảm ơn bạn đã tin tưởng và giao dịch trên nền tảng của chúng tôi!',
      },
    };

    const emailBody = mailGenerator.generate(emailTemplate);

    return {
      from: fromEmail,
      to: user.email,
      subject: 'Thông báo giao dịch thành công',
      html: emailBody,
    };
  },

  mailLockUser: (user, reason) => {
    const emailTemplate = {
      body: {
        name: user.displayName,
        intro: [
          `Batdongsanvn.fun thông báo`,
          `Tài khoản @${user.username} đã bị khóa bởi quản trị viên!`,
          `<b>Lý do:</b> ${reason}`,
        ],

        outro:
          'Nếu có thắc mắc về hành động này của batdongsanvn.fun. Vui lòng liên hệ contact.batdongsanvn.fun@gmail.com!',
      },
    };

    const emailBody = mailGenerator.generate(emailTemplate);

    return {
      from: fromEmail,
      to: user.email,
      subject: 'Khóa tài khoản',
      html: emailBody,
    };
  },
};

const sendMails = {
  // gửi mail cho người báo cáo tin nhà đất
  replyReport: (report) => {
    // report : {fullName, email, title, content}
    nodeMailer.sendMail(mailOptions.replyReport(report), (err, data) => {
      if (err) {
        Logging.error('Send Mail faild', err);
      } else {
        Logging.success(`Send mail to ${report.email} success!`);
      }
    });
  },

  replyReportWithMsg: (report, msg, staff_name) => {
    nodeMailer.sendMail(
      mailOptions.replyReportWithMsg(report, msg, staff_name),
      (err, data) => {
        if (err) {
          Logging.error('Send Mail faild', err);
        } else {
          Logging.success(`Send mail to ${report.email} success!`);
        }
      }
    );
  },

  forgetPassword: (email, displayName, username, link) => {
    nodeMailer.sendMail(
      mailOptions.forgetPassword(email, displayName, username, link),
      (err, data) => {
        if (err) {
          Logging.error('Send Mail faild', err);
        } else {
          Logging.success(`Send mail to ${email} success!`);
        }
      }
    );
  },

  mailToSellerWhenCreateExchange: (email, buyer, property) => {
    nodeMailer.sendMail(
      mailOptions.mailToSellerWhenCreateExchange(email, buyer, property),
      (err, data) => {
        if (err) {
          Logging.error('Send Mail fail!', err);
        } else {
          Logging.success(`Send mail to ${email} success!`);
        }
      }
    );
  },

  mailWhenExchangeComplete: (exchange) => {
    // gửi cho người mua
    nodeMailer.sendMail(
      mailOptions.mailWhenExchangeSuccess(exchange.buyer, exchange.property),
      (err, data) => {
        if (err) {
          Logging.error('Send Mail faild', err);
        } else {
          Logging.success(`Send mail to ${exchange.buyer.email} success!`);
        }
      }
    );

    // gửi cho người bán
    nodeMailer.sendMail(
      mailOptions.mailWhenExchangeSuccess(exchange.seller, exchange.property),
      (err, data) => {
        if (err) {
          Logging.error('Send Mail faild', err);
        } else {
          Logging.success(`Send mail to ${exchange.seller.email} success!`);
        }
      }
    );
  },

  mailWhenLockUser: (user, reason) => {
    nodeMailer.sendMail(mailOptions.mailLockUser(user, reason), (err, data) => {
      if (err) {
        Logging.error('Send Mail fail!', err);
      } else {
        Logging.success(`Send mail to ${user.email} success!`);
      }
    });
  },
};

export default sendMails;
