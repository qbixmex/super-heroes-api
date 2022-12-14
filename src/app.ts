import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import fileUpload from 'express-fileupload';

import * as middlewares from './middlewares';
import api from './api';
import { MessageResponse } from './interfaces';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4000',
  ],
}));

app.use(express.json());

//* File Uploads
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
}));

app.get<{}, MessageResponse>('/', (_request, response) => {
  return response.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFount);
app.use(middlewares.errorHandler);

export default app;
