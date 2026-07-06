import express from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { globalErrorHandler } from './middleware/errorHandler/globalErrorHandler.js';

const app = express();
const PORT = process.env.SERVER_PORT;

import danira from './routes/danira/daniraRouter.js';
import authRouter from './routes/auth/authRouter.js';
import userRouter from './routes/auth/authRouter.js';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(pinoHttp({ logger }));

app.use('/danira', danira);

app.use('/user', userRouter);

app.use('/auth', authRouter);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`SERVER IS UP ON PORT ${PORT}`);
});
