import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const DB_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 5000;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET = process.env.AWS_BUCKET;

const CLIENT_URL = process.env.CLIENT_URL?.split(',');
const ADMIN_CLIENT_URL = process.env.ADMIN_URL?.split(',');
const PRODUCTION_CLIENT_URL = process.env.PRODUCTION_CLIENT_URL;

const GMAIL_APP_USERNAME = process.env.GMAIL_APP_USERNAME;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let COOKIES_OPTIONS = {};

if (NODE_ENV === 'development') {
  COOKIES_OPTIONS = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 4,
  };
} else {
  COOKIES_OPTIONS = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 4,
    sameSite: 'none',
    secure: true,
  };
}

const config = {
  server: {
    PORT,
    NODE_ENV,
  },

  db: {
    DB_URL,
  },

  jwt: {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
  },

  aws: {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_BUCKET,
  },

  nodemailer: {
    GMAIL_APP_PASSWORD,
    GMAIL_APP_USERNAME,
  },

  client: {
    CLIENT_URL, // array
    ADMIN_CLIENT_URL,
    PRODUCTION_CLIENT_URL,
  },

  COOKIES_OPTIONS,
};

export default config;
