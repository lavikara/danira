import express from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { globalErrorHandler } from './middleware/errorHandler/globalErrorHandler.js';

const app = express();
const PORT = process.env.SERVER_PORT;

import daniraRoute from './routes/danira/daniraRouter.js';
import authRouter from './routes/auth/authRouter.js';
import userRouter from './routes/user/userRouter.js';
import schoolRouter from './routes/school/schoolRouter.js';
import staffRouter from './routes/staff/staffRouter.js';
import studentRouter from './routes/student/studentRouter.js';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(pinoHttp({ logger }));

app.use('/danira', daniraRoute);

app.use('/user', userRouter);

app.use('/school', schoolRouter);

app.use('/staff', staffRouter);

app.use('/student', studentRouter);

app.use('/auth', authRouter);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`SERVER IS UP ON PORT ${PORT}`);
});
