import nodemailer from 'nodemailer';
import config from './common-config.js';

let mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: config.nodemailer.GMAIL_APP_USERNAME,
    pass: config.nodemailer.GMAIL_APP_PASSWORD,
  },
});

export default mailTransporter;
