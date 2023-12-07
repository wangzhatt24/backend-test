import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import { Server } from 'socket.io';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import config from './src/configs/common-config.js';
import swaggerOption from './src/configs/swagger-config.js';
import Logging from './src/library/Logging.js';
import Routes from './src/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middleware
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [...config.client.CLIENT_URL, ...config.client.ADMIN_CLIENT_URL],
    credentials: true,
  },
});

// pass io to req
app.use((req, res, next) => {
  req.io = io;

  next();
});

app.use(
  cors({
    origin: [...config.client.CLIENT_URL, ...config.client.ADMIN_CLIENT_URL],
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(cookieParser());
app.use(
  helmet({
    hidePoweredBy: true,
  })
); // http secure
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// -------- Swagger
const swaggerSpec = swaggerJSDoc(swaggerOption);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// logger
if (config.server.NODE_ENV && config.server.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
  app.use((req, res, next) => {
    const headers = req.headers;

    const hostIp = headers['x-forwarded-for'];

    Logging.info(`IP HOST: ${hostIp}`);

    next();
  });
}

// routes
app.use('/api', Routes);

app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Resource not found!',
  });
});


// connect mongoose
mongoose
  .connect(config.db.DB_URL)
  .then(async () => {
    Logging.success('Connect database Successfully!');

    // start app
    httpServer.listen(config.server.PORT, () => {
      Logging.success(`App start at PORT ${config.server.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
    Logging.error('Connect Database fail!');
  });
